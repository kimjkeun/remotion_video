// 장(chapter) 안에서 "지금 몇 번째 문장(beat)을 읽는 중인지"를 알려 주는 도구.
// 화면 요소는 at(i) (i번째 문장이 시작되는 프레임)에 맞춰 등장합니다.
import React, { createContext, useContext } from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { ChapterTiming } from "./timeline";

const ChapterContext = createContext<ChapterTiming | null>(null);

export const ChapterProvider: React.FC<{ chapter: ChapterTiming; children: React.ReactNode }> = ({
  chapter,
  children,
}) => <ChapterContext.Provider value={chapter}>{children}</ChapterContext.Provider>;

export const useBeat = () => {
  const chapter = useContext(ChapterContext);
  if (!chapter) throw new Error("useBeat 는 ChapterProvider 안에서만 쓸 수 있습니다");
  const frame = useCurrentFrame();
  const starts = chapter.lines.map((l) => l.from);
  const beat = starts.reduce((acc, s, i) => (frame >= s - 6 ? i : acc), 0);
  // 문장 시작보다 살짝(0.2초) 먼저 화면이 바뀌어야 말과 그림이 맞아 보입니다.
  const at = (i: number) => (starts[Math.min(i, starts.length - 1)] ?? 0) - 6;
  return { frame, beat, at, chapter };
};

// i번째 문장 시점부터 0 → 1 로 튀어오르는 값
export const usePop = (from: number, damping = 13) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - from, fps, config: { damping, stiffness: 150 } });
};
