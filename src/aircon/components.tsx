import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { bodyFont, C } from "./theme";

// 장면 배경: 짙은 네이비 그라디언트 + 은은한 빛
export const Backdrop: React.FC<{ glow?: string }> = ({ glow = C.cold }) => {
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 45%, ${glow}22 0%, transparent 55%), linear-gradient(180deg, ${C.bg2} 0%, ${C.bg} 100%)`,
      }}
    />
  );
};

// 이미지가 튀어나오며 등장하고, 둥둥 떠 있는 효과
export const Pic: React.FC<{
  src: string;
  x: number;
  y: number;
  size: number;
  delay?: number;
  float?: number;
  rotate?: number;
  style?: React.CSSProperties;
}> = ({ src, x, y, size, delay = 0, float = 10, rotate = 0, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 140 } });
  return (
    <Img
      src={staticFile(`images/${src}`)}
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        objectFit: "contain",
        scale: String(pop),
        opacity: Math.min(1, pop * 1.5),
        translate: `0px ${Math.sin((frame - delay) / 18) * float}px`,
        rotate: `${rotate + Math.sin((frame - delay) / 25) * 2}deg`,
        filter: "drop-shadow(0 24px 40px rgba(0,0,0,0.45))",
        ...style,
      }}
    />
  );
};

// [단어] 로 감싼 부분은 강조색으로 표시
const renderMarked = (text: string, accent: string) =>
  text.split(/(\[[^\]]+\])/g).map((part, i) =>
    part.startsWith("[") ? (
      <span key={i} style={{ color: accent }}>
        {part.slice(1, -1)}
      </span>
    ) : (
      <span key={i}>{part}</span>
    ),
  );

export type CaptionLine = { from: number; text: string };

// 하단 자막: 시간에 맞춰 줄이 바뀌고, 바뀔 때마다 살짝 튀어오름
export const Captions: React.FC<{ lines: CaptionLine[]; accent?: string }> = ({
  lines,
  accent = C.cold,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const idx = lines.reduce((acc, l, i) => (frame >= l.from ? i : acc), -1);
  if (idx < 0) return null;
  const line = lines[idx];
  const t = frame - line.from;
  const pop = spring({ frame: t, fps, config: { damping: 14, stiffness: 180 } });
  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        right: 80,
        top: 1480,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          fontFamily: bodyFont,
          fontWeight: 900,
          fontSize: 64,
          lineHeight: 1.3,
          color: C.ink,
          textAlign: "center",
          wordBreak: "keep-all",
          padding: "26px 40px",
          borderRadius: 32,
          background: "rgba(5, 10, 25, 0.62)",
          border: "2px solid rgba(255,255,255,0.08)",
          scale: String(interpolate(pop, [0, 1], [0.92, 1])),
          opacity: interpolate(t, [0, 5], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.quad),
          }),
          textShadow: "0 4px 18px rgba(0,0,0,0.5)",
        }}
      >
        {renderMarked(line.text, accent)}
      </div>
    </div>
  );
};

// 큰 제목 텍스트 (장면당 하나만, 꼭 필요할 때만)
export const BigWord: React.FC<{
  children: React.ReactNode;
  y: number;
  delay?: number;
  color?: string;
  size?: number;
  font: string;
}> = ({ children, y, delay = 0, color = C.ink, size = 120, font }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - delay, fps, config: { damping: 11, stiffness: 160 } });
  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        right: 80,
        top: y,
        textAlign: "center",
        fontFamily: font,
        fontSize: size,
        color,
        lineHeight: 1.1,
        scale: String(pop),
        opacity: Math.min(1, pop * 1.4),
        textShadow: "0 8px 30px rgba(0,0,0,0.5)",
        wordBreak: "keep-all",
      }}
    >
      {children}
    </div>
  );
};

// 열 입자: 주황색 동그라미가 from → to 로 흘러감 (반복)
export const HeatFlow: React.FC<{
  from: [number, number];
  to: [number, number];
  count?: number;
  period?: number;
  color?: string;
  start?: number;
  size?: number;
}> = ({ from, to, count = 6, period = 60, color = C.hot, start = 0, size = 34 }) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  return (
    <>
      {new Array(count).fill(0).map((_, i) => {
        const p = (((frame - start) / period + i / count) % 1 + 1) % 1;
        const x = interpolate(p, [0, 1], [from[0], to[0]]);
        const y = interpolate(p, [0, 1], [from[1], to[1]]) + Math.sin(p * Math.PI * 2 + i) * 30;
        const o = interpolate(p, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - size / 2,
              top: y - size / 2,
              width: size,
              height: size,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${color} 0%, ${color}AA 50%, transparent 72%)`,
              opacity: o,
              boxShadow: `0 0 30px ${color}`,
            }}
          />
        );
      })}
    </>
  );
};
