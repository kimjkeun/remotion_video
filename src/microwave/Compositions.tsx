// 전자레인지 편 컴포지션 본체: 롱폼(1920x1080) / 쇼츠(1080x1920)
import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { C } from "../aircon/theme";
import { ChapterScene } from "../longform/LongForm";
import { ProgressBar } from "../longform/ui";
import { ShortsEpisode } from "../shorts2/ShortsTTS";
import { MW_LONG_VISUALS } from "./LongScenes";
import { MW_SHORT_VISUALS } from "./ShortScenes";
import { MW_LONG_DURATION, MW_LONG_TIMELINE, MW_SHORT_TIMELINE } from "./timeline";

export const MwLong: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.bg }}>
    {MW_LONG_TIMELINE.map((chapter) => (
      <Sequence key={chapter.id} from={chapter.from} durationInFrames={chapter.duration} name={`${chapter.id} ${chapter.title}`}>
        <ChapterScene chapter={chapter} visuals={MW_LONG_VISUALS} />
      </Sequence>
    ))}
    <ProgressBar total={MW_LONG_DURATION} marks={MW_LONG_TIMELINE.slice(1).map((c) => c.from)} />
  </AbsoluteFill>
);

export const MwShort: React.FC = () => (
  <ShortsEpisode timeline={MW_SHORT_TIMELINE} visuals={MW_SHORT_VISUALS} label="1분 과학 · 전자레인지" />
);
