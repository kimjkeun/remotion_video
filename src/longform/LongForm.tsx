// 롱폼 본편: 장면(장별 Sequence) + 문장별 내레이션 + Whisper 타이밍 자막
import React from "react";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { C } from "../aircon/theme";
import { ChapterProvider } from "./beat";
import { FPS, LONGFORM_DURATION, TIMELINE, type ChapterTiming } from "./timeline";
import { ChapterBadge, ProgressBar, Subtitle } from "./ui";
import { C00Intro, C01Rule, C02Pump } from "./chapters/Intro";
import { C03Evaporate, C04Pressure } from "./chapters/Physics";
import { Cycle } from "./chapters/Cycle";
import { C06Summary, C07Water, C08Fridge, C09Tips, C10Outro } from "./chapters/Extras";

const VISUALS: Record<string, React.FC> = {
  c00: C00Intro,
  c01: C01Rule,
  c02: C02Pump,
  c03: C03Evaporate,
  c04: C04Pressure,
  c05: Cycle,
  c06: C06Summary,
  c07: C07Water,
  c08: C08Fridge,
  c09: C09Tips,
  c10: C10Outro,
};

const FADE = 12;

// 장 하나: 화면 + 배지 + 자막. 앞뒤로 살짝 페이드
export const ChapterScene: React.FC<{ chapter: ChapterTiming; visuals: Record<string, React.FC> }> = ({ chapter, visuals }) => {
  const frame = useCurrentFrame();
  const Visual = visuals[chapter.id];
  const opacity = interpolate(
    frame,
    [0, FADE, chapter.duration - FADE, chapter.duration],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // 지금 보여 줄 자막 조각
  let subtitle: { text: string; keyFrame: number } | null = null;
  for (const line of chapter.lines) {
    for (const chunk of line.chunks) {
      const start = line.from + Math.round((chunk.startMs / 1000) * FPS);
      const end = line.from + Math.round((chunk.endMs / 1000) * FPS);
      if (frame >= start && frame < end + 6) {
        subtitle = { text: chunk.text, keyFrame: start };
      }
    }
  }

  return (
    <ChapterProvider chapter={chapter}>
      <AbsoluteFill style={{ opacity }}>
        <Visual />
        <ChapterBadge index={chapter.index} title={chapter.title} />
        {subtitle ? <Subtitle text={subtitle.text} keyFrame={subtitle.keyFrame} /> : null}
      </AbsoluteFill>
      {chapter.lines.map((line) =>
        line.src ? (
          <Sequence key={line.key} from={line.from} durationInFrames={line.duration + 6} name={line.key} layout="none">
            <Audio src={staticFile(line.src)} />
          </Sequence>
        ) : null,
      )}
    </ChapterProvider>
  );
};

export const LongForm: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      {TIMELINE.map((chapter) => (
        <Sequence key={chapter.id} from={chapter.from} durationInFrames={chapter.duration} name={`${chapter.id} ${chapter.title}`}>
          <ChapterScene chapter={chapter} visuals={VISUALS} />
        </Sequence>
      ))}
      <ProgressBar total={LONGFORM_DURATION} marks={TIMELINE.slice(1).map((c) => c.from)} />
    </AbsoluteFill>
  );
};
