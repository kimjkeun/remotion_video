import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Backdrop, Captions, HeatFlow, Pic } from "../components";
import { bodyFont, C } from "../theme";

// 19~39초: 냉매 순환 다이어그램. 단계마다 해당 부품이 강조됨

// 순환 경로: 팽창밸브(위) → 왼쪽 아래로 → 실내기 → 아래 → 압축기 → 오른쪽 위로 → 실외기 → 위 → 팽창밸브
const PTS: [number, number][] = [
  [650, 600],
  [230, 600],
  [230, 1300],
  [650, 1300],
  [850, 1300],
  [850, 600],
  [650, 600],
];
const SEG = PTS.slice(1).map((p, i) => Math.hypot(p[0] - PTS[i][0], p[1] - PTS[i][1]));
const TOTAL = SEG.reduce((a, b) => a + b, 0);

const pointAt = (s: number): [number, number] => {
  let rest = ((s % TOTAL) + TOTAL) % TOTAL;
  for (let i = 0; i < SEG.length; i++) {
    if (rest <= SEG[i]) {
      const t = rest / SEG[i];
      return [
        PTS[i][0] + (PTS[i + 1][0] - PTS[i][0]) * t,
        PTS[i][1] + (PTS[i + 1][1] - PTS[i][1]) * t,
      ];
    }
    rest -= SEG[i];
  }
  return PTS[0];
};

// 경로 위 위치(s)에 따른 냉매 상태 색
const S_INDOOR = 770;
const S_COMP = 1540;
const S_OUT = 2090;
const colorAt = (s: number) => {
  const r = ((s % TOTAL) + TOTAL) % TOTAL;
  if (r < S_INDOOR) return C.cold; // 차가운 액체
  if (r < S_COMP) return C.coolGas; // 열을 머금은 기체
  if (r < S_OUT) return C.hot; // 압축된 뜨거운 기체
  return C.warm; // 열을 버린 액체
};

// 단계별 시작 프레임: ① 실내기 12초, ② 압축기 15초, ③ 실외기 12초, ④ 팽창밸브 12초
export const STARTS = [0, 360, 810, 1170];
export const CYCLE_DURATION = 1530;

// 순환 고리 안쪽 빈 공간(가로 약 370px)에 띄우는 온도 비교 카드
const TempCompare: React.FC<{
  top: { label: string; temp: string; color: string };
  bottom: { label: string; temp: string; color: string };
  blocked?: boolean;
  from: number;
}> = ({ top, bottom, blocked, from }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - from, fps, config: { damping: 13 } });
  if (frame < from) return null;
  const pill = (p: { label: string; temp: string; color: string }, y: number) => (
    <div
      style={{
        position: "absolute",
        left: 370,
        width: 340,
        top: y,
        textAlign: "center",
        fontFamily: bodyFont,
        fontWeight: 900,
        color: C.ink,
        background: "rgba(5,10,25,0.75)",
        border: `4px solid ${p.color}`,
        borderRadius: 28,
        padding: "10px 0",
      }}
    >
      <div style={{ fontSize: 40, color: C.dim }}>{p.label}</div>
      <div style={{ fontSize: 76, color: p.color, lineHeight: 1.05 }}>{p.temp}</div>
    </div>
  );
  return (
    <div style={{ opacity: pop, scale: String(interpolate(pop, [0, 1], [0.85, 1])) }}>
      {pill(top, 700)}
      {/* 열이 흐르는 방향 화살표 */}
      <div
        style={{
          position: "absolute",
          left: 370,
          width: 340,
          top: 885,
          textAlign: "center",
          fontFamily: bodyFont,
          fontWeight: 900,
          fontSize: blocked ? 46 : 60,
          color: blocked ? "#FF3B4E" : C.hot,
          translate: blocked ? "0px 0px" : `0px ${Math.sin(frame / 6) * 8}px`,
        }}
      >
        {blocked ? "✕ 열 이동 불가" : "열 ▼"}
      </div>
      {pill(bottom, 980)}
    </div>
  );
};

// 비유 이미지 + 온도 변화 카드
const Analogy: React.FC<{ src: string; text: string; color: string; from: number }> = ({
  src,
  text,
  color,
  from,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - from, fps, config: { damping: 13 } });
  if (frame < from) return null;
  return (
    <div style={{ opacity: pop }}>
      <div
        style={{
          position: "absolute",
          left: 370,
          top: 690,
          width: 340,
          height: 470,
          borderRadius: 36,
          background: "rgba(5,10,25,0.75)",
          border: `4px solid ${color}`,
        }}
      />
      <Pic src={src} x={540} y={880} size={300} delay={from} float={6} />
      <div
        style={{
          position: "absolute",
          left: 370,
          width: 340,
          top: 1055,
          textAlign: "center",
          fontFamily: bodyFont,
          fontWeight: 900,
          fontSize: 50,
          color,
        }}
      >
        {text}
      </div>
    </div>
  );
};

const Station: React.FC<{
  active: boolean;
  x: number;
  y: number;
  label: string;
  color: string;
  labelPos?: { left: number; top: number; align: "left" | "center" | "right" };
  children: React.ReactNode;
}> = ({ active, x, y, label, color, labelPos, children }) => {
  const lp = labelPos ?? { left: x - 160, top: y + 135, align: "center" as const };
  return (
    <div style={{ opacity: active ? 1 : 0.5 }}>
      {/* 배관이 이미지 뒤로 지나가도록 가리는 원판 */}
      <div
        style={{
          position: "absolute",
          left: x - 125,
          top: y - 125,
          width: 250,
          height: 250,
          borderRadius: "50%",
          background: C.bg2,
          border: `5px solid ${active ? color : "rgba(255,255,255,0.15)"}`,
        }}
      />
      {active ? (
        <div
          style={{
            position: "absolute",
            left: x - 170,
            top: y - 170,
            width: 340,
            height: 340,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${color}55 0%, transparent 70%)`,
          }}
        />
      ) : null}
      {children}
      <div
        style={{
          position: "absolute",
          left: lp.left,
          width: 320,
          top: lp.top,
          textAlign: lp.align,
          fontFamily: bodyFont,
          fontWeight: 900,
          fontSize: 46,
          color: active ? color : C.dim,
        }}
      >
        {label ? (
          <span style={{ background: C.bg2, padding: "4px 18px", borderRadius: 16 }}>{label}</span>
        ) : null}
      </div>
    </div>
  );
};

// starts: 단계별 시작 프레임 (TTS 버전은 문장 시작 시점을 넘김)
// offsets: 단계 안에서 설명 카드가 바뀌는 시점, showCaptions: 내장 자막 표시 여부
export const S4Cycle: React.FC<{
  starts?: number[];
  offsets?: { compare0: number; pump: number; spray: number };
  showCaptions?: boolean;
}> = ({ starts = STARTS, offsets = { compare0: 120, pump: 230, spray: 120 }, showCaptions = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const step = starts.reduce((acc, s, i) => (frame >= s ? i : acc), 0);
  const local = frame - starts[step];
  const draw = interpolate(frame, [0, 30], [TOTAL, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const path = `M ${PTS.map((p) => p.join(" ")).join(" L ")}`;
  const flow = frame * 9;
  const valvePop = spring({ frame: frame - starts[3], fps, config: { damping: 10 } });

  return (
    <AbsoluteFill>
      <Backdrop glow={step === 1 || step === 2 ? C.hot : C.cold} />

      {/* 벽: 왼쪽은 방 안, 오른쪽은 바깥 */}
      <div
        style={{
          position: "absolute",
          left: 425,
          top: 470,
          width: 0,
          height: 960,
          borderLeft: "6px dashed rgba(255,255,255,0.25)",
        }}
      />
      {[
        { x: 230, label: "방 안" },
        { x: 750, label: "바깥" },
      ].map((l) => (
        <div
          key={l.label}
          style={{
            position: "absolute",
            left: l.x - 150,
            width: 300,
            top: 400,
            textAlign: "center",
            fontFamily: bodyFont,
            fontWeight: 900,
            fontSize: 46,
            color: C.dim,
          }}
        >
          {l.label}
        </div>
      ))}

      {/* 배관 */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <path
          d={path}
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth={34}
          strokeLinejoin="round"
          strokeDasharray={TOTAL}
          strokeDashoffset={draw}
        />
        {/* 흐르는 냉매 알갱이 */}
        {frame > 25
          ? new Array(36).fill(0).map((_, i) => {
              const s = flow + (i * TOTAL) / 36;
              const [x, y] = pointAt(s);
              const col = colorAt(s);
              return <circle key={i} cx={x} cy={y} r={13} fill={col} style={{ filter: `drop-shadow(0 0 8px ${col})` }} />;
            })
          : null}
      </svg>

      {/* ① 실내기 */}
      <Station active={step === 0} x={230} y={950} label="① 실내기" color={C.cold}>
        <Pic src="indoor_unit.png" x={230} y={950} size={230} float={4} />
      </Station>
      {step === 0 ? <HeatFlow from={[120, 1250]} to={[230, 980]} count={5} period={45} size={36} /> : null}

      {/* ② 압축기 */}
      <Station
        active={step === 1}
        x={650}
        y={1300}
        label="② 압축기"
        color={C.hot}
        labelPos={{ left: 650 - 145 - 320, top: 1300 - 110, align: "right" }}
      >
        <Pic
          src="compressor.png"
          x={650}
          y={1300}
          size={200}
          float={step === 1 ? 0 : 3}
          style={step === 1 ? { scale: String(1 + Math.abs(Math.sin(frame / 4)) * 0.08) } : undefined}
        />
      </Station>

      {/* ③ 실외기 */}
      <Station active={step === 2} x={850} y={950} label="③ 실외기" color={C.hot}>
        <Pic src="outdoor_unit.png" x={850} y={950} size={230} float={4} />
      </Station>
      {step === 2 ? <HeatFlow from={[850, 950]} to={[1000, 560]} count={6} period={40} size={40} /> : null}

      {/* ④ 팽창밸브 (코드로 그림) */}
      <Station active={step === 3} x={650} y={600} label="" color={C.cold}>
        <div
          style={{
            position: "absolute",
            left: 650 - 50,
            top: 600 - 50,
            width: 100,
            height: 100,
            borderRadius: 20,
            rotate: "45deg",
            background: `linear-gradient(135deg, #DCE7F5, #7E93B5)`,
            border: `6px solid ${step === 3 ? C.cold : "rgba(255,255,255,0.4)"}`,
            scale: String(step === 3 ? 1 + valvePop * 0.25 : 1),
            boxShadow: step === 3 ? `0 0 40px ${C.cold}` : "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 650 - 200,
            width: 400,
            top: 490,
            textAlign: "center",
            fontFamily: bodyFont,
            fontWeight: 900,
            fontSize: 44,
            color: step === 3 ? C.cold : C.dim,
          }}
        >
          ④ 팽창밸브
        </div>
      </Station>

      {/* 고리 안쪽 설명 카드 (단계마다 교체) */}
      {step === 0 ? (
        <TempCompare
          from={starts[0] + offsets.compare0}
          top={{ label: "방 공기", temp: "30°C", color: C.hot }}
          bottom={{ label: "냉매", temp: "5°C", color: C.cold }}
        />
      ) : null}
      {step === 1 && local < offsets.pump ? (
        <TempCompare
          from={starts[1]}
          blocked
          top={{ label: "냉매", temp: "5°C", color: C.cold }}
          bottom={{ label: "바깥", temp: "35°C", color: C.hot }}
        />
      ) : null}
      {step === 1 && local >= offsets.pump ? (
        <Analogy from={starts[1] + offsets.pump} src="bike_pump.png" text="5°C → 70°C" color={C.hot} />
      ) : null}
      {step === 2 ? (
        <TempCompare
          from={starts[2]}
          top={{ label: "냉매", temp: "70°C", color: C.hot }}
          bottom={{ label: "바깥", temp: "35°C", color: C.warm }}
        />
      ) : null}
      {step === 3 && local >= offsets.spray ? (
        <Analogy from={starts[3] + offsets.spray} src="spray_can.png" text="40°C → 5°C" color={C.cold} />
      ) : null}

      {showCaptions ? (
      <Captions
        accent={step === 1 || step === 2 ? C.hot : C.cold}
        lines={[
          { from: starts[0], text: "① 실내기 속 냉매는 약 [5°C]로 아주 차가워요" },
          { from: starts[0] + 120, text: "방 공기(30°C)보다 차가우니 열이 [냉매 쪽으로] 흘러가요" },
          { from: starts[0] + 240, text: "열을 받은 냉매는 [기체]가 되고, 식은 공기가 바람으로 나와요" },
          { from: starts[1], text: "② 그런데 냉매(5°C)는 바깥(35°C)보다 [차가워요]" },
          { from: starts[1] + 120, text: "이대로는 열을 바깥에 [버릴 수 없어요]" },
          { from: starts[1] + 230, text: "그래서 압축기가 기체를 [꾹 눌러] 70°C로 만들어요" },
          { from: starts[1] + 340, text: "자전거 펌프를 누르면 [뜨거워지는] 것과 같아요" },
          { from: starts[2], text: "③ 이제 냉매(70°C)가 바깥(35°C)보다 [뜨거우니까]" },
          { from: starts[2] + 120, text: "열이 [바깥으로] 빠져나가고, 냉매는 다시 액체가 돼요" },
          { from: starts[2] + 240, text: "그래서 실외기 바람이 [뜨거운] 거예요" },
          { from: starts[3], text: "④ 마지막으로 냉매가 [좁은 밸브]를 통과하면" },
          { from: starts[3] + 120, text: "압력이 뚝 떨어지면서 [다시 5°C]로 차가워져요" },
          { from: starts[3] + 240, text: "스프레이를 오래 뿌리면 [캔이 차가워지는] 것과 같아요" },
        ]}
      />
      ) : null}
    </AbsoluteFill>
  );
};
