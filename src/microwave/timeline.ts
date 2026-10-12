// 전자레인지 편 타임라인 (내레이션: 스타일2 = Laomedeia · friendly)
import longManifest from "../../public/audio/mw-long-s2/manifest.json";
import longCaptions from "../../public/audio/mw-long-s2/captions.json";
import shortManifest from "../../public/audio/mw-short-s2/manifest.json";
import shortCaptions from "../../public/audio/mw-short-s2/captions.json";
import { buildTimeline, type Chunk, type Clip } from "../longform/timeline";
import { LONG, SHORT } from "./script";

const mwLong = buildTimeline(LONG, longManifest as Record<string, Clip>, longCaptions as Record<string, Chunk[]>);
export const MW_LONG_TIMELINE = mwLong.timeline;
export const MW_LONG_DURATION = mwLong.duration;

const mwShort = buildTimeline(SHORT, shortManifest as Record<string, Clip>, shortCaptions as Record<string, Chunk[]>, {
  lead: 0.25,
  gap: 0.3,
  tail: 0.45,
});
export const MW_SHORT_TIMELINE = mwShort.timeline;
export const MW_SHORT_DURATION = mwShort.duration;
