// 롱폼(1920x1080) 공용 화면 요소
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { bodyFont, C, headFont } from "../aircon/theme";
import { usePop } from "./beat";

export { Pic, HeatFlow } from "../aircon/components";

export const Stage: React.FC<{ glow?: string; children: React.ReactNode }> = ({ glow = C.cold, children }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(circle at 50% 42%, ${glow}1F 0%, transparent 60%), linear-gradient(180deg, ${C.bg2} 0%, ${C.bg} 100%)`,
    }}
  >
    {children}
  </AbsoluteFill>
);

// 어떤 요소든 from 프레임에 튀어나오게 감쌉니다 (until 이 있으면 그때 사라짐)
export const Appear: React.FC<{
  from: number;
  until?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ from, until, children, style }) => {
  const frame = useCurrentFrame();
  const pop = usePop(from);
  if (frame < from) return null;
  const out = until === undefined ? 1 : interpolate(frame, [until - 8, until], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (out <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: Math.min(1, pop * 1.5) * out,
        scale: String(interpolate(pop, [0, 1], [0.9, 1])),
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// 큰 제목 글자
export const Big: React.FC<{
  x: number;
  y: number;
  w?: number;
  size?: number;
  color?: string;
  children: React.ReactNode;
}> = ({ x, y, w = 1200, size = 110, color = C.ink, children }) => (
  <div
    style={{
      position: "absolute",
      left: x - w / 2,
      width: w,
      top: y - size * 0.6,
      textAlign: "center",
      fontFamily: headFont,
      fontSize: size,
      lineHeight: 1.15,
      color,
      textShadow: "0 8px 30px rgba(0,0,0,0.5)",
      wordBreak: "keep-all",
    }}
  >
    {children}
  </div>
);

// 설명 카드 (라벨 + 큰 값)
export const ValueCard: React.FC<{
  x: number;
  y: number;
  w?: number;
  label: string;
  value: string;
  color: string;
  dim?: boolean;
}> = ({ x, y, w = 360, label, value, color, dim }) => (
  <div
    style={{
      position: "absolute",
      left: x - w / 2,
      top: y - 110,
      width: w,
      height: 220,
      borderRadius: 36,
      background: `${color}1F`,
      border: `6px solid ${color}`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: bodyFont,
      fontWeight: 900,
      opacity: dim ? 0.45 : 1,
    }}
  >
    <div style={{ fontSize: 46, color: C.dim }}>{label}</div>
    <div style={{ fontSize: 96, color, lineHeight: 1.05 }}>{value}</div>
  </div>
);

// 짧은 문장 카드
export const TextCard: React.FC<{
  x: number;
  y: number;
  w?: number;
  color?: string;
  size?: number;
  children: React.ReactNode;
}> = ({ x, y, w = 620, color = C.cold, size = 56, children }) => (
  <div
    style={{
      position: "absolute",
      left: x - w / 2,
      top: y,
      width: w,
      transform: "translateY(-50%)",
      padding: "26px 30px",
      borderRadius: 32,
      background: "rgba(5,10,25,0.72)",
      border: `5px solid ${color}`,
      textAlign: "center",
      fontFamily: bodyFont,
      fontWeight: 900,
      fontSize: size,
      lineHeight: 1.3,
      color: C.ink,
      wordBreak: "keep-all",
    }}
  >
    {children}
  </div>
);

// 가로 화살표 (from → to), 위에 라벨
export const Arrow: React.FC<{
  x1: number;
  x2: number;
  y: number;
  color?: string;
  label?: string;
  blocked?: boolean;
}> = ({ x1, x2, y, color = C.hot, label, blocked }) => {
  const frame = useCurrentFrame();
  const left = Math.min(x1, x2);
  const width = Math.abs(x2 - x1);
  const dir = x2 > x1 ? 1 : -1;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left,
          top: y - 8,
          width,
          height: 16,
          borderRadius: 8,
          background: blocked ? "rgba(255,255,255,0.25)" : color,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: (dir > 0 ? x2 : x2 - 60) + (dir > 0 ? -30 : 30),
          top: y - 40,
          width: 0,
          height: 0,
          borderTop: "40px solid transparent",
          borderBottom: "40px solid transparent",
          [dir > 0 ? "borderLeft" : "borderRight"]: `60px solid ${blocked ? "rgba(255,255,255,0.25)" : color}`,
        }}
      />
      {label ? (
        <div
          style={{
            position: "absolute",
            left,
            width,
            top: y - 100,
            textAlign: "center",
            fontFamily: bodyFont,
            fontWeight: 900,
            fontSize: 48,
            color: blocked ? C.dim : color,
            translate: `0px ${Math.sin(frame / 8) * 4}px`,
          }}
        >
          {label}
        </div>
      ) : null}
      {blocked ? (
        <div
          style={{
            position: "absolute",
            left: left + width / 2 - 70,
            top: y - 80,
            width: 140,
            textAlign: "center",
            fontSize: 140,
            lineHeight: 1,
            color: "#FF3B4E",
            fontFamily: headFont,
            textShadow: "0 6px 20px rgba(0,0,0,0.5)",
          }}
        >
          ✕
        </div>
      ) : null}
    </>
  );
};

// 빨간 ✕ 도장
export const Cross: React.FC<{ x: number; y: number; size?: number; from: number }> = ({ x, y, size = 260, from }) => {
  const pop = usePop(from, 9);
  const frame = useCurrentFrame();
  if (frame < from) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size,
        lineHeight: 1,
        color: "#FF3B4E",
        fontFamily: headFont,
        opacity: Math.min(1, pop * 3),
        scale: String(interpolate(pop, [0, 1], [2, 1])),
        textShadow: "0 6px 24px rgba(0,0,0,0.6)",
      }}
    >
      ✕
    </div>
  );
};

// 물방울·수증기 같은 작은 입자가 위/아래로 떠다님
export const Particles: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  count?: number;
  color?: string;
  dir?: 1 | -1; // 1: 아래로, -1: 위로
  size?: number;
  period?: number;
  start?: number;
}> = ({ x, y, w, h, count = 12, color = C.coolGas, dir = -1, size = 22, period = 70, start = 0 }) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  return (
    <>
      {new Array(count).fill(0).map((_, i) => {
        const p = ((((frame - start) / period + i / count) % 1) + 1) % 1;
        const px = x + ((i * 97) % w) + Math.sin(p * 6 + i) * 14;
        const py = dir < 0 ? y + h - p * h : y + p * h;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: px - size / 2,
              top: py - size / 2,
              width: size,
              height: size * (dir > 0 ? 1.3 : 1),
              borderRadius: dir > 0 ? "50% 50% 50% 50% / 60% 60% 40% 40%" : "50%",
              background: color,
              opacity: interpolate(p, [0, 0.15, 0.85, 1], [0, 0.85, 0.85, 0]),
              boxShadow: `0 0 14px ${color}`,
            }}
          />
        );
      })}
    </>
  );
};

// 방 안 / 바깥 그림 (벽으로 나뉜 두 칸 + 온도)
export const RoomOutside: React.FC<{
  roomTemp: string;
  outTemp: string;
  roomColor: string;
  outColor: string;
  y?: number;
}> = ({ roomTemp, outTemp, roomColor, outColor, y = 470 }) => (
  <>
    {[
      { x: 560, label: "방 안", temp: roomTemp, color: roomColor },
      { x: 1360, label: "바깥", temp: outTemp, color: outColor },
    ].map((b) => (
      <div
        key={b.label}
        style={{
          position: "absolute",
          left: b.x - 330,
          top: y - 280,
          width: 660,
          height: 560,
          borderRadius: 44,
          background: `${b.color}1A`,
          border: `6px solid ${b.color}`,
          fontFamily: bodyFont,
          fontWeight: 900,
        }}
      >
        <div style={{ position: "absolute", left: 32, top: 20, fontSize: 48, color: C.dim }}>{b.label}</div>
        <div style={{ position: "absolute", right: 32, top: 14, fontSize: 72, color: b.color }}>{b.temp}</div>
      </div>
    ))}
  </>
);

// ---------- 화면 공통 오버레이 ----------

export const ChapterBadge: React.FC<{ index: number; title: string }> = ({ index, title }) => {
  const pop = usePop(0);
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        top: 44,
        display: "flex",
        alignItems: "center",
        gap: 18,
        fontFamily: bodyFont,
        fontWeight: 900,
        opacity: pop,
        translate: `${interpolate(pop, [0, 1], [-40, 0])}px 0px`,
      }}
    >
      {index > 0 ? (
        <div
          style={{
            background: C.cold,
            color: C.bg,
            fontSize: 34,
            padding: "6px 20px",
            borderRadius: 999,
          }}
        >
          {String(index).padStart(2, "0")}
        </div>
      ) : null}
      <div style={{ fontSize: 40, color: C.ink }}>{title}</div>
    </div>
  );
};

// 자막: Whisper 타이밍에 맞춰 조각이 바뀜
export const Subtitle: React.FC<{ text: string; keyFrame: number }> = ({ text, keyFrame }) => {
  const frame = useCurrentFrame();
  const t = frame - keyFrame;
  return (
    <div style={{ position: "absolute", left: 160, right: 160, top: 900, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          fontFamily: bodyFont,
          fontWeight: 900,
          fontSize: 58,
          lineHeight: 1.25,
          color: C.ink,
          textAlign: "center",
          padding: "14px 40px",
          borderRadius: 24,
          background: "rgba(5,10,25,0.7)",
          wordBreak: "keep-all",
          opacity: interpolate(t, [0, 4], [0.4, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          translate: `0px ${interpolate(t, [0, 5], [8, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px`,
        }}
      >
        {text}
      </div>
    </div>
  );
};

// 영상 하단 진행 바 (장 구분선 포함)
export const ProgressBar: React.FC<{ total: number; marks: number[] }> = ({ total, marks }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 10, background: "rgba(255,255,255,0.1)" }}>
      <div style={{ width: `${(frame / total) * 100}%`, height: "100%", background: C.cold }} />
      {marks.map((m) => (
        <div
          key={m}
          style={{ position: "absolute", left: `${(m / total) * 100}%`, top: 0, width: 4, height: 10, background: C.bg }}
        />
      ))}
    </div>
  );
};
