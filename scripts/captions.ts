/**
 * 문장별 TTS 음성을 로컬 Whisper 로 단어(토큰) 단위 받아쓰기 해서 자막 타이밍을 만듭니다.
 *
 *   npm run captions
 *
 * - 화면에 보이는 글자는 원문 대본 그대로 씁니다 (받아쓰기 오타가 자막에 나오지 않게).
 * - 원문을 짧은 자막 조각(최대 약 20자)으로 나누고, 각 조각이 시작되는 시각을
 *   Whisper 토큰 타임스탬프에서 찾아 맞춥니다.
 *
 *   npm run captions -- --project=shorts   쇼츠 대본 (기본: longform)
 *
 * 결과: public/audio/<프로젝트>/captions.json
 *   { "c05-07": [{ text, startMs, endMs }, ...], ... }
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { toCaptions, transcribe } from "@remotion/install-whisper-cpp";
import { lineKey } from "../src/longform/script";
import { pickProject } from "./projects";
import { tokens } from "./align";
import { loadDotEnv, parseWav, ROOT, writeWav } from "./tts-core";
import { ensureWhisper, modelFor, to16kMono, WHISPER_VERSION } from "./whisper";
import type { ClipInfo } from "./tts";

const MAX_CHARS = 20;
const MIN_CHARS = 6;

export type CaptionChunk = { text: string; startMs: number; endMs: number };

// 원문 → 자막 조각: 문장부호에서 먼저 끊고, 길면 띄어쓰기 기준으로 반씩 나눕니다.
const chunkText = (text: string): string[] => {
  const phrases = text
    .split(/(?<=[,.?!])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const out: string[] = [];
  const split = (s: string) => {
    if (s.length <= MAX_CHARS) {
      out.push(s);
      return;
    }
    const words = s.split(" ");
    if (words.length < 2) {
      out.push(s);
      return;
    }
    // 글자 수가 가장 고르게 나뉘는 띄어쓰기 위치
    let best = 1;
    let bestDiff = Infinity;
    for (let k = 1; k < words.length; k++) {
      const diff = Math.abs(words.slice(0, k).join(" ").length - words.slice(k).join(" ").length);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = k;
      }
    }
    split(words.slice(0, best).join(" "));
    split(words.slice(best).join(" "));
  };
  phrases.forEach(split);
  // "반대로," 처럼 너무 짧은 조각은 금방 사라지므로 다음 조각과 합칩니다.
  const merged: string[] = [];
  for (const piece of out) {
    const prev = merged[merged.length - 1];
    if (prev !== undefined && prev.length < MIN_CHARS && prev.length + piece.length + 1 <= MAX_CHARS + 6) {
      merged[merged.length - 1] = `${prev} ${piece}`;
    } else {
      merged.push(piece);
    }
  }
  return merged;
};

const main = async () => {
  loadDotEnv();
  const project = pickProject(process.argv.slice(2));
  const dir = path.join(ROOT, "public", "audio", project.name);
  const manifest: Record<string, ClipInfo> = JSON.parse(
    fs.readFileSync(path.join(dir, "manifest.json"), "utf-8"),
  );
  const model = modelFor("ko");
  const whisperPath = await ensureWhisper(ROOT, model);
  const result: Record<string, CaptionChunk[]> = {};

  const lines = project.chapters.flatMap((c) => c.lines.map((text, i) => ({ key: lineKey(c.id, i), text })));
  for (const [n, { key, text }] of lines.entries()) {
    const clip = manifest[key];
    if (!clip) {
      console.warn(`  ${key}: 음성이 없습니다 (npm run tts 먼저)`);
      continue;
    }
    const durationMs = clip.duration * 1000;
    const tmp = path.join(os.tmpdir(), `aircon-cap-${process.pid}-${n}.wav`);
    fs.writeFileSync(tmp, writeWav(to16kMono(parseWav(fs.readFileSync(path.join(ROOT, "public", clip.src))))));
    let words: { startMs: number; count: number }[] = [];
    try {
      const output = await transcribe({
        inputPath: tmp,
        whisperPath,
        whisperCppVersion: WHISPER_VERSION,
        model,
        language: "ko",
        tokenLevelTimestamps: true,
        printOutput: false,
      });
      const { captions } = toCaptions({ whisperCppOutput: output });
      words = captions.map((c) => ({ startMs: c.startMs, count: tokens(c.text).length }));
    } finally {
      fs.rmSync(tmp, { force: true });
    }

    const chunks = chunkText(text);
    const origCounts = chunks.map((c) => Math.max(1, tokens(c).length));
    const origTotal = origCounts.reduce((a, b) => a + b, 0);
    const heardTotal = words.reduce((a, w) => a + w.count, 0);

    // 조각 j 가 시작하는 원문 글자 위치 → 받아쓴 글자 위치(비율 보정) → 그 글자가 들린 시각
    const startOf = (origIndex: number) => {
      if (heardTotal === 0) return (origIndex / origTotal) * durationMs;
      const target = (origIndex / origTotal) * heardTotal;
      let acc = 0;
      for (const w of words) {
        if (acc + w.count > target) return w.startMs;
        acc += w.count;
      }
      return words[words.length - 1].startMs;
    };
    const starts: number[] = [];
    let before = 0;
    for (const [j, count] of origCounts.entries()) {
      // 조각마다 최소 0.6초는 보이게 합니다.
      starts.push(j === 0 ? 0 : Math.max(startOf(before), starts[j - 1] + 600));
      before += count;
    }
    result[key] = chunks.map((c, j) => ({
      text: c,
      startMs: Math.round(Math.min(starts[j], durationMs - 200)),
      endMs: Math.round(j < chunks.length - 1 ? Math.min(starts[j + 1], durationMs) : durationMs),
    }));
    console.log(
      `  [${n + 1}/${lines.length}] ${key}: ` +
        result[key].map((c) => `${(c.startMs / 1000).toFixed(1)}s "${c.text}"`).join(" | "),
    );
  }
  fs.writeFileSync(path.join(dir, "captions.json"), JSON.stringify(result, null, 2) + "\n");
  console.log(`\n완료: ${Object.keys(result).length}문장 자막 → public/audio/${project.name}/captions.json`);
};

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
