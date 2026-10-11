// 하늘 편 전용 애니메이션 부품. 모두 SVG viewBox 로 그려서 box 크기에 맞춰 늘어나므로
// 가로(롱폼)·세로(쇼츠) 화면에 그대로 씁니다.
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { bodyFont, C } from "../aircon/theme";

export type Box = { x: number; y: number; w: number; h: number };

export const SKY = {
  red: "#FF4D4D",
  orange: "#FF8A3D",
  yellow: "#FFD34D",
  green: "#4DDB7A",
  blue: "#3D8BFF",
  indigo: "#5B5BFF",
  violet: "#A35BFF",
  white: "#FFFFFF",
};
export const RAINBOW = [SKY.red, SKY.orange, SKY.yellow, SKY.green, SKY.blue, SKY.indigo, SKY.violet];

const Frame: React.FC<{ box: Box; vw: number; vh: number; children: React.ReactNode }> = ({ box, vw, vh, children }) => (
  <svg
    viewBox={`0 0 ${vw} ${vh}`}
    style={{ position: "absolute", left: box.x, top: box.y, width: box.w, height: box.h, overflow: "visible" }}
  >
    {children}
  </svg>
);

// 물결(파장) 한 줄: 길이 len 안에 파장 wavelength 로 흐르는 사인파
export const Wave: React.FC<{
  x: number;
  y: number;
  len: number;
  wavelength: number;
  amp?: number;
  color: string;
  label?: string;
  width?: number;
}> = ({ x, y, len, wavelength, amp = 40, color, label, width = 10 }) => {
  const frame = useCurrentFrame();
  const phase = frame * 6;
  const pts: string[] = [];
  for (let i = 0; i <= len; i += 4) {
    pts.push(`${x + i},${y + Math.sin(((i - phase) / wavelength) * Math.PI * 2) * amp}`);
  }
  return (
    <>
      <svg width={1920} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 12px ${color})` }} />
      </svg>
      {label ? (
        <div style={{ position: "absolute", left: x, top: y - amp - 80, fontFamily: bodyFont, fontWeight: 900, fontSize: 46, color }}>{label}</div>
      ) : null}
    </>
  );
};

// 빛 산란 장면: 왼쪽에서 빛줄기가 들어와 가운데 공기 분자에 부딪힘.
// mode: white(모든 색이 섞여 흩어짐) | blue(파랑은 흩어지고 빨강은 통과) | all(큰 물방울: 모든 색이 고르게 흩어짐)
export const Scatter: React.FC<{ box: Box; mode: "white" | "blue" | "all"; start?: number }> = ({ box, mode, start = 0 }) => {
  const frame = useCurrentFrame() - start;
  const VW = 1600;
  const VH = 800;
  const cx = 800;
  const cy = 400;
  const beamIn = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scatterColors = mode === "blue" ? [SKY.blue, SKY.indigo, SKY.blue, SKY.violet] : RAINBOW;
  const big = mode === "all";
  return (
    <Frame box={box} vw={VW} vh={VH}>
      {/* 들어오는 빛 */}
      {mode === "blue" ? (
        <>
          <line x1={0} y1={cy - 10} x2={cx * beamIn} y2={cy - 10} stroke={SKY.blue} strokeWidth={14} />
          <line x1={0} y1={cy + 10} x2={cx * beamIn} y2={cy + 10} stroke={SKY.red} strokeWidth={14} />
          {/* 빨강은 그대로 통과 */}
          <line x1={cx} y1={cy + 10} x2={cx + (VW - cx) * interpolate(frame, [20, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} y2={cy + 10} stroke={SKY.red} strokeWidth={14} />
        </>
      ) : (
        <line x1={0} y1={cy} x2={cx * beamIn} y2={cy} stroke={SKY.white} strokeWidth={22} style={{ filter: "drop-shadow(0 0 16px white)" }} />
      )}
      {/* 분자(작은 공) 또는 물방울(큰 공) */}
      <circle cx={cx} cy={cy} r={big ? 110 : 46} fill={big ? "rgba(200,230,255,0.85)" : C.coolGas} stroke="white" strokeWidth={6} />
      {/* 사방으로 흩어지는 빛 알갱이 */}
      {frame > 18
        ? new Array(24).fill(0).map((_, i) => {
            const ang = (i / 24) * Math.PI * 2;
            const p = ((((frame - 18) / 40 + (i % 4) / 4) % 1) + 1) % 1;
            const d = (big ? 130 : 70) + p * 330;
            const col = scatterColors[i % scatterColors.length];
            return (
              <circle
                key={i}
                cx={cx + Math.cos(ang) * d}
                cy={cy + Math.sin(ang) * d}
                r={14}
                fill={col}
                opacity={interpolate(p, [0, 0.1, 0.8, 1], [0, 1, 1, 0])}
                style={{ filter: `drop-shadow(0 0 8px ${col})` }}
              />
            );
          })
        : null}
    </Frame>
  );
};

// 색별 산란 세기 (빨강 = 1 기준, 레일리 산란 ∝ 1/파장⁴)
const BARS = [
  { name: "빨강", nm: 700, c: SKY.red },
  { name: "주황", nm: 600, c: SKY.orange },
  { name: "노랑", nm: 580, c: SKY.yellow },
  { name: "초록", nm: 530, c: SKY.green },
  { name: "파랑", nm: 450, c: SKY.blue },
  { name: "보라", nm: 400, c: SKY.violet },
];

export const ScatterBars: React.FC<{ box: Box; start?: number }> = ({ box, start = 0 }) => {
  const frame = useCurrentFrame() - start;
  const VW = 1200;
  const VH = 700;
  const max = (700 / 400) ** 4;
  return (
    <Frame box={box} vw={VW} vh={VH}>
      <line x1={60} y1={600} x2={1160} y2={600} stroke="rgba(255,255,255,0.4)" strokeWidth={4} />
      {BARS.map((b, i) => {
        const v = (700 / b.nm) ** 4;
        const grow = interpolate(frame, [i * 6, i * 6 + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const h = (v / max) * 480 * grow;
        const x = 110 + i * 180;
        return (
          <g key={b.name}>
            <rect x={x} y={600 - h} width={120} height={h} rx={16} fill={b.c} />
            <text x={x + 60} y={600 - h - 18} textAnchor="middle" fontFamily={bodyFont} fontWeight={900} fontSize={44} fill={C.ink} opacity={grow}>
              {v.toFixed(1)}
            </text>
            <text x={x + 60} y={660} textAnchor="middle" fontFamily={bodyFont} fontWeight={900} fontSize={42} fill={b.c}>
              {b.name}
            </text>
          </g>
        );
      })}
    </Frame>
  );
};

// 해 위치에 따른 빛의 경로: noon(짧음) / sunset(김, 오는 동안 파랑이 빠져나감)
export const LightPath: React.FC<{ box: Box; mode: "noon" | "sunset"; drop?: boolean; start?: number }> = ({
  box,
  mode,
  drop = false,
  start = 0,
}) => {
  const frame = useCurrentFrame() - start;
  const VW = 1600;
  const VH = 900;
  // 지구 표면(아래 큰 원의 일부)과 대기층
  const earthCy = 2300;
  const earthR = 1700;
  const atmoR = earthR + 120; // 대기층 (두께를 얇게: 노을 때 해가 대기 밖에 오도록)
  const eye: [number, number] = [800, earthCy - earthR];
  const sun: [number, number] = mode === "noon" ? [800, 80] : [40, eye[1]];
  // 해→눈 선분이 대기층에 들어가는 지점 (t0). 그 앞(우주)은 점선, 뒤(공기 속)는 굵은 빛줄기
  const dx = eye[0] - sun[0];
  const dy = eye[1] - sun[1];
  const fx = sun[0] - 800;
  const fy = sun[1] - earthCy;
  const a = dx * dx + dy * dy;
  const b = 2 * (fx * dx + fy * dy);
  const c = fx * fx + fy * fy - atmoR * atmoR;
  const disc = Math.max(0, b * b - 4 * a * c);
  const t0 = c <= 0 ? 0 : Math.min(1, Math.max(0, (-b - Math.sqrt(disc)) / (2 * a)));
  const entry: [number, number] = [sun[0] + dx * t0, sun[1] + dy * t0];
  const t = interpolate(frame, [0, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tt = Math.max(t, t0);
  const bx = sun[0] + dx * tt;
  const by = sun[1] + dy * tt;
  const endColor = mode === "noon" ? SKY.white : SKY.orange;
  return (
    <Frame box={box} vw={VW} vh={VH}>
      <defs>
        <linearGradient id={`beam-${mode}`} x1={entry[0]} y1={entry[1]} x2={eye[0]} y2={eye[1]} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={SKY.white} />
          <stop offset="100%" stopColor={endColor} />
        </linearGradient>
        <clipPath id={`clip-${mode}`}>
          <rect x={0} y={0} width={VW} height={VH} />
        </clipPath>
      </defs>
      <g clipPath={`url(#clip-${mode})`}>
        <circle cx={800} cy={earthCy} r={atmoR} fill="rgba(91,200,255,0.22)" stroke="rgba(91,200,255,0.6)" strokeWidth={4} />
        <circle cx={800} cy={earthCy} r={earthR} fill="#1E4D3A" stroke="#4DDB7A" strokeWidth={6} />
      </g>
      {/* 해 */}
      <circle cx={sun[0]} cy={sun[1]} r={46} fill={mode === "noon" ? SKY.yellow : SKY.orange} style={{ filter: "drop-shadow(0 0 30px #FFD34D)" }} />
      {/* 우주 구간: 공기가 없어 흩어지지 않음 (흐린 점선) */}
      <line x1={sun[0]} y1={sun[1]} x2={entry[0]} y2={entry[1]} stroke="rgba(255,255,255,0.45)" strokeWidth={6} strokeDasharray="14 14" />
      {/* 공기 속 구간: 굵은 빛줄기 */}
      {t > t0 ? (
        <line x1={entry[0]} y1={entry[1]} x2={bx} y2={by} stroke={`url(#beam-${mode})`} strokeWidth={18} strokeLinecap="round" />
      ) : null}
      {/* 공기 속을 오는 동안 흩어져 빠져나가는 파란빛 */}
      {drop && frame > 20
        ? new Array(12).fill(0).map((_, i) => {
            const p = t0 + ((1 - t0) * (i + 0.5)) / 12;
            const px = sun[0] + dx * p;
            const py = sun[1] + dy * p;
            const q = ((((frame - 20) / 45 + i * 0.13) % 1) + 1) % 1;
            return <circle key={i} cx={px} cy={py - q * 140} r={12} fill={SKY.blue} opacity={1 - q} />;
          })
        : null}
      {/* 보는 사람 위치 */}
      <circle cx={eye[0]} cy={eye[1]} r={20} fill={C.ink} />
    </Frame>
  );
};

// 하늘 색 배경 (낮 → 노을 사이를 amount 로)
export const SkyBg: React.FC<{ amount: number; box?: Box }> = ({ amount, box = { x: 0, y: 0, w: 1920, h: 1080 } }) => {
  const mix = (a: number[], b: number[]) => a.map((v, i) => Math.round(v + (b[i] - v) * amount));
  const top = mix([38, 110, 230], [70, 40, 110]);
  const bottom = mix([140, 200, 255], [255, 140, 60]);
  return (
    <div
      style={{
        position: "absolute",
        left: box.x,
        top: box.y,
        width: box.w,
        height: box.h,
        borderRadius: 36,
        background: `linear-gradient(180deg, rgb(${top.join(",")}) 0%, rgb(${bottom.join(",")}) 100%)`,
      }}
    />
  );
};
