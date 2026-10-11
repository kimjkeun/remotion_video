// 1분 쇼츠(TTS 버전) 장면들. 문장(beat)이 바뀔 때마다 화면이 바뀝니다. (세로 1080x1920)
import React from "react";
import { Img, staticFile } from "remotion";
import { Backdrop, BigWord, HeatFlow, Pic } from "../aircon/components";
import { S4Cycle } from "../aircon/scenes/S4Cycle";
import { bodyFont, C, headFont } from "../aircon/theme";
import { useBeat, usePop } from "../longform/beat";
import { Appear, Arrow, Big, Cross, TextCard, ValueCard } from "../longform/ui";

// 세로 화면용: 위는 방 안, 아래는 바깥, 열이 아래로 빠져나감
const RoomOverOutside: React.FC = () => (
  <>
    {[
      { top: 420, label: "방 안", temp: "30°C", color: C.warm },
      { top: 900, label: "바깥", temp: "35°C", color: C.hot },
    ].map((b) => (
      <div
        key={b.label}
        style={{
          position: "absolute",
          left: 90,
          top: b.top,
          width: 900,
          height: 420,
          borderRadius: 44,
          background: `${b.color}1A`,
          border: `6px solid ${b.color}`,
          fontFamily: bodyFont,
          fontWeight: 900,
        }}
      >
        <div style={{ position: "absolute", left: 34, top: 20, fontSize: 52, color: C.dim }}>{b.label}</div>
        <div style={{ position: "absolute", right: 34, top: 14, fontSize: 76, color: b.color }}>{b.temp}</div>
      </div>
    ))}
    <Pic src="indoor_unit.png" x={540} y={640} size={330} />
    <Pic src="outdoor_unit.png" x={540} y={1130} size={330} delay={8} />
    <HeatFlow from={[480, 720]} to={[560, 1060]} count={6} period={45} size={44} />
  </>
);

export const SH1Hook: React.FC = () => {
  const { at } = useBeat();
  return (
    <>
      <Backdrop glow={C.hot} />
      <Appear from={at(0)} until={at(1)}>
        <Pic src="sun_hot.png" x={800} y={470} size={360} float={14} />
        <Pic src="person_hot.png" x={460} y={920} size={700} float={6} />
      </Appear>
      <Appear from={at(1)} until={at(2)}>
        <TextCard x={540} y={820} w={860} size={92} color={C.cold}>
          냉기를
          <br />
          만든다?
        </TextCard>
        {/* 글자가 읽히도록 ✕ 는 카드 오른쪽 아래 모서리에 도장처럼 */}
        <Cross x={880} y={1010} from={at(1) + 30} size={260} />
      </Appear>
      <Appear from={at(2)}>
        <RoomOverOutside />
      </Appear>
    </>
  );
};

export const SH2Rule: React.FC = () => {
  const { at } = useBeat();
  return (
    <>
      <Backdrop glow={C.warm} />
      <Appear from={at(0)} until={at(1)}>
        <Pic src="hot_cup.png" x={290} y={800} size={360} />
        <Pic src="ice_cubes.png" x={800} y={810} size={300} delay={8} />
        <Arrow x1={440} x2={660} y={600} color={C.hot} label="열" />
        {[
          { x: 290, t: "80°C", c: C.hot },
          { x: 800, t: "0°C", c: C.cold },
        ].map((l) => (
          <div
            key={l.x}
            style={{ position: "absolute", left: l.x - 150, width: 300, top: 1010, textAlign: "center", fontFamily: bodyFont, fontWeight: 900, fontSize: 76, color: l.c }}
          >
            {l.t}
          </div>
        ))}
      </Appear>
      <Appear from={at(1)} until={at(2)}>
        <ValueCard x={540} y={590} w={620} label="방 안" value="30°C" color={C.warm} />
        <ValueCard x={540} y={1000} w={620} label="바깥" value="35°C" color={C.hot} />
        <Big x={540} y={1300} w={900} size={110}>
          열을 <span style={{ color: "#FF3B4E" }}>어떻게?</span>
        </Big>
      </Appear>
      <Appear from={at(2)}>
        <Big x={540} y={620} w={900} size={110} color={C.dim}>
          비밀은
        </Big>
        <Big x={540} y={880} w={900} size={260} color={C.cold}>
          냉매
        </Big>
      </Appear>
    </>
  );
};

// 냉매 순환: 기존 쇼츠 다이어그램을 문장 시작 시점에 맞춰 재사용
export const SH3Cycle: React.FC = () => {
  const { at } = useBeat();
  return <S4Cycle starts={[0, 1, 2, 3].map((i) => Math.max(0, at(i)))} offsets={{ compare0: 20, pump: 0, spray: 0 }} showCaptions={false} />;
};

export const SH4Outro: React.FC = () => {
  const { at } = useBeat();
  const pop = usePop(at(1));
  return (
    <>
      <Backdrop />
      <Appear from={at(0)} until={at(1)}>
        <Pic src="person_cool.png" x={540} y={1000} size={760} float={8} />
        <BigWord font={headFont} y={330} size={150}>
          <span style={{ color: C.hot }}>열</span> 펌프
        </BigWord>
      </Appear>
      <Appear from={at(1)}>
        <Big x={540} y={430} w={900} size={96}>
          자세한 원리는
        </Big>
        <Big x={540} y={570} w={900} size={110} color={C.warm}>
          롱폼에서!
        </Big>
        {/* 롱폼 썸네일 카드 */}
        <Img
          src={staticFile("images/thumb_long.png")}
          style={{
            position: "absolute",
            left: 90,
            top: 760,
            width: 900,
            borderRadius: 28,
            border: `6px solid ${C.warm}`,
            boxShadow: "0 24px 50px rgba(0,0,0,0.5)",
            rotate: `${(1 - pop) * -6}deg`,
          }}
        />
      </Appear>
    </>
  );
};
