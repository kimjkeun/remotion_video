// 하늘 편 롱폼 장면 (1920x1080). 문장(beat)마다 화면이 바뀝니다.
import React from "react";
import { interpolate } from "remotion";
import { bodyFont, C } from "../aircon/theme";
import { useBeat } from "../longform/beat";
import { Appear, Big, Particles, Pic, Stage, TextCard, ValueCard } from "../longform/ui";
import { LightPath, RAINBOW, Scatter, ScatterBars, SKY, SkyBg, Wave } from "./components";

const img = (name: string) => `sky/${name}.png`;

// 정사각 풍경 그림(하늘·노을)을 둥근 카드로
const Scene: React.FC<{ name: string; x: number; y: number; size: number; delay?: number }> = ({ name, x, y, size, delay }) => (
  <>
    <div
      style={{
        position: "absolute",
        left: x - size / 2 - 8,
        top: y - size / 2 - 8,
        width: size + 16,
        height: size + 16,
        borderRadius: 44,
        background: "rgba(255,255,255,0.08)",
      }}
    />
    <Pic src={img(name)} x={x} y={y} size={size} delay={delay} float={4} style={{ borderRadius: 36 }} />
  </>
);

export const K00Intro: React.FC = () => {
  const { at } = useBeat();
  return (
    <Stage>
      <Appear from={at(0)} until={at(1)}>
        <Scene name="blue_sky" x={700} y={480} size={600} />
        <Pic src={img("person_wonder")} x={1340} y={540} size={560} />
      </Appear>
      <Appear from={at(1)} until={at(3)}>
        <Scene name="blue_sky" x={560} y={470} size={520} />
        <Scene name="sunset" x={1360} y={470} size={520} delay={at(1)} />
      </Appear>
      <Appear from={at(2)} until={at(3)}>
        <Big x={960} y={480} w={300} size={240} color={SKY.yellow}>?</Big>
      </Appear>
      <Appear from={at(3)} until={at(4)}>
        <Pic src={img("sun")} x={420} y={300} size={300} />
        <Pic src={img("earth_atmosphere")} x={1300} y={560} size={560} delay={8} />
        <Wave x={560} y={420} len={520} wavelength={90} amp={24} color={SKY.white} width={8} />
      </Appear>
      <Appear from={at(4)}>
        <Big x={960} y={400} size={130}>하늘 색의 비밀</Big>
        <div style={{ position: "absolute", left: 560, top: 560, width: 800, height: 24, borderRadius: 12, background: `linear-gradient(90deg, ${RAINBOW.join(",")})` }} />
      </Appear>
    </Stage>
  );
};

export const K01Light: React.FC = () => {
  const { at } = useBeat();
  return (
    <Stage glow={SKY.yellow}>
      <Appear from={at(0)} until={at(2)}>
        <Pic src={img("sun")} x={960} y={420} size={460} />
      </Appear>
      <Appear from={at(1)} until={at(2)}>
        <TextCard x={960} y={760} w={980} size={56} color={SKY.yellow}>
          흰빛 = <span style={{ background: `linear-gradient(90deg, ${RAINBOW.join(",")})`, WebkitBackgroundClip: "text", color: "transparent" }}>여러 색의 혼합</span>
        </TextCard>
      </Appear>
      <Appear from={at(2)} until={at(3)}>
        <Pic src={img("prism")} x={960} y={470} size={680} delay={at(2)} />
      </Appear>
      <Appear from={at(3)} until={at(4)}>
        <Wave x={360} y={470} len={1200} wavelength={240} amp={70} color={C.cold} />
        {/* 파장 표시 */}
        <div style={{ position: "absolute", left: 420, top: 600, width: 240, borderTop: `5px solid ${C.ink}` }} />
        <div style={{ position: "absolute", left: 420, top: 620, width: 240, textAlign: "center", fontFamily: bodyFont, fontWeight: 900, fontSize: 48, color: C.ink }}>파장</div>
      </Appear>
      <Appear from={at(4)} until={at(5)}>
        <Wave x={360} y={330} len={1200} wavelength={300} amp={60} color={SKY.red} label="빨강: 파장이 길다" />
        <Wave x={360} y={650} len={1200} wavelength={110} amp={60} color={SKY.blue} label="파랑·보라: 파장이 짧다" />
      </Appear>
      <Appear from={at(5)}>
        <Big x={960} y={470} size={140} color={SKY.yellow}>
          열쇠는 <span style={{ color: C.cold }}>파장</span>
        </Big>
      </Appear>
    </Stage>
  );
};

const Molecules: React.FC = () => (
  <>
    <Pic src={img("molecule_n2")} x={560} y={360} size={230} float={14} />
    <Pic src={img("molecule_o2")} x={980} y={560} size={210} delay={6} float={12} />
    <Pic src={img("molecule_n2")} x={1380} y={330} size={200} delay={10} float={16} />
    <Pic src={img("molecule_o2")} x={1500} y={640} size={180} delay={14} float={10} />
    <Pic src={img("molecule_n2")} x={420} y={680} size={190} delay={18} float={12} />
  </>
);

export const K02Air: React.FC = () => {
  const { at } = useBeat();
  return (
    <Stage>
      <Appear from={at(0)} until={at(1)}>
        <Pic src={img("earth_atmosphere")} x={1120} y={500} size={640} />
        <Pic src={img("sun")} x={380} y={300} size={260} delay={6} />
        <Wave x={500} y={360} len={300} wavelength={80} amp={20} color={SKY.white} width={8} />
      </Appear>
      <Appear from={at(1)} until={at(2)}>
        <Molecules />
        <TextCard x={960} y={140} w={640} size={48}>공기 = 질소 · 산소 분자</TextCard>
      </Appear>
      <Appear from={at(2)}>
        <Scatter box={{ x: 260, y: 160, w: 1400, h: 700 }} mode="white" start={at(2)} />
      </Appear>
      <Appear from={at(3)}>
        <TextCard x={960} y={150} w={520} size={60} color={SKY.yellow}>산란</TextCard>
      </Appear>
    </Stage>
  );
};

export const K03Blue: React.FC = () => {
  const { at } = useBeat();
  return (
    <Stage glow={SKY.blue}>
      <Appear from={at(0)} until={at(2)}>
        <Scatter box={{ x: 260, y: 160, w: 1400, h: 700 }} mode="blue" start={at(0)} />
      </Appear>
      <Appear from={at(1)} until={at(2)}>
        <TextCard x={1500} y={220} w={560} size={44}>
          <span style={{ color: SKY.blue }}>파랑</span>은 흩어지고
          <br />
          <span style={{ color: SKY.red }}>빨강</span>은 통과
        </TextCard>
      </Appear>
      <Appear from={at(2)} until={at(3)}>
        <ValueCard x={960} y={470} w={900} label="파장이 ½ 이 되면 흩어지는 정도는" value="16배" color={SKY.blue} />
      </Appear>
      <Appear from={at(3)} until={at(4)}>
        <ScatterBars box={{ x: 360, y: 150, w: 1200, h: 700 }} start={at(3)} />
        <div style={{ position: "absolute", left: 360, top: 120, fontFamily: bodyFont, fontWeight: 900, fontSize: 40, color: C.dim }}>흩어지는 정도 (빨강 = 1)</div>
      </Appear>
      <Appear from={at(4)}>
        <Big x={960} y={420} size={150} color={SKY.blue}>레일리 산란</Big>
        <TextCard x={960} y={640} w={760} size={46}>작은 알갱이일수록, 짧은 파장일수록</TextCard>
      </Appear>
    </Stage>
  );
};

export const K04Sky: React.FC = () => {
  const { frame, at } = useBeat();
  return (
    <Stage glow={SKY.blue}>
      <Appear from={at(0)} until={at(1)}>
        <Pic src={img("person_wonder")} x={960} y={520} size={600} />
      </Appear>
      <Appear from={at(1)} until={at(3)}>
        <Scatter box={{ x: 260, y: 160, w: 1400, h: 700 }} mode="blue" start={at(1)} />
      </Appear>
      <Appear from={at(3)} until={at(4)}>
        <SkyBg amount={0} box={{ x: 160, y: 130, w: 1600, h: 720 }} />
        <Pic src={img("person_wonder")} x={960} y={640} size={420} />
        {/* 하늘 곳곳에서 눈으로 모이는 파란빛 */}
        {new Array(10).fill(0).map((_, i) => {
          const sx = 260 + i * 160;
          const p = ((((frame - at(3)) / 40 + i * 0.1) % 1) + 1) % 1;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: interpolate(p, [0, 1], [sx, 960]) - 12,
                top: interpolate(p, [0, 1], [170, 560]) - 12,
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: SKY.blue,
                boxShadow: `0 0 16px ${SKY.blue}`,
                opacity: interpolate(p, [0, 0.1, 0.9, 1], [0, 1, 1, 0]),
              }}
            />
          );
        })}
      </Appear>
      <Appear from={at(4)}>
        <Scene name="blue_sky" x={700} y={480} size={600} />
        <TextCard x={1400} y={480} w={620} size={52}>
          하늘 <span style={{ color: SKY.blue }}>전체</span>가
          <br />
          파랗게!
        </TextCard>
      </Appear>
    </Stage>
  );
};

export const K05Violet: React.FC = () => {
  const { at } = useBeat();
  const reasons = ["① 햇빛에 보라가 적어요", "② 높은 곳에서 흡수돼요", "③ 눈은 파랑에 더 민감해요"];
  return (
    <Stage glow={SKY.violet}>
      <Appear from={at(0)} until={at(2)}>
        <Big x={960} y={420} size={130} color={SKY.violet}>보라색은?</Big>
      </Appear>
      <Appear from={at(1)} until={at(2)}>
        <TextCard x={960} y={640} w={760} size={48}>보라가 파장이 더 짧은데...</TextCard>
      </Appear>
      {reasons.map((r, i) => (
        <Appear key={r} from={at(2 + i)} until={at(5)}>
          <TextCard x={960} y={260 + i * 190} w={900} size={56} color={i === 2 ? SKY.blue : SKY.violet}>
            {r}
          </TextCard>
        </Appear>
      ))}
      <Appear from={at(5)}>
        <Scene name="blue_sky" x={960} y={480} size={600} />
      </Appear>
    </Stage>
  );
};

export const K06Sunset: React.FC = () => {
  const { at } = useBeat();
  return (
    <Stage glow={SKY.orange}>
      <Appear from={at(0)} until={at(1)}>
        <Scene name="sunset" x={960} y={480} size={620} />
      </Appear>
      <Appear from={at(1)} until={at(2)}>
        <LightPath box={{ x: 360, y: 120, w: 1200, h: 675 }} mode="noon" start={at(1)} />
        <TextCard x={1600} y={240} w={380} size={44}>한낮: 짧은 길</TextCard>
      </Appear>
      <Appear from={at(2)} until={at(4)}>
        <LightPath box={{ x: 360, y: 120, w: 1200, h: 675 }} mode="sunset" start={at(2)} />
        <TextCard x={1600} y={240} w={380} size={44} color={SKY.orange}>저녁: 긴 길</TextCard>
      </Appear>
      <Appear from={at(3)} until={at(4)}>
        <ValueCard x={1560} y={600} w={460} label="지나는 공기" value="수십 배" color={SKY.orange} />
      </Appear>
      <Appear from={at(4)} until={at(6)}>
        <LightPath box={{ x: 360, y: 120, w: 1200, h: 675 }} mode="sunset" drop start={at(4)} />
      </Appear>
      <Appear from={at(4)} until={at(5)}>
        <TextCard x={1600} y={240} w={420} size={44} color={SKY.blue}>파랑은 도중에 흩어짐</TextCard>
      </Appear>
      <Appear from={at(5)} until={at(6)}>
        <TextCard x={1600} y={240} w={420} size={44} color={SKY.orange}>빨강·주황만 도착</TextCard>
      </Appear>
      <Appear from={at(6)}>
        <Scene name="sunset" x={960} y={480} size={620} delay={at(6)} />
      </Appear>
      <Appear from={at(7)}>
        <Particles x={680} y={200} w={560} h={560} count={18} color="#FFD9A8" size={10} period={140} />
      </Appear>
    </Stage>
  );
};

export const K07Cloud: React.FC = () => {
  const { at } = useBeat();
  return (
    <Stage>
      <Appear from={at(0)} until={at(1)}>
        <Pic src={img("cloud_white")} x={960} y={460} size={620} />
      </Appear>
      <Appear from={at(1)} until={at(2)}>
        {/* 크기 비교: 공기 분자 vs 물방울 */}
        <div style={{ position: "absolute", left: 560 - 15, top: 470 - 15, width: 30, height: 30, borderRadius: "50%", background: C.coolGas }} />
        <div style={{ position: "absolute", left: 1260 - 180, top: 470 - 180, width: 360, height: 360, borderRadius: "50%", background: "rgba(200,230,255,0.85)", border: "6px solid white" }} />
        <TextCard x={560} y={720} w={420} size={44}>공기 분자</TextCard>
        <TextCard x={1260} y={720} w={420} size={44}>물방울</TextCard>
      </Appear>
      <Appear from={at(2)} until={at(4)}>
        <Scatter box={{ x: 260, y: 160, w: 1400, h: 700 }} mode="all" start={at(2)} />
      </Appear>
      <Appear from={at(3)} until={at(4)}>
        <TextCard x={960} y={140} w={680} size={52}>모든 색 골고루 = 흰색</TextCard>
      </Appear>
      <Appear from={at(4)}>
        <Pic src={img("cloud_white")} x={600} y={460} size={460} />
        <Pic src={img("cloud_dark")} x={1320} y={460} size={500} delay={8} />
        <TextCard x={1320} y={780} w={560} size={44}>두꺼워서 빛이 못 뚫어요</TextCard>
      </Appear>
    </Stage>
  );
};

export const K08Mars: React.FC = () => {
  const { at } = useBeat();
  return (
    <Stage glow={SKY.orange}>
      <Appear from={at(0)} until={at(2)}>
        <Pic src={img("mars")} x={960} y={470} size={600} />
      </Appear>
      <Appear from={at(1)} until={at(2)}>
        <Particles x={560} y={160} w={800} h={640} count={24} color="#E0A070" size={10} period={120} />
      </Appear>
      <Appear from={at(2)} until={at(4)}>
        <div style={{ position: "absolute", left: 260, top: 160, width: 640, height: 560, borderRadius: 36, background: "linear-gradient(180deg, #C9935E 0%, #E8C39A 100%)" }} />
        <TextCard x={580} y={800} w={560} size={44} color={SKY.orange}>화성의 낮: 누르스름</TextCard>
      </Appear>
      <Appear from={at(3)} until={at(4)}>
        <div style={{ position: "absolute", left: 1020, top: 160, width: 640, height: 560, borderRadius: 36, background: "linear-gradient(180deg, #5E5A52 0%, #8FB4D9 70%, #CFE6FF 100%)" }} />
        <TextCard x={1340} y={800} w={560} size={44} color={SKY.blue}>화성의 노을: 푸르스름</TextCard>
      </Appear>
      <Appear from={at(4)}>
        <Pic src={img("earth_atmosphere")} x={600} y={460} size={460} />
        <Pic src={img("mars")} x={1320} y={460} size={460} delay={8} />
        <TextCard x={960} y={800} w={900} size={46}>하늘 색 = 공기와 먼지가 빛을 흩는 방식</TextCard>
      </Appear>
    </Stage>
  );
};

export const K09Experiment: React.FC = () => {
  const { at } = useBeat();
  return (
    <Stage>
      <Appear from={at(0)} until={at(2)}>
        <Pic src={img("milk_glass")} x={960} y={470} size={560} />
      </Appear>
      <Appear from={at(1)} until={at(2)}>
        <Particles x={900} y={120} w={120} h={260} dir={1} count={4} color="#FFFFFF" size={22} period={50} />
        <TextCard x={1480} y={300} w={460} size={48}>우유 몇 방울</TextCard>
      </Appear>
      <Appear from={at(2)}>
        <div style={{ position: "absolute", inset: 0, background: "rgba(3,6,15,0.6)" }} />
        <Pic src={img("flashlight")} x={460} y={480} size={380} />
        <Pic src={img("milk_glass")} x={1100} y={480} size={480} delay={6} />
      </Appear>
      <Appear from={at(3)} until={at(4)}>
        <div style={{ position: "absolute", left: 1100 - 200, top: 480 - 200, width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, ${SKY.blue}66 0%, transparent 70%)` }} />
        <TextCard x={1100} y={830} w={620} size={46} color={SKY.blue}>옆에서 보면: 푸르스름 (낮 하늘)</TextCard>
      </Appear>
      <Appear from={at(4)}>
        <div style={{ position: "absolute", left: 1400, top: 380, width: 220, height: 220, borderRadius: "50%", background: `radial-gradient(circle, ${SKY.orange} 0%, ${SKY.orange}55 45%, transparent 72%)` }} />
        <TextCard x={1100} y={830} w={680} size={46} color={SKY.orange}>마주 보면: 주황빛 (노을)</TextCard>
      </Appear>
    </Stage>
  );
};

export const K10Outro: React.FC = () => {
  const { at } = useBeat();
  return (
    <Stage>
      <Appear from={at(0)} until={at(2)}>
        <Scene name="blue_sky" x={560} y={460} size={520} />
        <TextCard x={560} y={800} w={560} size={44} color={SKY.blue}>파란빛 = 잘 흩어짐</TextCard>
      </Appear>
      <Appear from={at(1)} until={at(2)}>
        <Scene name="sunset" x={1360} y={460} size={520} delay={at(1)} />
        <TextCard x={1360} y={800} w={560} size={44} color={SKY.orange}>붉은빛 = 끝까지 남음</TextCard>
      </Appear>
      <Appear from={at(2)} until={at(3)}>
        <SkyBg amount={0.85} box={{ x: 160, y: 130, w: 1600, h: 720 }} />
        <Pic src={img("person_wonder")} x={960} y={580} size={520} />
      </Appear>
      <Appear from={at(3)}>
        <Pic src={img("person_wonder")} x={640} y={480} size={560} />
        <TextCard x={1320} y={400} w={620} size={64} color={C.warm}>구독 · 좋아요</TextCard>
        <TextCard x={1320} y={600} w={620} size={48}>다음 영상에서 만나요!</TextCard>
      </Appear>
    </Stage>
  );
};

export const SKY_LONG_VISUALS: Record<string, React.FC> = {
  k00: K00Intro,
  k01: K01Light,
  k02: K02Air,
  k03: K03Blue,
  k04: K04Sky,
  k05: K05Violet,
  k06: K06Sunset,
  k07: K07Cloud,
  k08: K08Mars,
  k09: K09Experiment,
  k10: K10Outro,
};
