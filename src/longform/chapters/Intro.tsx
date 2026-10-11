// c00 도입, c01 열의 규칙, c02 열을 거꾸로 보내려면
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { bodyFont, C } from "../../aircon/theme";
import { useBeat } from "../beat";
import { Appear, Arrow, Big, Cross, HeatFlow, Pic, RoomOutside, Stage, TextCard } from "../ui";

// 방 안 → 바깥으로 열을 옮기는 그림 (도입·마무리에서 함께 씀)
export const MoveHeat: React.FC = () => (
  <>
    <RoomOutside roomTemp="30°C" outTemp="35°C" roomColor={C.warm} outColor={C.hot} />
    <Pic src="indoor_unit.png" x={560} y={400} size={320} />
    <Pic src="outdoor_unit.png" x={1360} y={520} size={320} delay={8} />
    <HeatFlow from={[640, 520]} to={[1280, 520]} count={7} period={50} size={44} />
  </>
);

export const C00Intro: React.FC = () => {
  const { at } = useBeat();
  return (
    <Stage glow={C.hot}>
      <Appear from={at(0)} until={at(3)}>
        <Pic src="sun_hot.png" x={1300} y={300} size={300} float={14} />
        <Pic src="person_hot.png" x={760} y={480} size={600} float={6} />
      </Appear>
      <Appear from={at(1)} until={at(2)}>
        <Big x={1250} y={620} w={300} size={240} color={C.warm}>?</Big>
      </Appear>
      <Appear from={at(2)} until={at(3)}>
        <Pic src="ice_cubes.png" x={1320} y={620} size={280} />
        <Cross x={1320} y={620} from={at(2) + 25} size={240} />
      </Appear>
      <Appear from={at(3)} until={at(4)}>
        <TextCard x={960} y={450} w={900} size={96} color={C.cold}>냉기를 만든다?</TextCard>
        <Cross x={960} y={450} from={at(3) + 30} size={380} />
      </Appear>
      <Appear from={at(4)}>
        <MoveHeat />
      </Appear>
    </Stage>
  );
};

export const C01Rule: React.FC = () => {
  const { frame, at } = useBeat();
  const cool = interpolate(frame, [at(2), at(4)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Stage glow={C.warm}>
      <Appear from={at(0)} until={at(1)}>
        <Big x={960} y={460} size={160} color={C.warm}>열의 규칙</Big>
      </Appear>
      <Appear from={at(1)}>
        <TextCard x={960} y={190} w={1200} size={58} color={C.warm}>
          열은 <span style={{ color: C.hot }}>뜨거운 곳</span> → <span style={{ color: C.cold }}>차가운 곳</span>으로만!
        </TextCard>
        <Pic src="hot_cup.png" x={430} y={520} size={360} />
        <Pic src="ice_cubes.png" x={1490} y={530} size={300 * (1 - cool * 0.35)} delay={6} />
        {[
          { x: 430, t: `${Math.round(80 - cool * 40)}°C`, c: C.hot },
          { x: 1490, t: "0°C", c: C.cold },
        ].map((l) => (
          <div
            key={l.x}
            style={{ position: "absolute", left: l.x - 150, width: 300, top: 720, textAlign: "center", fontFamily: bodyFont, fontWeight: 900, fontSize: 64, color: l.c }}
          >
            {l.t}
          </div>
        ))}
        <Arrow x1={680} x2={1240} y={520} color={C.hot} label="열" />
      </Appear>
      {frame >= at(3) ? <HeatFlow from={[600, 470]} to={[1380, 500]} count={8} period={60} size={40} /> : null}
      <Appear from={at(4)}>
        <div style={{ position: "absolute", inset: 0, background: "rgba(11,21,48,0.55)" }} />
        <TextCard x={960} y={500} w={1000} size={60} color="#FF3B4E">
          차가운 곳 → 뜨거운 곳<br />저절로는 <span style={{ color: "#FF3B4E" }}>절대 ✕</span>
        </TextCard>
      </Appear>
    </Stage>
  );
};

// 언덕을 따라 아래로 흐르는 물 (c02 비유)
const Downhill: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <path d="M 260 300 L 1100 700 L 1100 760 L 260 760 Z" fill="#2B3F6B" />
        <path d="M 260 300 L 1100 700" stroke="#5E7BB0" strokeWidth={10} />
        {new Array(12).fill(0).map((_, i) => {
          const p = ((frame / 70 + i / 12) % 1 + 1) % 1;
          return <circle key={i} cx={270 + p * 820} cy={285 + p * 390} r={16} fill={C.cold} opacity={0.9} />;
        })}
      </svg>
      <div style={{ position: "absolute", left: 200, top: 210, fontFamily: bodyFont, fontWeight: 900, fontSize: 48, color: C.dim }}>높은 곳</div>
      <div style={{ position: "absolute", left: 960, top: 780, fontFamily: bodyFont, fontWeight: 900, fontSize: 48, color: C.dim }}>낮은 곳</div>
    </>
  );
};

export const C02Pump: React.FC = () => {
  const { at } = useBeat();
  return (
    <Stage glow={C.hot}>
      <Appear from={at(0)} until={at(4)}>
        <RoomOutside roomTemp="30°C" outTemp="35°C" roomColor={C.warm} outColor={C.hot} />
      </Appear>
      <Appear from={at(2)} until={at(4)}>
        <Arrow x1={1260} x2={660} y={430} color={C.hot} label="자연스러운 방향" />
      </Appear>
      <Appear from={at(3)} until={at(4)}>
        <Arrow x1={660} x2={1260} y={620} color={C.cold} label="이쪽으로는 어떻게?" />
      </Appear>
      <Appear from={at(4)} until={at(6)}>
        <Downhill />
      </Appear>
      <Appear from={at(5)} until={at(6)}>
        <Pic src="water_pump.png" x={1460} y={470} size={460} delay={at(5)} />
        <TextCard x={1460} y={790} w={480} size={46}>펌프면 위로!</TextCard>
      </Appear>
      <Appear from={at(6)} until={at(7)}>
        <Pic src="water_pump.png" x={560} y={460} size={380} />
        <Big x={1260} y={460} w={900} size={150}>
          <span style={{ color: C.hot }}>열</span> 펌프
        </Big>
      </Appear>
      <Appear from={at(7)}>
        <Big x={960} y={330} size={110} color={C.dim}>주인공은</Big>
        <Big x={960} y={560} size={220} color={C.cold}>냉매</Big>
      </Appear>
    </Stage>
  );
};
