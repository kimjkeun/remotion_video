// 전자레인지 편 전용 애니메이션 부품. 모두 SVG viewBox 로 그려서 box 크기에 맞춰 늘어나므로
// 가로(롱폼)·세로(쇼츠) 화면에 그대로 씁니다.
import React from "react";
import { interpolate, interpolateColors, useCurrentFrame } from "remotion";
import { bodyFont, C } from "../aircon/theme";
import type { Box } from "../sky/components";

export const MW = {
  wave: "#FFD34D",
  plus: "#FF6B6B",
  minus: "#5BC8FF",
  metal: "#9FB0C8",
  choco: "#7A4A2E",
  chocoDark: "#3E2214",
  coldCore: "#4F86D9",
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Frame: React.FC<{ box: Box; vw: number; vh: number; children: React.ReactNode }> = ({ box, vw, vh, children }) => (
  <svg
    viewBox={`0 0 ${vw} ${vh}`}
    style={{ position: "absolute", left: box.x, top: box.y, width: box.w, height: box.h, overflow: "visible" }}
  >
    {children}
  </svg>
);

// 물 분자 하나 (산소 1 + 수소 2). angle 0 = 수소(+) 쪽이 위
const Mol: React.FC<{ cx: number; cy: number; r: number; angle?: number; labels?: boolean; face?: boolean; tint?: string }> = ({
  cx,
  cy,
  r,
  angle = 0,
  labels,
  face,
  tint = "#FF5C5C",
}) => (
  <g transform={`translate(${cx} ${cy}) rotate(${angle})`}>
    {[-1, 1].map((s) => (
      <circle key={s} cx={s * r * 0.78} cy={-r * 0.72} r={r * 0.56} fill="#F4F7FF" stroke="#C9D3E8" strokeWidth={r * 0.06} />
    ))}
    <circle cx={0} cy={0} r={r} fill={tint} stroke="rgba(0,0,0,0.25)" strokeWidth={r * 0.06} />
    {face ? (
      <>
        <circle cx={-r * 0.3} cy={r * 0.05} r={r * 0.1} fill="#0B1530" />
        <circle cx={r * 0.3} cy={r * 0.05} r={r * 0.1} fill="#0B1530" />
        <ellipse cx={-r * 0.38} cy={-r * 0.5} rx={r * 0.28} ry={r * 0.14} fill="rgba(255,255,255,0.35)" />
      </>
    ) : null}
    {labels ? (
      <>
        <text x={0} y={-r * 1.75} textAnchor="middle" fontFamily={bodyFont} fontWeight={900} fontSize={r * 0.9} fill={MW.plus}>
          +
        </text>
        <text x={0} y={r * 2.05} textAnchor="middle" fontFamily={bodyFont} fontWeight={900} fontSize={r * 0.9} fill={MW.minus}>
          −
        </text>
      </>
    ) : null}
  </g>
);

// 물 분자 캐릭터 한 개를 크게 (+ / − 표시). dance: 좌우로 흔들리는 정도(도), 10 을 넘으면 춤추듯 빠르게
export const WaterMol: React.FC<{ box: Box; labels?: boolean; dance?: number; phase?: number }> = ({
  box,
  labels,
  dance = 6,
  phase = 0,
}) => {
  const frame = useCurrentFrame();
  const fast = dance > 10;
  return (
    <Frame box={box} vw={600} vh={600}>
      <Mol
        cx={300 + (fast ? Math.sin(frame / 5 + phase) * 14 : 0)}
        cy={330 + (fast ? Math.cos(frame / 4 + phase) * 10 : 0)}
        r={130}
        angle={Math.sin(frame / (fast ? 4 : 20) + phase) * dance}
        labels={labels}
        face
      />
    </Frame>
  );
};

// 손을 맞대고 비비는 모습 (비비면 따뜻해짐)
export const RubHands: React.FC<{ box: Box }> = ({ box }) => {
  const frame = useCurrentFrame();
  const slide = Math.sin(frame / 3) * 46;
  const hand = (dir: 1 | -1) => (
    <g transform={`translate(${300 + dir * 62} ${300 + dir * slide}) rotate(${dir * 6})`}>
      <rect x={-60} y={-170} width={120} height={300} rx={56} fill="#F6C7A4" stroke="#D89A72" strokeWidth={8} />
      <rect x={-52} y={110} width={104} height={150} rx={30} fill="#F4F7FF" stroke="#C9D3E8" strokeWidth={8} />
    </g>
  );
  return (
    <Frame box={box} vw={600} vh={600}>
      <ellipse cx={300} cy={280} rx={150 + Math.sin(frame / 6) * 14} ry={210} fill={C.hot} opacity={0.3} style={{ filter: "blur(30px)" }} />
      {hand(-1)}
      {hand(1)}
      {[0, 1, 2].map((i) => {
        const p = (((frame / 40 + i / 3) % 1) + 1) % 1;
        return (
          <path
            key={i}
            d={`M ${220 + i * 80} ${110 - p * 80} q 16 -22 0 -44 q -16 -22 0 -44`}
            fill="none"
            stroke={C.hot}
            strokeWidth={10}
            strokeLinecap="round"
            opacity={interpolate(p, [0, 0.2, 0.8, 1], [0, 1, 1, 0])}
          />
        );
      })}
    </Frame>
  );
};

// 와이파이 공유기 (전파가 퍼져 나감)
export const Router: React.FC<{ box: Box }> = ({ box }) => {
  const frame = useCurrentFrame();
  return (
    <Frame box={box} vw={600} vh={600}>
      {[0, 1, 2].map((i) => {
        const p = (((frame / 45 + i / 3) % 1) + 1) % 1;
        const r = 70 + p * 170;
        return (
          <path
            key={i}
            d={`M ${300 - r * 0.8} ${250 - r * 0.6} A ${r} ${r} 0 0 1 ${300 + r * 0.8} ${250 - r * 0.6}`}
            fill="none"
            stroke={C.cold}
            strokeWidth={14}
            strokeLinecap="round"
            opacity={interpolate(p, [0, 0.15, 0.8, 1], [0, 1, 1, 0])}
          />
        );
      })}
      <line x1={170} y1={420} x2={140} y2={250} stroke="#DDE5F2" strokeWidth={22} strokeLinecap="round" />
      <line x1={430} y1={420} x2={460} y2={250} stroke="#DDE5F2" strokeWidth={22} strokeLinecap="round" />
      <rect x={90} y={400} width={420} height={120} rx={40} fill="#F4F7FF" stroke="#C9D3E8" strokeWidth={8} />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={170 + i * 50} cy={460} r={12} fill={i === 0 ? "#4DDB7A" : C.cold} opacity={i === 0 ? 1 : 0.5 + Math.sin(frame / 4 + i) * 0.5} />
      ))}
    </Frame>
  );
};

// 뒤집히는 전기 방향(노란 화살표)과 그걸 따라 도는 물 분자. period: 한 번 왕복하는 프레임 수
export const FieldFlip: React.FC<{ box: Box; period?: number; mols?: number; labels?: boolean; start?: number }> = ({
  box,
  period = 60,
  mols = 1,
  labels,
  start = 0,
}) => {
  const frame = useCurrentFrame() - start;
  const VW = 1200;
  const VH = 700;
  const cy = 350;
  const phase = (frame / period) * Math.PI * 2;
  const e = Math.sin(phase);
  // 분자는 전기 방향을 조금 늦게 따라갑니다 (위 = 0도, 아래 = 180도)
  const follow = Math.tanh(2.2 * Math.sin(phase - 0.7)) / Math.tanh(2.2);
  const angle = 90 - 90 * follow;
  const arrowXs = mols === 1 ? [180, 380, 820, 1020] : [100, 400, 800, 1100];
  const molXs = mols === 1 ? [600] : [250, 600, 950];
  return (
    <Frame box={box} vw={VW} vh={VH}>
      {arrowXs.map((x) => {
        const len = 230 * e;
        const tip = cy - len;
        const dir = Math.sign(len) || 1;
        return (
          <g key={x} opacity={0.35 + Math.abs(e) * 0.65}>
            <line x1={x} y1={cy + len} x2={x} y2={tip + dir * 20} stroke={MW.wave} strokeWidth={14} strokeLinecap="round" />
            <polygon points={`${x - 30},${tip + dir * 36} ${x + 30},${tip + dir * 36} ${x},${tip - dir * 10}`} fill={MW.wave} />
          </g>
        );
      })}
      {molXs.map((x, i) => (
        <Mol key={x} cx={x} cy={cy} r={mols === 1 ? 110 : 76} angle={angle + (i - 1) * 8} labels={labels} />
      ))}
    </Frame>
  );
};

// 분자 무리가 떨리는 모습. energy 0(거의 멈춤) ~ 1(격렬) 에 따라 흔들림 폭과 색이 바뀜
export const Jiggle: React.FC<{
  box: Box;
  energy: number;
  cols?: number;
  rows?: number;
  water?: boolean;
  lattice?: boolean;
  speed?: number;
}> = ({ box, energy, cols = 6, rows = 3, water, lattice, speed = 0.4 }) => {
  const frame = useCurrentFrame();
  const VW = 1200;
  const VH = 700;
  const amp = 5 + energy * 42;
  const color = interpolateColors(energy, [0, 1], [C.cold, C.hot]);
  const gx = VW / (cols + 1);
  const gy = VH / (rows + 1);
  const pts = new Array(cols * rows).fill(0).map((_, i) => {
    const c = i % cols;
    const r = Math.floor(i / cols);
    return {
      x: gx * (c + 1) + Math.sin(frame * speed + i * 1.7) * amp,
      y: gy * (r + 1) + Math.cos(frame * speed * 0.9 + i * 2.3) * amp,
      a: Math.sin(frame * speed * 0.8 + i) * (10 + energy * 70),
      c,
      r,
    };
  });
  return (
    <Frame box={box} vw={VW} vh={VH}>
      {lattice
        ? pts.map((p, i) => (
            <g key={`l${i}`} stroke="rgba(184,228,250,0.55)" strokeWidth={8}>
              {p.c < cols - 1 ? <line x1={p.x} y1={p.y} x2={pts[i + 1].x} y2={pts[i + 1].y} /> : null}
              {p.r < rows - 1 ? <line x1={p.x} y1={p.y} x2={pts[i + cols].x} y2={pts[i + cols].y} /> : null}
            </g>
          ))
        : null}
      {pts.map((p, i) =>
        water ? (
          <Mol key={i} cx={p.x} cy={p.y} r={36} angle={p.a} tint={interpolateColors(energy, [0, 1], ["#FF5C5C", "#FF8A3D"])} />
        ) : (
          <circle key={i} cx={p.x} cy={p.y} r={34} fill={color} style={{ filter: `drop-shadow(0 0 ${6 + energy * 18}px ${color})` }} />
        ),
      )}
    </Frame>
  );
};

const Bracket: React.FC<{ x1: number; x2: number; y: number; label: string; color?: string; size?: number }> = ({
  x1,
  x2,
  y,
  label,
  color = C.ink,
  size = 46,
}) => (
  <g stroke={color} strokeWidth={6} strokeLinecap="round">
    <line x1={x1} y1={y} x2={x2} y2={y} />
    <line x1={x1} y1={y - 18} x2={x1} y2={y + 18} />
    <line x1={x2} y1={y - 18} x2={x2} y2={y + 18} />
    <text x={(x1 + x2) / 2} y={y + size + 12} textAnchor="middle" stroke="none" fontFamily={bodyFont} fontWeight={900} fontSize={size} fill={color}>
      {label}
    </text>
  </g>
);

// 전자레인지 속(금속 상자) 단면.
// mode: empty | rays(벽에 반사되는 마이크로파) | standing(겹쳐서 생긴 뜨거운 곳·차가운 곳)
const RAY: [number, number][] = [
  [1060, 190],
  [760, 80],
  [82, 330],
  [400, 600],
  [1038, 390],
  [620, 82],
  [82, 180],
  [300, 600],
];
const ANTINODES = [0, 1, 2, 3, 4].map((n) => 80 + 192 * (n + 0.5));

export const Cavity: React.FC<{
  box: Box;
  mode?: "empty" | "rays" | "standing";
  magnetron?: boolean;
  strip?: boolean;
  measure?: boolean;
  start?: number;
}> = ({ box, mode = "empty", magnetron, strip, measure, start = 0 }) => {
  const frame = useCurrentFrame() - start;
  const VW = 1200;
  const VH = 700;
  const draw = interpolate(frame, [0, 70], [0, 1], clamp);
  const wave: string[] = [];
  for (let x = 80; x <= 1040; x += 6) {
    wave.push(`${x},${300 + Math.sin(((x - 80) / 192) * Math.PI) * 120 * Math.cos(frame / 5)}`);
  }
  return (
    <Frame box={box} vw={VW} vh={VH}>
      <rect x={60} y={60} width={1000} height={560} rx={30} fill="rgba(255,255,255,0.04)" stroke={MW.metal} strokeWidth={18} />
      {/* 마그네트론 */}
      <rect
        x={1060}
        y={120}
        width={110}
        height={140}
        rx={16}
        fill={magnetron ? MW.wave : MW.metal}
        style={magnetron ? { filter: `drop-shadow(0 0 ${14 + Math.sin(frame / 5) * 8}px ${MW.wave})` } : undefined}
      />
      {magnetron ? (
        <text x={1084} y={316} fontFamily={bodyFont} fontWeight={900} fontSize={44} fill={MW.wave}>
          마그네트론
        </text>
      ) : null}
      {/* 회전 접시 */}
      <ellipse cx={560} cy={585} rx={300} ry={18} fill="rgba(200,230,255,0.5)" stroke="white" strokeWidth={4} />
      {mode === "rays" ? (
        <>
          <polyline
            points={RAY.map((p) => p.join(",")).join(" ")}
            fill="none"
            stroke={MW.wave}
            strokeWidth={12}
            strokeLinejoin="round"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray="1"
            strokeDashoffset={1 - draw}
            style={{ filter: `drop-shadow(0 0 10px ${MW.wave})` }}
          />
          {RAY.slice(1, -1).map((p, i) =>
            draw > (i + 1) / (RAY.length - 1) ? (
              <circle key={i} cx={p[0]} cy={p[1]} r={16 + Math.sin(frame / 4 + i) * 5} fill="white" opacity={0.8} />
            ) : null,
          )}
        </>
      ) : null}
      {mode === "standing" ? (
        <>
          {ANTINODES.map((x) => (
            <circle key={x} cx={x} cy={300} r={80} fill={C.hot} opacity={0.18 + Math.abs(Math.cos(frame / 5)) * 0.3} />
          ))}
          <polyline points={wave.join(" ")} fill="none" stroke={MW.wave} strokeWidth={12} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 10px ${MW.wave})` }} />
          <line x1={80} y1={300} x2={1040} y2={300} stroke="rgba(255,255,255,0.3)" strokeWidth={3} strokeDasharray="10 10" />
          {strip ? (
            <>
              <defs>
                <linearGradient id="mw-strip" x1={80} x2={272} gradientUnits="userSpaceOnUse" spreadMethod="repeat">
                  <stop offset="0%" stopColor={MW.coldCore} />
                  <stop offset="50%" stopColor={C.hot} />
                  <stop offset="100%" stopColor={MW.coldCore} />
                </linearGradient>
              </defs>
              <rect x={80} y={490} width={960} height={70} rx={20} fill="url(#mw-strip)" stroke="white" strokeWidth={4} />
            </>
          ) : null}
          {measure ? <Bracket x1={ANTINODES[1]} x2={ANTINODES[2]} y={130} label="약 6 cm" color={C.ink} /> : null}
        </>
      ) : null}
    </Frame>
  );
};

// 위에서 내려다본 회전 접시: 뜨거운 곳(고정) 위를 음식이 돌면서 지나감
export const TurntableTop: React.FC<{ box: Box; start?: number }> = ({ box, start = 0 }) => {
  const frame = useCurrentFrame() - start;
  const ang = (frame / 90) * Math.PI * 2;
  const spots: [number, number][] = [];
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if ((i + j) % 2 === 0) spots.push([350 + i * 170, 350 + j * 170]);
    }
  }
  return (
    <Frame box={box} vw={700} vh={700}>
      <circle cx={350} cy={350} r={320} fill="rgba(200,230,255,0.14)" stroke="white" strokeWidth={6} />
      {spots.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={78} fill={C.hot} opacity={0.4} style={{ filter: `drop-shadow(0 0 20px ${C.hot})` }} />
      ))}
      {/* 회전 방향 */}
      <circle cx={350} cy={350} r={200} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={5} strokeDasharray="18 16" strokeDashoffset={-frame * 2} />
      {[0, 1, 2].map((i) => {
        const a = ang + (i * Math.PI * 2) / 3;
        return <circle key={i} cx={350 + Math.cos(a) * 200} cy={350 + Math.sin(a) * 200} r={46} fill="#F6E7C8" stroke="#C9A66B" strokeWidth={6} />;
      })}
    </Frame>
  );
};

// 두꺼운 음식의 단면. depth: 겉에서 데워지는 두께(반지름 대비 0~1), conduct: 열이 속으로 전해진 정도(0~1)
export const Penetration: React.FC<{
  box: Box;
  mode?: "micro" | "flame";
  depth?: number;
  conduct?: number;
  label?: string;
  coldLabel?: string;
}> = ({ box, mode = "micro", depth = 0.3, conduct = 0, label, coldLabel }) => {
  const frame = useCurrentFrame();
  const id = React.useId().replace(/:/g, "");
  const cx = 450;
  const cy = 350;
  const R = 250;
  const d = Math.min(1, depth + conduct * (1 - depth));
  const core = interpolateColors(conduct, [0, 1], [MW.coldCore, "#FF9A4D"]);
  return (
    <Frame box={box} vw={900} vh={700}>
      <defs>
        <radialGradient id={id} cx={cx} cy={cy} r={R} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={core} />
          <stop offset={`${Math.max(0, 1 - d) * 100}%`} stopColor={core} />
          <stop offset="100%" stopColor={C.hot} />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={R} fill={`url(#${id})`} stroke="white" strokeWidth={8} />
      {mode === "micro"
        ? new Array(10).fill(0).map((_, i) => {
            const a = (i / 10) * Math.PI * 2;
            const p = (((frame / 30 + (i % 3) / 3) % 1) + 1) % 1;
            const r = R + 170 - p * 150;
            return (
              <circle
                key={i}
                cx={cx + Math.cos(a) * r}
                cy={cy + Math.sin(a) * r}
                r={16}
                fill={MW.wave}
                opacity={interpolate(p, [0, 0.15, 0.85, 1], [0, 1, 1, 0])}
                style={{ filter: `drop-shadow(0 0 10px ${MW.wave})` }}
              />
            );
          })
        : new Array(7).fill(0).map((_, i) => {
            const x = cx - 210 + i * 70;
            const h = 70 + Math.sin(frame / 3 + i * 1.9) * 22;
            const y = cy + Math.sqrt(Math.max(0, R * R - (x - cx) ** 2)) + 26;
            return <path key={i} d={`M ${x - 26} ${y + h} Q ${x} ${y - h * 0.4} ${x + 26} ${y + h} Z`} fill={i % 2 ? "#FFB547" : C.hot} />;
          })}
      {label ? (
        <>
          <Bracket x1={cx + R * (1 - depth)} x2={cx + R} y={cy} label="" />
          <text x={cx + R * (1 - depth) - 22} y={cy + 17} textAnchor="end" fontFamily={bodyFont} fontWeight={900} fontSize={50} fill={C.ink}>
            {label}
          </text>
        </>
      ) : null}
      {coldLabel ? (
        <text x={cx} y={cy + 16} textAnchor="middle" fontFamily={bodyFont} fontWeight={900} fontSize={50} fill={C.ink}>
          {coldLabel}
        </text>
      ) : null}
    </Frame>
  );
};

// 문에 붙은 구멍 뚫린 금속판(옆에서 본 단면).
// micro: 파장이 긴 마이크로파는 못 지나감 / light: 파장이 짧은 빛은 통과 / both / solid(구멍 없는 금속: 반사)
export const DoorMesh: React.FC<{ box: Box; mode: "plate" | "micro" | "light" | "both" | "solid"; start?: number }> = ({
  box,
  mode,
  start = 0,
}) => {
  const frame = useCurrentFrame() - start;
  const VW = 1200;
  const VH = 700;
  const showMicro = mode === "micro" || mode === "both" || mode === "solid";
  const showLight = mode === "light" || mode === "both";
  const reach = interpolate(frame, [0, 25], [0, 1], clamp);
  const micro: string[] = [];
  for (let x = 40; x <= 40 + 520 * reach; x += 6) {
    micro.push(`${x},${350 + Math.sin(((x - frame * 8) / 400) * Math.PI * 2) * 130}`);
  }
  const light: string[] = [];
  for (let x = 40; x <= 40 + 1120 * reach; x += 3) {
    light.push(`${x},${350 + Math.sin(((x - frame * 10) / 36) * Math.PI * 2) * 7}`);
  }
  const holes = [70, 140, 210, 280, 350, 420, 490, 560, 630];
  return (
    <Frame box={box} vw={VW} vh={VH}>
      {showMicro ? (
        <>
          <polyline points={micro.join(" ")} fill="none" stroke={MW.wave} strokeWidth={14} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 10px ${MW.wave})` }} />
          <text x={60} y={90} fontFamily={bodyFont} fontWeight={900} fontSize={46} fill={MW.wave}>
            마이크로파
          </text>
          {frame > 25 ? (
            <text x={720} y={220} fontFamily={bodyFont} fontWeight={900} fontSize={130} fill="#FF3B4E">
              ✕
            </text>
          ) : null}
        </>
      ) : null}
      {showLight ? (
        <>
          <polyline points={light.join(" ")} fill="none" stroke="white" strokeWidth={7} strokeLinecap="round" style={{ filter: "drop-shadow(0 0 8px white)" }} />
          <text x={860} y={300} fontFamily={bodyFont} fontWeight={900} fontSize={46} fill={C.ink}>
            빛은 통과
          </text>
        </>
      ) : null}
      {/* 금속판 */}
      {mode === "solid" ? (
        <rect x={560} y={30} width={70} height={640} rx={10} fill={MW.metal} />
      ) : (
        <>
          {[30, ...holes.map((h) => h + 14)].map((y, i) => {
            const next = holes[i] !== undefined ? holes[i] - 14 : 670;
            return <rect key={y} x={560} y={y} width={70} height={next - y} rx={8} fill={MW.metal} />;
          })}
        </>
      )}
      {mode === "both" ? (
        <g transform="translate(1090 350)">
          <ellipse rx={64} ry={40} fill="white" />
          <circle r={24} fill="#2B4A8A" />
          <circle r={10} fill="#0B1530" />
        </g>
      ) : null}
    </Frame>
  );
};

// 금속 끝에서 튀는 불꽃
export const Sparks: React.FC<{ x: number; y: number; size?: number }> = ({ x, y, size = 160 }) => {
  const frame = useCurrentFrame();
  return (
    <svg width={size * 2} height={size * 2} style={{ position: "absolute", left: x - size, top: y - size, overflow: "visible" }}>
      {new Array(9).fill(0).map((_, i) => {
        const a = (i / 9) * Math.PI * 2 + Math.floor(frame / 3) * 0.7;
        const len = size * (0.45 + (((i * 37 + Math.floor(frame / 3) * 53) % 10) / 10) * 0.55);
        return (
          <line
            key={i}
            x1={size + Math.cos(a) * 18}
            y1={size + Math.sin(a) * 18}
            x2={size + Math.cos(a) * len}
            y2={size + Math.sin(a) * len}
            stroke={i % 2 ? "#FFFFFF" : MW.wave}
            strokeWidth={8}
            strokeLinecap="round"
            opacity={frame % 6 < 4 ? 1 : 0.4}
            style={{ filter: `drop-shadow(0 0 10px ${MW.wave})` }}
          />
        );
      })}
    </svg>
  );
};

// 판 초콜릿(위에서 본 모습)과 6cm 간격으로 녹은 자국
const SPOTS = [300, 600, 900];
export const Choco: React.FC<{ box: Box; melt?: number; measure?: boolean }> = ({ box, melt = 0, measure }) => {
  const cols = 8;
  const rows = 3;
  return (
    <Frame box={box} vw={1200} vh={500}>
      <rect x={100} y={90} width={1000} height={300} rx={26} fill={MW.choco} stroke="#5A331E" strokeWidth={8} />
      {new Array(cols - 1).fill(0).map((_, i) => (
        <line key={`c${i}`} x1={100 + (1000 / cols) * (i + 1)} y1={96} x2={100 + (1000 / cols) * (i + 1)} y2={384} stroke="#5A331E" strokeWidth={6} />
      ))}
      {new Array(rows - 1).fill(0).map((_, i) => (
        <line key={`r${i}`} x1={106} y1={90 + (300 / rows) * (i + 1)} x2={1094} y2={90 + (300 / rows) * (i + 1)} stroke="#5A331E" strokeWidth={6} />
      ))}
      {SPOTS.map((x, i) => {
        const m = interpolate(melt, [i * 0.2, i * 0.2 + 0.6], [0, 1], clamp);
        return (
          <g key={x} opacity={m}>
            <ellipse cx={x} cy={240} rx={86 * m} ry={66 * m} fill={MW.chocoDark} />
            <ellipse cx={x - 22} cy={218} rx={30 * m} ry={14 * m} fill="rgba(255,255,255,0.35)" />
          </g>
        );
      })}
      {measure ? <Bracket x1={SPOTS[0]} x2={SPOTS[1]} y={440} label="약 6 cm" /> : null}
    </Frame>
  );
};
