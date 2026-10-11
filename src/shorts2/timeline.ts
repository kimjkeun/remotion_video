// 1분 쇼츠(TTS 버전) 타임라인: 내레이터 스타일(1~3)마다 음성 길이가 달라서 따로 계산합니다.
// 쇼츠는 장 사이 여유를 짧게 둡니다.
import m1 from "../../public/audio/shorts/manifest.json";
import c1 from "../../public/audio/shorts/captions.json";
import m2 from "../../public/audio/shorts-s2/manifest.json";
import c2 from "../../public/audio/shorts-s2/captions.json";
import m3 from "../../public/audio/shorts-s3/manifest.json";
import c3 from "../../public/audio/shorts-s3/captions.json";
import { buildTimeline, type Chunk, type Clip } from "../longform/timeline";
import { CHAPTERS } from "./script";

const DATA: Record<number, [unknown, unknown]> = {
  1: [m1, c1],
  2: [m2, c2],
  3: [m3, c3],
};

export const shortsTimeline = (style: number) => {
  const [manifest, captions] = DATA[style] ?? DATA[1];
  return buildTimeline(CHAPTERS, manifest as Record<string, Clip>, captions as Record<string, Chunk[]>, {
    lead: 0.25,
    gap: 0.3,
    tail: 0.45,
  });
};

export const SHORTS_STYLES = Object.keys(DATA).map(Number);
