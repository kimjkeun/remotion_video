// 1분 쇼츠(TTS 버전): 장면 + 문장별 내레이션 + Whisper 타이밍 자막 (세로 1080x1920)
import React from "react";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { Captions, type CaptionLine } from "../aircon/components";
import { bodyFont, C } from "../aircon/theme";
import { ChapterProvider } from "../longform/beat";
import { FPS, type ChapterTiming } from "../longform/timeline";
import { SH1Hook, SH2Rule, SH3Cycle, SH4Outro } from "./Scenes";
import { shortsTimeline } from "./timeline";

const VISUALS: Record<string, React.FC> = { s1: SH1Hook, s2: SH2Rule, s3: SH3Cycle, s4: SH4Outro };
const FADE = 8;

const Scene: React.FC<{ chapter: ChapterTiming; visuals: Record<string, React.FC> }> = ({ chapter, visuals }) => {
  const frame = useCurrentFrame();
  const Visual = visuals[chapter.id];
  // Whisper 자막 조각 → 장 기준 프레임
  const lines: CaptionLine[] = chapter.lines.flatMap((line) =>
    line.chunks.map((chunk) => ({ from: line.from + Math.round((chunk.startMs / 1000) * FPS), text: chunk.text })),
  );
  return (
    <ChapterProvider chapter={chapter}>
      <AbsoluteFill
        style={{
          opacity: interpolate(frame, [0, FADE, chapter.duration - FADE, chapter.duration], [0, 1, 1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <Visual />
        <Captions lines={lines} accent={C.warm} />
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

// 쇼츠 한 편: 장면 목록 + 타임라인 + 상단 라벨 (에피소드 공용)
export const ShortsEpisode: React.FC<{ timeline: ChapterTiming[]; visuals: Record<string, React.FC>; label: string }> = ({
  timeline,
  visuals,
  label,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      {timeline.map((chapter) => (
        <Sequence key={chapter.id} from={chapter.from} durationInFrames={chapter.duration} name={`${chapter.id} ${chapter.title}`}>
          <Scene chapter={chapter} visuals={visuals} />
        </Sequence>
      ))}
      {/* 상단 시리즈 라벨 */}
      <div style={{ position: "absolute", top: 140, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div
          style={{
            fontFamily: bodyFont,
            fontWeight: 900,
            fontSize: 46,
            color: C.bg,
            background: C.cold,
            padding: "12px 34px",
            borderRadius: 999,
          }}
        >
          {label}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export type ShortsTTSProps = { style: number };

// 에어컨 편 쇼츠. style: 내레이터 스타일 번호 (src/narrators.ts)
export const ShortsTTS: React.FC<ShortsTTSProps> = ({ style }) => (
  <ShortsEpisode timeline={shortsTimeline(style).timeline} visuals={VISUALS} label="1분 과학 · 에어컨" />
);
