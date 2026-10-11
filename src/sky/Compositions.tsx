// 하늘 편 컴포지션 본체: 롱폼(1920x1080) / 쇼츠(1080x1920)
import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { C } from "../aircon/theme";
import { ChapterScene } from "../longform/LongForm";
import { ProgressBar } from "../longform/ui";
import { ShortsEpisode } from "../shorts2/ShortsTTS";
import { SKY_LONG_VISUALS } from "./LongScenes";
import { SKY_SHORT_VISUALS } from "./ShortScenes";
import { SKY_LONG_DURATION, SKY_LONG_TIMELINE, SKY_SHORT_TIMELINE } from "./timeline";

export const SkyLong: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.bg }}>
    {SKY_LONG_TIMELINE.map((chapter) => (
      <Sequence key={chapter.id} from={chapter.from} durationInFrames={chapter.duration} name={`${chapter.id} ${chapter.title}`}>
        <ChapterScene chapter={chapter} visuals={SKY_LONG_VISUALS} />
      </Sequence>
    ))}
    <ProgressBar total={SKY_LONG_DURATION} marks={SKY_LONG_TIMELINE.slice(1).map((c) => c.from)} />
  </AbsoluteFill>
);

export const SkyShort: React.FC = () => (
  <ShortsEpisode timeline={SKY_SHORT_TIMELINE} visuals={SKY_SHORT_VISUALS} label="1분 과학 · 하늘" />
);
