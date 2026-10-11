// c05 에어컨 속 냉매의 여행: 왼쪽 순환도 + 오른쪽 설명 패널
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { bodyFont, C } from "../../aircon/theme";
import { useBeat } from "../beat";
import { Appear, Big, HeatFlow, Particles, Pic, Stage, TextCard, ValueCard } from "../ui";

const PTS: [number, number][] = [
  [760, 230],
  [260, 230],
  [260, 700],
  [760, 700],
  [1000, 700],
  [1000, 230],
  [760, 230],
];
const SEG = PTS.slice(1).map((p, i) => Math.hypot(p[0] - PTS[i][0], p[1] - PTS[i][1]));
const TOTAL = SEG.reduce((a, b) => a + b, 0);
const S_INDOOR = 735;
const S_COMP = 1470;
const S_OUT = 1945;

const pointAt = (s: number): [number, number] => {
  let rest = ((s % TOTAL) + TOTAL) % TOTAL;
  for (let i = 0; i < SEG.length; i++) {
    if (rest <= SEG[i]) {
      const t = rest / SEG[i];
      return [PTS[i][0] + (PTS[i + 1][0] - PTS[i][0]) * t, PTS[i][1] + (PTS[i + 1][1] - PTS[i][1]) * t];
    }
    rest -= SEG[i];
  }
  return PTS[0];
};

const colorAt = (s: number) => {
  const r = ((s % TOTAL) + TOTAL) % TOTAL;
  if (r < S_INDOOR) return C.cold; // 차가운 액체
  if (r < S_COMP) return C.coolGas; // 열을 머금은 기체
  if (r < S_OUT) return C.hot; // 압축된 뜨거운 기체
  return C.warm; // 열을 버린 액체
};

// 문장 번호 → 강조할 부품 (0 실내기, 1 압축기, 2 실외기, 3 팽창밸브, -1 없음, 9 전부)
const activeFor = (beat: number) => {
  if (beat === 1) return [0, 2];
  if (beat === 3) return [0, 1, 2, 3];
  if (beat >= 4 && beat <= 8) return [0];
  if (beat >= 9 && beat <= 13) return [1];
  if (beat >= 14 && beat <= 18) return [2];
  if (beat >= 19) return [3];
  return [];
};

const Station: React.FC<{
  on: boolean;
  x: number;
  y: number;
  color: string;
  label: string;
  lx: number;
  ly: number;
  children: React.ReactNode;
}> = ({ on, x, y, color, label, lx, ly, children }) => (
  <div style={{ opacity: on ? 1 : 0.5 }}>
    <div
      style={{
        position: "absolute",
        left: x - 100,
        top: y - 100,
        width: 200,
        height: 200,
        borderRadius: "50%",
        background: C.bg2,
        border: `5px solid ${on ? color : "rgba(255,255,255,0.15)"}`,
        boxShadow: on ? `0 0 50px ${color}88` : "none",
      }}
    />
    {children}
    <div
      style={{
        position: "absolute",
        left: lx - 150,
        width: 300,
        top: ly - 30,
        textAlign: "center",
        fontFamily: bodyFont,
        fontWeight: 900,
        fontSize: 40,
        color: on ? color : C.dim,
      }}
    >
      <span style={{ background: C.bg2, padding: "2px 16px", borderRadius: 14 }}>{label}</span>
    </div>
  </div>
);

// 위아래 온도 비교 (열이 위 → 아래로 흐름, blocked 면 ✕)
const TempPair: React.FC<{
  top: [string, string, string];
  bottom: [string, string, string];
  blocked?: boolean;
}> = ({ top, bottom, blocked }) => {
  const frame = useCurrentFrame();
  return (
    <>
      <ValueCard x={1500} y={300} w={460} label={top[0]} value={top[1]} color={top[2]} />
      <div
        style={{
          position: "absolute",
          left: 1270,
          width: 460,
          top: 425,
          textAlign: "center",
          fontFamily: bodyFont,
          fontWeight: 900,
          fontSize: 56,
          color: blocked ? "#FF3B4E" : C.hot,
          translate: blocked ? "0px 0px" : `0px ${Math.sin(frame / 6) * 8}px`,
        }}
      >
        {blocked ? "✕ 열을 못 버려요" : "열 ▼"}
      </div>
      <ValueCard x={1500} y={620} w={460} label={bottom[0]} value={bottom[1]} color={bottom[2]} />
    </>
  );
};

export const Cycle: React.FC = () => {
  const { frame, beat, at } = useBeat();
  const active = activeFor(beat);
  const isOn = (i: number) => active.includes(i);
  const draw = interpolate(frame, [at(1), at(1) + 40], [TOTAL, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const flowing = frame > at(1) + 20;
  const flow = frame * (beat === 2 ? 12 : 8);
  const path = `M ${PTS.map((p) => p.join(" ")).join(" L ")}`;
  const hot = active.length === 1 && (active[0] === 1 || active[0] === 2);

  // 오른쪽 패널: [시작 문장, 끝 문장(포함), 내용]
  const panel: [number, number, React.ReactNode][] = [
    [0, 0, <Big key="p0" x={1500} y={460} w={640} size={96}>에어컨 속으로</Big>],
    [1, 1, <TextCard key="p1" x={1500} y={460} w={600} size={50}>실내기 + 실외기<br />+ 구리 배관</TextCard>],
    [2, 2, <TextCard key="p2" x={1500} y={460} w={600} size={50}>냉매가 배관을 따라<br />빙글빙글 순환</TextCard>],
    [
      3,
      3,
      <div key="p3">
        {["① 실내기", "② 압축기", "③ 실외기", "④ 팽창밸브"].map((t, i) => (
          <TextCard key={t} x={1500} y={250 + i * 140} w={460} size={50} color={i === 1 || i === 2 ? C.hot : C.cold}>
            {t}
          </TextCard>
        ))}
      </div>,
    ],
    [4, 4, <Big key="p4" x={1500} y={460} w={640} size={110} color={C.cold}>① 실내기</Big>],
    [5, 6, <TempPair key="p5" top={["방 공기", "30°C", C.hot]} bottom={["냉매", "5°C", C.cold]} />],
    [7, 7, <TextCard key="p7" x={1500} y={460} w={600} size={52}>냉매: 액체 → 기체<br /><span style={{ color: C.cold }}>(열을 흡수)</span></TextCard>],
    [8, 8, <TextCard key="p8" x={1500} y={460} w={600} size={52}>찬 바람 =<br /><span style={{ color: C.cold }}>열을 빼앗긴 공기</span></TextCard>],
    [9, 9, <Big key="p9" x={1500} y={460} w={640} size={110} color={C.hot}>② 압축기</Big>],
    [10, 10, <TempPair key="p10" blocked top={["냉매", "5°C", C.cold]} bottom={["바깥", "35°C", C.hot]} />],
    [11, 11, <TextCard key="p11" x={1500} y={460} w={600} size={60} color={C.hot}>꾹! 누르면<br /><span style={{ color: C.hot }}>압력 ↑</span></TextCard>],
    [
      12,
      12,
      <div key="p12">
        <Pic src="bike_pump.png" x={1500} y={400} size={420} delay={at(12)} />
        <TextCard x={1500} y={680} w={600} size={46} color={C.hot}>누르면 뜨거워져요</TextCard>
      </div>,
    ],
    [13, 13, <ValueCard key="p13" x={1500} y={460} w={560} label="압축된 냉매" value="약 70°C" color={C.hot} />],
    [14, 14, <Big key="p14" x={1500} y={460} w={640} size={110} color={C.hot}>③ 실외기</Big>],
    [15, 15, <TextCard key="p15" x={1500} y={460} w={600} size={52} color={C.hot}>팬이 바깥 공기를<br />불어 줘요</TextCard>],
    [16, 16, <TempPair key="p16" top={["냉매", "70°C", C.hot]} bottom={["바깥", "35°C", C.warm]} />],
    [17, 17, <TextCard key="p17" x={1500} y={460} w={600} size={52} color={C.hot}>냉매: 기체 → 액체<br /><span style={{ color: C.hot }}>(열을 내놓음)</span></TextCard>],
    [18, 18, <TextCard key="p18" x={1500} y={460} w={600} size={52} color={C.hot}>실외기 바람 =<br /><span style={{ color: C.hot }}>방에서 가져온 열</span></TextCard>],
    [19, 19, <Big key="p19" x={1500} y={460} w={640} size={100} color={C.cold}>④ 팽창밸브</Big>],
    [20, 20, <TextCard key="p20" x={1500} y={460} w={600} size={56}>좁은 구멍 통과<br /><span style={{ color: C.cold }}>압력 ↓</span></TextCard>],
    [21, 21, <ValueCard key="p21" x={1500} y={460} w={600} label="냉매 온도" value="40 → 5°C" color={C.cold} />],
    [
      22,
      22,
      <div key="p22">
        <Pic src="spray_can.png" x={1500} y={400} size={420} delay={at(22)} />
        <TextCard x={1500} y={680} w={600} size={46}>뿌릴수록 캔이 차가워요</TextCard>
      </div>,
    ],
    [23, 23, <TextCard key="p23" x={1500} y={460} w={600} size={60}>다시 실내기로<br /><span style={{ color: C.cold }}>↻ 반복</span></TextCard>],
  ];

  return (
    <Stage glow={hot ? C.hot : C.cold}>
      {/* 벽 */}
      <div style={{ position: "absolute", left: 560, top: 150, height: 650, borderLeft: "6px dashed rgba(255,255,255,0.22)" }} />
      {[
        { x: 400, t: "방 안" },
        { x: 860, t: "바깥" },
      ].map((l) => (
        <div
          key={l.t}
          style={{ position: "absolute", left: l.x - 100, width: 200, top: 118, textAlign: "center", fontFamily: bodyFont, fontWeight: 900, fontSize: 42, color: C.dim }}
        >
          {l.t}
        </div>
      ))}

      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <path d={path} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={30} strokeLinejoin="round" strokeDasharray={TOTAL} strokeDashoffset={draw} />
        {flowing
          ? new Array(34).fill(0).map((_, i) => {
              const s = flow + (i * TOTAL) / 34;
              const [x, y] = pointAt(s);
              const col = colorAt(s);
              return <circle key={i} cx={x} cy={y} r={beat === 2 ? 14 : 11} fill={col} style={{ filter: `drop-shadow(0 0 8px ${col})` }} />;
            })
          : null}
      </svg>

      <Station on={isOn(0)} x={260} y={465} color={C.cold} label="① 실내기" lx={260} ly={600}>
        <Pic src="indoor_unit.png" x={260} y={465} size={180} float={3} />
      </Station>
      <Station on={isOn(1)} x={760} y={700} color={C.hot} label="② 압축기" lx={500} ly={720}>
        <Pic
          src="compressor.png"
          x={760}
          y={700}
          size={165}
          float={0}
          style={beat >= 11 && beat <= 13 ? { scale: String(1 + Math.abs(Math.sin(frame / 4)) * 0.08) } : undefined}
        />
      </Station>
      <Station on={isOn(2)} x={1000} y={465} color={C.hot} label="③ 실외기" lx={1000} ly={600}>
        <Pic src="outdoor_unit.png" x={1000} y={465} size={180} float={3} />
      </Station>
      <Station on={isOn(3)} x={760} y={230} color={C.cold} label="④ 팽창밸브" lx={760} ly={360}>
        <div
          style={{
            position: "absolute",
            left: 760 - 42,
            top: 230 - 42,
            width: 84,
            height: 84,
            borderRadius: 16,
            rotate: "45deg",
            background: "linear-gradient(135deg, #DCE7F5, #7E93B5)",
            border: `6px solid ${isOn(3) ? C.cold : "rgba(255,255,255,0.4)"}`,
          }}
        />
      </Station>

      {/* 열의 이동 표시 */}
      {beat >= 6 && beat <= 8 ? <HeatFlow from={[120, 760]} to={[250, 480]} count={5} period={45} size={34} /> : null}
      {beat === 8 ? <Particles x={300} y={520} w={220} h={200} dir={1} count={9} color={C.cold} size={18} /> : null}
      {beat >= 16 && beat <= 18 ? <HeatFlow from={[1000, 465]} to={[1140, 160]} count={6} period={40} size={38} /> : null}

      {panel.map(([b0, b1, node]) =>
        beat >= b0 && beat <= b1 ? (
          <Appear key={b0} from={at(b0)} until={b1 < 23 ? at(b1 + 1) : undefined}>
            {node}
          </Appear>
        ) : null,
      )}
    </Stage>
  );
};
