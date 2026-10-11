/**
 * 롱폼 영상의 자막을 유튜브 업로드용 SRT 파일로 내보냅니다.
 * 영상 화면 자막과 같은 데이터(timeline + Whisper captions.json)를 쓰므로 타이밍이 일치합니다.
 *
 *   npm run srt              에어컨 편 → out/aircon-longform.srt
 *   npm run srt -- sky       하늘 편   → out/sky-longform.srt
 */
import fs from "node:fs";
import path from "node:path";
import { FPS, TIMELINE } from "../src/longform/timeline";
import { SKY_LONG_TIMELINE } from "../src/sky/timeline";
import { ROOT } from "./tts-core";

const stamp = (ms: number) => {
  const t = Math.max(0, Math.round(ms));
  const h = Math.floor(t / 3600000);
  const m = Math.floor((t % 3600000) / 60000);
  const s = Math.floor((t % 60000) / 1000);
  const r = t % 1000;
  const p = (n: number, w = 2) => String(n).padStart(w, "0");
  return `${p(h)}:${p(m)}:${p(s)},${p(r, 3)}`;
};

const EPISODES = {
  aircon: { timeline: TIMELINE, file: "aircon-longform.srt" },
  sky: { timeline: SKY_LONG_TIMELINE, file: "sky-longform.srt" },
};
const name = (process.argv[2] ?? "aircon") as keyof typeof EPISODES;
const episode = EPISODES[name];
if (!episode) {
  throw new Error(`없는 에피소드: ${name} (사용 가능: ${Object.keys(EPISODES).join(", ")})`);
}

const cues: { start: number; end: number; text: string }[] = [];
for (const chapter of episode.timeline) {
  for (const line of chapter.lines) {
    const lineStartMs = ((chapter.from + line.from) / FPS) * 1000;
    for (const chunk of line.chunks) {
      cues.push({ start: lineStartMs + chunk.startMs, end: lineStartMs + chunk.endMs, text: chunk.text });
    }
  }
}
// 다음 자막과 겹치지 않게 끝 시각을 정리
for (let i = 0; i < cues.length - 1; i++) {
  cues[i].end = Math.min(cues[i].end, cues[i + 1].start - 1);
}

const srt = cues
  .map((c, i) => `${i + 1}\n${stamp(c.start)} --> ${stamp(c.end)}\n${c.text}\n`)
  .join("\n");
const outDir = path.join(ROOT, "out");
fs.mkdirSync(outDir, { recursive: true });
const file = path.join(outDir, episode.file);
fs.writeFileSync(file, srt, "utf-8");
console.log(`자막 ${cues.length}개 → ${path.relative(ROOT, file)} (마지막 자막 ${stamp(cues[cues.length - 1].end)})`);
