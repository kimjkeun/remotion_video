// 하늘 편 타임라인 (내레이션: 스타일2 = Laomedeia · friendly)
import longManifest from "../../public/audio/sky-long-s2/manifest.json";
import longCaptions from "../../public/audio/sky-long-s2/captions.json";
import shortManifest from "../../public/audio/sky-short-s2/manifest.json";
import shortCaptions from "../../public/audio/sky-short-s2/captions.json";
import { buildTimeline, type Chunk, type Clip } from "../longform/timeline";
import { LONG, SHORT } from "./script";

const skyLong = buildTimeline(LONG, longManifest as Record<string, Clip>, longCaptions as Record<string, Chunk[]>);
export const SKY_LONG_TIMELINE = skyLong.timeline;
export const SKY_LONG_DURATION = skyLong.duration;

const skyShort = buildTimeline(SHORT, shortManifest as Record<string, Clip>, shortCaptions as Record<string, Chunk[]>, {
  lead: 0.25,
  gap: 0.3,
  tail: 0.45,
});
export const SKY_SHORT_TIMELINE = skyShort.timeline;
export const SKY_SHORT_DURATION = skyShort.duration;
