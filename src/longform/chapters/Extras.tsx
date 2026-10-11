// c06 한눈에 정리, c07 물이 나오는 이유, c08 냉장고와 난방, c09 똑똑하게 쓰는 법, c10 마무리
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { bodyFont, C } from "../../aircon/theme";
import { useBeat } from "../beat";
import { Appear, Big, HeatFlow, Particles, Pic, RoomOutside, Stage, TextCard, ValueCard } from "../ui";
import { MoveHeat } from "./Intro";

// ---------- c06 ----------
const STEPS = [
  { x: 560, y: 290, img: "indoor_unit.png", t: "실내기", d: "열을 빼앗아요", c: C.cold },
  { x: 1360, y: 290, img: "compressor.png", t: "압축기", d: "뜨겁게 만들어요", c: C.hot },
  { x: 1360, y: 640, img: "outdoor_unit.png", t: "실외기", d: "열을 버려요", c: C.hot },
  { x: 560, y: 640, img: null, t: "팽창밸브", d: "다시 차갑게", c: C.cold },
];

export const C06Summary: React.FC = () => {
  const { frame, beat, at } = useBeat();
  return (
    <Stage>
      {/* 카드 사이 순환 화살표 */}
      {[
        { x: 960, y: 290, t: "→" },
        { x: 1360, y: 465, t: "↓" },
        { x: 960, y: 640, t: "←" },
        { x: 560, y: 465, t: "↑" },
      ].map((a, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: a.x - 50,
            top: a.y - 50,
            width: 100,
            textAlign: "center",
            fontFamily: bodyFont,
            fontWeight: 900,
            fontSize: 80,
            lineHeight: "100px",
            color: beat >= 5 ? C.ink : C.dim,
          }}
        >
          {a.t}
        </div>
      ))}
      {STEPS.map((s, i) => {
        const on = beat === i + 1 || beat >= 5;
        return (
          <Appear key={s.t} from={at(0) + i * 6}>
            <div
              style={{
                position: "absolute",
                left: s.x - 300,
                top: s.y - 130,
                width: 600,
                height: 260,
                borderRadius: 36,
                background: on ? `${s.c}22` : "rgba(255,255,255,0.04)",
                border: `6px solid ${on ? s.c : "rgba(255,255,255,0.15)"}`,
                opacity: on ? 1 : 0.55,
                fontFamily: bodyFont,
                fontWeight: 900,
              }}
            >
              <div style={{ position: "absolute", left: 250, top: 50, fontSize: 40, color: C.dim }}>
                {i + 1}. {s.t}
              </div>
              <div style={{ position: "absolute", left: 250, top: 112, fontSize: 44, color: on ? s.c : C.ink, whiteSpace: "nowrap" }}>{s.d}</div>
            </div>
            {s.img ? (
              <Pic src={s.img} x={s.x - 170} y={s.y} size={210} float={3} />
            ) : (
              <div
                style={{
                  position: "absolute",
                  left: s.x - 170 - 45,
                  top: s.y - 45,
                  width: 90,
                  height: 90,
                  borderRadius: 16,
                  rotate: "45deg",
                  background: "linear-gradient(135deg, #DCE7F5, #7E93B5)",
                  border: `6px solid ${s.c}`,
                }}
              />
            )}
          </Appear>
        );
      })}
      {beat >= 5 ? (
        <div
          style={{
            position: "absolute",
            left: 960 - 80,
            top: 465 - 80,
            width: 160,
            height: 160,
            textAlign: "center",
            fontSize: 140,
            lineHeight: "160px",
            color: C.cold,
            rotate: `${(frame - at(5)) * 3}deg`,
          }}
        >
          ↻
        </div>
      ) : null}
    </Stage>
  );
};

// ---------- c07 ----------
const DrainHose: React.FC = () => {
  const frame = useCurrentFrame();
  const d = "M 640 420 C 900 420 900 760 1180 760 L 1560 760";
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      <path d={d} fill="none" stroke="#C9D6EA" strokeWidth={34} strokeLinecap="round" />
      <path id="hose" d={d} fill="none" stroke="#7E93B5" strokeWidth={18} strokeLinecap="round" />
      {new Array(6).fill(0).map((_, i) => {
        const p = ((frame / 90 + i / 6) % 1 + 1) % 1;
        // 경로를 따라 근사 위치 (두 구간)
        const x = p < 0.6 ? 640 + (p / 0.6) * 540 : 1180 + ((p - 0.6) / 0.4) * 380;
        const y = p < 0.6 ? 420 + (1 - Math.cos((p / 0.6) * Math.PI)) * 170 : 760;
        return <circle key={i} cx={x} cy={y} r={12} fill={C.cold} />;
      })}
    </svg>
  );
};

export const C07Water: React.FC = () => {
  const { at } = useBeat();
  return (
    <Stage>
      <Appear from={at(0)} until={at(1)}>
        <Pic src="indoor_unit.png" x={960} y={330} size={480} />
        <Particles x={880} y={480} w={160} h={300} dir={1} count={6} color={C.cold} size={20} period={50} />
      </Appear>
      <Appear from={at(1)} until={at(2)}>
        <Pic src="cold_glass.png" x={960} y={470} size={560} delay={at(1)} />
      </Appear>
      <Appear from={at(2)} until={at(4)}>
        <Particles x={300} y={160} w={1320} h={620} count={34} size={14} period={120} start={at(2)} />
        <TextCard x={960} y={200} w={520} size={50}>공기 속 수증기</TextCard>
      </Appear>
      <Appear from={at(3)} until={at(4)}>
        {/* 차가운 배관 */}
        <div style={{ position: "absolute", left: 420, top: 440, width: 1080, height: 60, borderRadius: 30, background: `linear-gradient(180deg, #CFEFFF, ${C.cold})`, boxShadow: `0 0 40px ${C.cold}` }} />
        <Particles x={460} y={510} w={1000} h={260} dir={1} count={14} color={C.cold} size={20} period={55} start={at(3)} />
      </Appear>
      <Appear from={at(4)} until={at(5)}>
        <Pic src="person_cool.png" x={640} y={480} size={520} delay={at(4)} />
        <TextCard x={1320} y={380} w={560} size={60}>시원하고</TextCard>
        <TextCard x={1320} y={580} w={560} size={60} color={C.warm}>
          습기 ↓ <span style={{ color: C.warm }}>뽀송</span>
        </TextCard>
      </Appear>
      <Appear from={at(5)}>
        <Pic src="indoor_unit.png" x={480} y={360} size={340} />
        <DrainHose />
        <div style={{ position: "absolute", left: 1480, top: 660, fontFamily: bodyFont, fontWeight: 900, fontSize: 50, color: C.dim }}>
          바깥으로 →
        </div>
      </Appear>
    </Stage>
  );
};

// ---------- c08 ----------
export const C08Fridge: React.FC = () => {
  const { at } = useBeat();
  return (
    <Stage>
      <Appear from={at(0)} until={at(1)}>
        <Big x={960} y={460} size={170} color={C.warm}>같은 원리!</Big>
      </Appear>
      <Appear from={at(1)} until={at(3)}>
        <Pic src="refrigerator.png" x={700} y={480} size={580} />
        <HeatFlow from={[760, 480]} to={[1300, 380]} count={7} period={50} size={42} />
        <TextCard x={1440} y={260} w={600} size={52} color={C.hot}>
          안의 열 → <span style={{ color: C.hot }}>바깥으로</span>
        </TextCard>
      </Appear>
      <Appear from={at(2)} until={at(3)}>
        <TextCard x={1440} y={640} w={600} size={48} color={C.warm}>
          그래서 뒤쪽·옆면이<br /><span style={{ color: C.warm }}>따뜻해요</span>
        </TextCard>
      </Appear>
      <Appear from={at(3)}>
        <RoomOutside roomTemp="22°C" outTemp="0°C" roomColor={C.warm} outColor={C.cold} />
        <Particles x={1080} y={260} w={560} h={480} dir={1} count={14} color="#FFFFFF" size={14} period={110} />
        <HeatFlow from={[1300, 540]} to={[640, 540]} count={7} period={55} size={44} />
        <Pic src="indoor_unit.png" x={560} y={400} size={300} />
        <Pic src="outdoor_unit.png" x={1360} y={560} size={300} delay={8} />
      </Appear>
      <Appear from={at(4)}>
        <TextCard x={960} y={815} w={700} size={44} color={C.warm}>
          겨울엔 거꾸로 → <span style={{ color: C.warm }}>난방!</span>
        </TextCard>
      </Appear>
    </Stage>
  );
};

// ---------- c09 ----------
const Coin: React.FC<{ from: number }> = ({ from }) => {
  const frame = useCurrentFrame();
  const t = (((frame - from) % 45) + 45) % 45;
  if (frame < from) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 960 - 40,
        top: interpolate(t, [0, 30], [120, 300], { extrapolateRight: "clamp" }),
        width: 80,
        height: 80,
        borderRadius: "50%",
        background: "radial-gradient(circle at 35% 35%, #FFE58A, #E8A400)",
        border: "5px solid #B07B00",
        opacity: interpolate(t, [0, 5, 28, 32], [0, 1, 1, 0]),
      }}
    />
  );
};

export const C09Tips: React.FC = () => {
  const { at } = useBeat();
  return (
    <Stage glow={C.warm}>
      <Appear from={at(0)} until={at(1)}>
        <Pic src="piggy_bank.png" x={620} y={470} size={480} />
        <Big x={1300} y={470} w={800} size={130} color={C.warm}>꿀팁 3가지</Big>
      </Appear>
      <Appear from={at(1)} until={at(2)}>
        <Pic src="thermometer.png" x={600} y={470} size={460} />
        <ValueCard x={1280} y={400} w={560} label="① 희망 온도" value="26°C" color={C.cold} />
        <TextCard x={1280} y={660} w={640} size={44}>온도 차이 ↓ = 옮길 열 ↓</TextCard>
      </Appear>
      <Appear from={at(2)} until={at(3)}>
        <Pic src="air_filter.png" x={600} y={470} size={480} />
        <TextCard x={1280} y={400} w={640} size={56}>② 필터 청소</TextCard>
        <TextCard x={1280} y={600} w={640} size={44}>먼지 ✕ → 바람이 술술</TextCard>
      </Appear>
      <Appear from={at(3)} until={at(5)}>
        <Pic src="outdoor_unit.png" x={640} y={540} size={440} />
        <TextCard x={1320} y={330} w={680} size={52} color={C.hot}>③ 실외기 주변 비우기</TextCard>
      </Appear>
      <Appear from={at(4)} until={at(5)}>
        {/* 햇빛 가리개 */}
        <div
          style={{
            position: "absolute",
            left: 380,
            top: 250,
            width: 520,
            height: 44,
            borderRadius: 14,
            rotate: "-6deg",
            background: "linear-gradient(90deg, #3D6FD1, #5BC8FF)",
            boxShadow: "0 14px 30px rgba(0,0,0,0.4)",
          }}
        />
        <Pic src="sun_hot.png" x={1000} y={170} size={200} />
        <TextCard x={1320} y={560} w={680} size={48}>그늘이면 열을 더 잘 버려요</TextCard>
      </Appear>
      <Appear from={at(5)}>
        <Pic src="piggy_bank.png" x={960} y={560} size={480} />
        <Coin from={at(5)} />
      </Appear>
    </Stage>
  );
};

// ---------- c10 ----------
export const C10Outro: React.FC = () => {
  const { at } = useBeat();
  return (
    <Stage>
      <Appear from={at(0)} until={at(1)}>
        <Big x={960} y={330} w={1600} size={100} color={C.dim}>에어컨은</Big>
        <Big x={960} y={520} w={1700} size={130}>
          <span style={{ color: C.hot }}>열</span>을 옮기는 기계
        </Big>
      </Appear>
      <Appear from={at(1)} until={at(2)}>
        <MoveHeat />
      </Appear>
      <Appear from={at(2)}>
        <Pic src="person_cool.png" x={640} y={480} size={560} />
        <TextCard x={1320} y={400} w={620} size={64} color={C.warm}>구독 · 좋아요</TextCard>
        <TextCard x={1320} y={600} w={620} size={48}>다음 영상에서 만나요!</TextCard>
      </Appear>
    </Stage>
  );
};
