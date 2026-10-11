// 음성 길이(manifest.json)로 문장·장(chapter)의 시작 프레임을 계산합니다.
// 아직 음성이 없는 문장은 글자 수로 길이를 추정합니다.
import manifestJson from "../../public/audio/longform/manifest.json";
import captionsJson from "../../public/audio/longform/captions.json";
import { CHAPTERS, lineKey, type Chapter } from "./script";

export const FPS = 30;
const LEAD = 0.6; // 장 시작 후 첫 문장까지
const GAP = 0.35; // 문장 사이 쉼
const TAIL = 1.0; // 장 마지막 문장 뒤 여유

export type Clip = { src: string; duration: number };
export type Chunk = { text: string; startMs: number; endMs: number };

const manifest = manifestJson as Record<string, Clip>;
const captions = captionsJson as Record<string, Chunk[]>;

export type Line = {
  key: string;
  text: string;
  src: string | null;
  from: number; // 장 시작 기준 프레임
  duration: number;
  chunks: Chunk[];
};

export type ChapterTiming = {
  id: string;
  index: number;
  title: string;
  from: number; // 영상 전체 기준 프레임
  duration: number;
  lines: Line[];
};

const sec = (s: number) => Math.round(s * FPS);

// 대본 + 음성 길이 + 자막으로 타임라인을 만듭니다 (롱폼·쇼츠 공용).
export const buildTimeline = (
  chapters: Chapter[],
  clips: Record<string, Clip>,
  caps: Record<string, Chunk[]>,
  { lead = LEAD, gap = GAP, tail = TAIL } = {},
) => {
  let cursor = 0;
  const timeline: ChapterTiming[] = chapters.map((chapter, index) => {
    let local = sec(lead);
    const lines = chapter.lines.map((text, i) => {
      const key = lineKey(chapter.id, i);
      const clip = clips[key];
      const seconds = clip?.duration ?? 0.6 + text.length * 0.13;
      const line: Line = {
        key,
        text,
        src: clip?.src ?? null,
        from: local,
        duration: sec(seconds),
        // Whisper 자막이 없으면 문장 전체를 한 조각으로 씁니다.
        chunks: caps[key] ?? [{ text, startMs: 0, endMs: seconds * 1000 }],
      };
      local += line.duration + sec(gap);
      return line;
    });
    const timing: ChapterTiming = {
      id: chapter.id,
      index,
      title: chapter.title,
      from: cursor,
      duration: local - sec(gap) + sec(tail),
      lines,
    };
    cursor += timing.duration;
    return timing;
  });
  return { timeline, duration: cursor };
};

const longform = buildTimeline(CHAPTERS, manifest, captions);
export const TIMELINE = longform.timeline;
export const LONGFORM_DURATION = longform.duration;
