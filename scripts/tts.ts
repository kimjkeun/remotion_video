/**
 * 롱폼 내레이션을 Gemini TTS 로 만들고, 로컬 Whisper 로 원문대로 읽혔는지 검증합니다.
 * (wordtalktalk/video/scripts/generate-tts.ts 와 같은 방식)
 *
 *   npm run tts            새로 바뀐 묶음만 생성
 *   npm run tts -- --force 전부 다시 생성
 *   npm run tts -- --redo=c05a,c09   특정 묶음만 다시 생성
 *
 * 묶음: 장(chapter) 단위, 10문장이 넘는 장은 10문장씩 나눕니다 (c05a, c05b, ...).
 *   npm run tts -- --project=shorts   쇼츠 대본 (기본: longform)
 *
 * 결과: public/audio/<프로젝트>/<키>.wav + manifest.json
 */
import fs from "node:fs";
import path from "node:path";
import { lineKey, type Chapter } from "../src/longform/script";
import { pickProject } from "./projects";
import type { AudioRequest } from "./types";
import {
  cacheFile,
  checkVoices,
  DailyQuotaError,
  groupHash,
  loadDotEnv,
  parseWav,
  pcmDuration,
  ROOT,
  synthesizeGroup,
  writeWav,
  type Group,
  type Piece,
} from "./tts-core";

const GROUP_SIZE = 10;

export type ClipInfo = {
  src: string;
  duration: number;
  hash: string;
  heard: string;
  match: number;
  verified: boolean;
};

const buildGroups = (chapters: Chapter[], narrator: { voice: string; style: string }): Group[] => {
  const groups: Group[] = [];
  for (const chapter of chapters) {
    const items: AudioRequest[] = chapter.lines.map((text, i) => ({
      key: lineKey(chapter.id, i),
      lang: "ko",
      fileKey: lineKey(chapter.id, i),
      label: "narrator",
      text,
      voice: narrator.voice,
      style: narrator.style,
    }));
    const parts = Math.ceil(items.length / GROUP_SIZE);
    for (let p = 0; p < parts; p++) {
      groups.push({
        id: parts > 1 ? `${chapter.id}${String.fromCharCode(97 + p)}` : chapter.id,
        items: items.slice(p * GROUP_SIZE, (p + 1) * GROUP_SIZE),
      });
    }
  }
  return groups;
};

const main = async () => {
  loadDotEnv();
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY 가 없습니다. .env 에 GEMINI_API_KEY=... 를 추가하세요.");
    process.exit(1);
  }
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const redo = new Set(
    args.filter((a) => a.startsWith("--redo=")).flatMap((a) => a.slice(7).split(",")).filter(Boolean),
  );
  const rpm = Number(process.env.TTS_RPM) || 10;
  const project = pickProject(args);
  await checkVoices([project.narrator.voice], apiKey);

  const dir = path.join(ROOT, "public", "audio", project.name);
  const cacheDir = path.join(ROOT, "tts-cache", project.name);
  const manifestPath = path.join(dir, "manifest.json");
  fs.mkdirSync(dir, { recursive: true });
  fs.mkdirSync(cacheDir, { recursive: true });

  const groups = buildGroups(project.chapters, project.narrator);
  const requests = groups.flatMap((g) => g.items);
  const previous: Record<string, ClipInfo> = fs.existsSync(manifestPath)
    ? JSON.parse(fs.readFileSync(manifestPath, "utf-8"))
    : {};
  const manifest: Record<string, ClipInfo> = {};
  const saveManifest = () => {
    const ordered = Object.fromEntries(
      requests.filter((r) => manifest[r.key]).map((r) => [r.key, manifest[r.key]]),
    );
    fs.writeFileSync(manifestPath, JSON.stringify(ordered, null, 2) + "\n");
  };

  const isReusable = (group: Group, hash: string) =>
    !force &&
    !redo.has(group.id) &&
    group.items.every((r) => {
      const prev = previous[r.key];
      return prev?.hash === hash && fs.existsSync(path.join(ROOT, "public", prev.src));
    });

  console.log(`문장 ${requests.length}개, 묶음 ${groups.length}개`);
  for (const [n, group] of groups.entries()) {
    const hash = groupHash(group);
    const reused = isReusable(group, hash);
    let pieces: Piece[];
    if (reused) {
      pieces = group.items.map((r) => ({
        pcm: parseWav(fs.readFileSync(path.join(ROOT, "public", previous[r.key].src))),
        heard: previous[r.key].heard,
        match: previous[r.key].match,
        verified: previous[r.key].verified,
      }));
    } else {
      console.log(`  [${n + 1}/${groups.length}] ${group.id} — 문장 ${group.items.length}개`);
      try {
        pieces = await synthesizeGroup(group, hash, cacheDir, apiKey, rpm, !force && !redo.has(group.id));
      } catch (err) {
        saveManifest();
        console.error(
          err instanceof DailyQuotaError
            ? "\n일일 사용 한도에 도달했습니다. 한도가 초기화된 뒤 다시 실행하면 이어서 진행합니다."
            : `\n${group.id} 생성 실패. 다시 실행하면 이어서 진행합니다.`,
        );
        throw err;
      }
    }
    group.items.forEach((r, i) => {
      const fileName = `${r.fileKey}.wav`;
      if (!reused) {
        fs.writeFileSync(path.join(dir, fileName), writeWav(pieces[i].pcm));
      }
      manifest[r.key] = {
        src: `audio/${project.name}/${fileName}`,
        duration: Number(pcmDuration(pieces[i].pcm).toFixed(3)),
        hash,
        heard: pieces[i].heard,
        match: Number(pieces[i].match.toFixed(2)),
        verified: pieces[i].verified,
      };
      if (!reused) {
        const mark = pieces[i].verified ? "✓" : "⚠";
        console.log(`      ${mark} ${r.fileKey} ${manifest[r.key].duration.toFixed(1)}s "${r.text}"`);
      }
    });
    saveManifest();
  }

  // 현재 묶음에 해당하지 않는 보관 음성 정리
  const keep = new Set(groups.map((g) => path.basename(cacheFile(cacheDir, g, groupHash(g)))));
  for (const file of fs.readdirSync(cacheDir)) {
    if (!keep.has(file)) fs.unlinkSync(path.join(cacheDir, file));
  }

  const total = Object.values(manifest).reduce((s, c) => s + c.duration, 0);
  console.log(`\n완료: 음성 합계 ${total.toFixed(1)}초`);
  const doubtful = requests.filter((r) => !manifest[r.key].verified);
  if (doubtful.length > 0) {
    console.warn(`\n⚠ Whisper 검증을 통과하지 못한 문장 ${doubtful.length}개 — 직접 들어 보세요:`);
    for (const r of doubtful) {
      console.warn(`   ${r.fileKey}: 원문 "${r.text}" / 들린 내용 "${manifest[r.key].heard}"`);
    }
  }
};

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
