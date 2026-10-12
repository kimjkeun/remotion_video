// 전자레인지 편 롱폼 장면 (1920x1080). 문장(beat)마다 화면이 바뀝니다.
import React from "react";
import { interpolate } from "remotion";
import { bodyFont, C } from "../aircon/theme";
import { useBeat } from "../longform/beat";
import { Appear, Big, Cross, HeatFlow, Particles, Pic, Stage, TextCard, ValueCard } from "../longform/ui";
import { Wave } from "../sky/components";
import { Cavity, Choco, DoorMesh, FieldFlip, Jiggle, MW, Penetration, Router, RubHands, Sparks, TurntableTop, WaterMol } from "./components";

const img = (name: string) => `microwave/${name}.png`;
// 캐릭터: 전용 그림(microwave/person_surprised.png)이 준비되면 여기만 바꾸면 됩니다.
const PERSON = "sky/person_wonder.png";

// 물 분자 캐릭터 (가운데 좌표 + 크기)
const Water: React.FC<{ x: number; y: number; size: number; dance?: number; phase?: number }> = ({ x, y, size, dance, phase }) => (
  <WaterMol box={{ x: x - size / 2, y: y - size / 2, w: size, h: size }} dance={dance} phase={phase} />
);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const WIDE = { x: 360, y: 150, w: 1200, h: 700 };

export const M00Intro: React.FC = () => {
  const { at } = useBeat();
  return (
    <Stage glow={MW.wave}>
      <Appear from={at(0)} until={at(1)}>
        <Pic src={img("microwave_oven")} x={1240} y={480} size={640} />
        <Pic src={img("rice_bowl")} x={520} y={520} size={460} delay={8} />
      </Appear>
      <Appear from={at(1)} until={at(2)}>
        <Pic src={img("microwave_oven")} x={960} y={420} size={520} />
        <TextCard x={560} y={760} w={420} size={56} color={C.hot}>불 ✕</TextCard>
        <TextCard x={1360} y={760} w={420} size={56} color={C.hot}>열선 ✕</TextCard>
      </Appear>
      <Appear from={at(2)} until={at(3)}>
        <Pic src={img("rice_bowl")} x={600} y={480} size={480} />
        <TextCard x={600} y={800} w={520} size={48} color={C.hot}>음식: 뜨거움</TextCard>
        <Cavity box={{ x: 1000, y: 240, w: 700, h: 408 }} />
        <TextCard x={1340} y={800} w={520} size={48}>안쪽 벽: 미지근</TextCard>
      </Appear>
      <Appear from={at(3)} until={at(4)}>
        <Pic src={img("gas_stove")} x={960} y={470} size={560} />
        <Cross x={960} y={470} size={420} from={at(3) + 12} />
      </Appear>
      <Appear from={at(4)} until={at(5)}>
        <Wave x={200} y={470} len={760} wavelength={260} amp={80} color={MW.wave} label="눈에 보이지 않는 파동" />
        <Water x={1340} y={470} size={460} dance={40} />
      </Appear>
      <Appear from={at(5)}>
        <Pic src={img("microwave_oven")} x={560} y={480} size={560} />
        <Big x={1320} y={480} w={900} size={120}>전자레인지의 원리</Big>
      </Appear>
    </Stage>
  );
};

export const M01Heat: React.FC = () => {
  const { at } = useBeat();
  return (
    <Stage>
      <Appear from={at(0)} until={at(1)}>
        <Pic src="thermometer.png" x={620} y={480} size={520} />
        <Big x={1300} y={480} w={700} size={150} color={C.warm}>열이란?</Big>
      </Appear>
      <Appear from={at(1)} until={at(3)}>
        <Jiggle box={WIDE} energy={0.35} />
      </Appear>
      <Appear from={at(1)} until={at(2)}>
        <TextCard x={960} y={150} w={520} size={52}>아주 작은 알갱이, 분자</TextCard>
      </Appear>
      <Appear from={at(2)} until={at(3)}>
        <TextCard x={960} y={150} w={520} size={52}>끊임없이 움직여요</TextCard>
      </Appear>
      <Appear from={at(3)} until={at(4)}>
        <Jiggle box={{ x: 140, y: 240, w: 760, h: 443 }} energy={0.05} cols={4} />
        <Jiggle box={{ x: 1020, y: 240, w: 760, h: 443 }} energy={1} cols={4} speed={0.7} />
        <TextCard x={520} y={790} w={560} size={48}>느리다 = 낮은 온도</TextCard>
        <TextCard x={1400} y={790} w={560} size={48} color={C.hot}>빠르다 = 높은 온도</TextCard>
      </Appear>
      <Appear from={at(4)}>
        <Pic src={img("rice_bowl")} x={600} y={480} size={520} />
        <TextCard x={1340} y={480} w={760} size={56} color={C.warm}>
          데운다 =
          <br />
          분자를 더 빠르게!
        </TextCard>
      </Appear>
    </Stage>
  );
};

export const M02Microwave: React.FC = () => {
  const { at } = useBeat();
  return (
    <Stage glow={MW.wave}>
      <Appear from={at(0)} until={at(1)}>
        <Pic src={img("gas_stove")} x={640} y={480} size={560} />
        <TextCard x={1360} y={480} w={640} size={52} color={C.hot}>
          바깥 → 안
          <br />
          천천히 전해짐
        </TextCard>
      </Appear>
      <Appear from={at(1)} until={at(2)}>
        <Pic src={img("microwave_oven")} x={620} y={480} size={560} />
        <Big x={1340} y={480} w={900} size={140} color={MW.wave}>마이크로파</Big>
      </Appear>
      <Appear from={at(2)} until={at(3)}>
        <Wave x={360} y={380} len={1200} wavelength={90} amp={40} color="#FFFFFF" label="빛" />
        <Wave x={360} y={660} len={1200} wavelength={300} amp={70} color={MW.wave} label="마이크로파" />
        <TextCard x={960} y={130} w={760} size={50}>둘 다 전자기파</TextCard>
      </Appear>
      <Appear from={at(3)} until={at(4)}>
        <Wave x={360} y={330} len={1200} wavelength={60} amp={36} color="#FFFFFF" label="눈에 보이는 빛: 파장이 짧다" />
        <Wave x={360} y={660} len={1200} wavelength={400} amp={80} color={MW.wave} label="마이크로파: 파장이 길다 (안 보임)" />
      </Appear>
      <Appear from={at(4)} until={at(5)}>
        <Wave x={360} y={380} len={1200} wavelength={400} amp={90} color={MW.wave} />
        <div style={{ position: "absolute", left: 560, top: 540, width: 400, borderTop: `6px solid ${C.ink}` }} />
        <div style={{ position: "absolute", left: 560, top: 560, width: 400, textAlign: "center", fontFamily: bodyFont, fontWeight: 900, fontSize: 48, color: C.ink }}>파장</div>
        <ValueCard x={1400} y={680} w={520} label="마이크로파의 파장" value="약 12 cm" color={MW.wave} />
      </Appear>
      <Appear from={at(5)} until={at(6)}>
        <Router box={{ x: 340, y: 200, w: 560, h: 560 }} />
        <TextCard x={1360} y={480} w={640} size={52}>와이파이도 비슷한 파동</TextCard>
      </Appear>
      <Appear from={at(6)}>
        <Cavity box={WIDE} mode="rays" magnetron start={at(6)} />
      </Appear>
    </Stage>
  );
};

export const M03Water: React.FC = () => {
  const { frame, at } = useBeat();
  return (
    <Stage glow={MW.wave}>
      <Appear from={at(0)} until={at(1)}>
        <Water x={620} y={480} size={560} />
        <Big x={1340} y={480} w={800} size={150} color={C.cold}>물 분자</Big>
      </Appear>
      <Appear from={at(1)} until={at(2)}>
        <WaterMol box={{ x: 320, y: 170, w: 640, h: 640 }} labels />
        <TextCard x={1380} y={360} w={600} size={52} color={MW.plus}>한쪽은 플러스 (+)</TextCard>
        <TextCard x={1380} y={600} w={600} size={52} color={MW.minus}>반대쪽은 마이너스 (−)</TextCard>
      </Appear>
      <Appear from={at(2)} until={at(3)}>
        <FieldFlip box={WIDE} period={90} labels start={at(2)} />
        <TextCard x={960} y={130} w={820} size={48} color={MW.wave}>전기의 방향을 따라 돌아요</TextCard>
      </Appear>
      <Appear from={at(3)} until={at(5)}>
        <FieldFlip box={WIDE} period={14} mols={3} start={at(3)} />
      </Appear>
      <Appear from={at(3)} until={at(4)}>
        <TextCard x={960} y={130} w={900} size={50} color={MW.wave}>방향이 1초에 수십억 번 뒤집힘</TextCard>
      </Appear>
      <Appear from={at(5)} until={at(6)}>
        <Jiggle box={WIDE} water speed={0.7} energy={interpolate(frame, [at(5), at(5) + 100], [0.15, 1], clamp)} />
        <TextCard x={960} y={130} w={820} size={50} color={C.hot}>부딪히고 비벼져서 → 열</TextCard>
      </Appear>
      <Appear from={at(6)} until={at(7)}>
        <RubHands box={{ x: 330, y: 160, w: 640, h: 640 }} />
        <TextCard x={1400} y={480} w={620} size={52} color={C.hot}>
          비비면
          <br />
          따뜻해져요
        </TextCard>
      </Appear>
      <Appear from={at(7)}>
        <Pic src={img("rice_bowl")} x={620} y={480} size={520} />
        <TextCard x={1360} y={480} w={680} size={54} color={C.cold}>
          물기가 많을수록
          <br />잘 데워져요
        </TextCard>
      </Appear>
    </Stage>
  );
};

export const M04Bowl: React.FC = () => {
  const { at } = useBeat();
  return (
    <Stage>
      <Appear from={at(0)} until={at(2)}>
        <Pic src={img("ceramic_bowl")} x={960} y={470} size={560} />
      </Appear>
      <Appear from={at(0)} until={at(1)}>
        <Big x={1400} y={300} w={300} size={220} color={MW.wave}>?</Big>
      </Appear>
      <Appear from={at(1)} until={at(2)}>
        <TextCard x={960} y={800} w={900} size={50}>흔들릴 물 분자가 거의 없어요</TextCard>
      </Appear>
      <Appear from={at(2)} until={at(3)}>
        <Pic src={img("ceramic_bowl")} x={960} y={470} size={520} />
        <Wave x={160} y={470} len={1600} wavelength={300} amp={70} color={MW.wave} />
        <TextCard x={960} y={800} w={700} size={50} color={MW.wave}>그릇은 그냥 통과</TextCard>
      </Appear>
      <Appear from={at(3)} until={at(4)}>
        <Pic src={img("rice_bowl")} x={960} y={460} size={560} />
        <HeatFlow from={[960, 400]} to={[760, 600]} count={5} start={at(3)} />
        <HeatFlow from={[960, 400]} to={[1160, 600]} count={5} start={at(3)} />
        <TextCard x={960} y={810} w={760} size={50} color={C.hot}>음식의 열 → 그릇</TextCard>
      </Appear>
      <Appear from={at(4)} until={at(5)}>
        <Cavity box={WIDE} />
        <TextCard x={920} y={460} w={640} size={52}>공기와 벽도 그대로</TextCard>
      </Appear>
      <Appear from={at(5)} until={at(6)}>
        <Pic src="ice_cubes.png" x={520} y={480} size={480} />
        <Jiggle box={{ x: 860, y: 220, w: 900, h: 525 }} energy={0} cols={5} lattice />
        <TextCard x={1310} y={810} w={820} size={48}>얼음: 분자가 붙잡혀 못 돌아요</TextCard>
      </Appear>
      <Appear from={at(6)}>
        <Penetration box={{ x: 220, y: 150, w: 880, h: 684 }} depth={0.22} coldLabel="아직 얼음" />
        <TextCard x={1440} y={480} w={640} size={50} color={C.hot}>
          녹은 곳만
          <br />
          먼저 뜨거워져요
        </TextCard>
      </Appear>
    </Stage>
  );
};

export const M05Myth: React.FC = () => {
  const { frame, at } = useBeat();
  const food = { x: 220, y: 150, w: 880, h: 684 };
  return (
    <Stage glow={C.hot}>
      <Appear from={at(0)} until={at(2)}>
        <Pic src={PERSON} x={1420} y={500} size={560} />
        <Big x={700} y={470} w={1000} size={120}>속부터 익는다?</Big>
      </Appear>
      <Appear from={at(1)} until={at(2)}>
        <Cross x={700} y={470} size={380} from={at(1)} />
      </Appear>
      <Appear from={at(2)} until={at(3)}>
        <Penetration box={food} depth={0.3} label="1~2 cm" />
        <TextCard x={1440} y={480} w={640} size={50} color={MW.wave}>
          마이크로파는
          <br />
          겉에서 1~2 cm 까지
        </TextCard>
      </Appear>
      <Appear from={at(3)} until={at(4)}>
        <Penetration box={food} depth={0.3} conduct={interpolate(frame, [at(3), at(3) + 110], [0, 0.8], clamp)} />
        <TextCard x={1440} y={480} w={640} size={50} color={C.hot}>
          속은 열이
          <br />
          천천히 전해져서
        </TextCard>
      </Appear>
      <Appear from={at(4)} until={at(6)}>
        <Penetration box={{ x: 170, y: 130, w: 700, h: 544 }} mode="flame" depth={0.07} />
        <Penetration box={{ x: 1050, y: 130, w: 700, h: 544 }} depth={0.3} />
      </Appear>
      <Appear from={at(4)} until={at(5)}>
        <TextCard x={520} y={830} w={520} size={46} color={C.hot}>불: 겉 표면만</TextCard>
        <TextCard x={1400} y={830} w={620} size={46} color={MW.wave}>전자레인지: 조금 안쪽까지</TextCard>
      </Appear>
      <Appear from={at(5)} until={at(6)}>
        <TextCard x={960} y={830} w={620} size={50} color={C.warm}>그래서 훨씬 빨라요</TextCard>
      </Appear>
      <Appear from={at(6)}>
        <Penetration box={food} depth={0.3} coldLabel="차가움" />
        <TextCard x={1440} y={480} w={640} size={50}>
          두꺼운 음식은
          <br />
          가운데가 차가워요
        </TextCard>
      </Appear>
    </Stage>
  );
};

export const M06Turntable: React.FC = () => {
  const { at } = useBeat();
  return (
    <Stage glow={MW.wave}>
      <Appear from={at(0)} until={at(1)}>
        <Pic src={img("microwave_oven")} x={640} y={480} size={560} />
        <TurntableTop box={{ x: 1080, y: 220, w: 520, h: 520 }} start={at(0)} />
      </Appear>
      <Appear from={at(1)} until={at(2)}>
        <Cavity box={WIDE} mode="rays" start={at(1)} />
        <TextCard x={920} y={130} w={720} size={48} color={MW.wave}>금속 벽에서 계속 반사</TextCard>
      </Appear>
      <Appear from={at(2)} until={at(3)}>
        <Cavity box={WIDE} mode="standing" />
      </Appear>
      <Appear from={at(3)} until={at(4)}>
        <Cavity box={WIDE} mode="standing" strip />
        <TextCard x={920} y={130} w={820} size={48} color={C.hot}>뜨거운 곳과 차가운 곳이 생겨요</TextCard>
      </Appear>
      <Appear from={at(4)} until={at(5)}>
        <Cavity box={WIDE} mode="standing" strip measure />
      </Appear>
      <Appear from={at(5)}>
        <TurntableTop box={{ x: 300, y: 150, w: 700, h: 700 }} start={at(5)} />
        <TextCard x={1440} y={480} w={640} size={52} color={C.warm}>
          돌려서
          <br />
          골고루 데우기
        </TextCard>
      </Appear>
    </Stage>
  );
};

export const M07Door: React.FC = () => {
  const { at } = useBeat();
  return (
    <Stage>
      <Appear from={at(0)} until={at(1)}>
        <Pic src={img("microwave_oven")} x={600} y={480} size={560} />
        <DoorMesh box={{ x: 1000, y: 220, w: 800, h: 467 }} mode="plate" />
        <TextCard x={1400} y={800} w={640} size={46}>구멍이 뚫린 금속판</TextCard>
      </Appear>
      <Appear from={at(1)} until={at(2)}>
        <DoorMesh box={WIDE} mode="micro" start={at(1)} />
        <TextCard x={1380} y={700} w={560} size={46} color={MW.wave}>파장 12 cm ≫ 구멍</TextCard>
      </Appear>
      <Appear from={at(2)} until={at(3)}>
        <DoorMesh box={WIDE} mode="light" start={at(2)} />
      </Appear>
      <Appear from={at(3)} until={at(4)}>
        <DoorMesh box={WIDE} mode="both" start={at(3)} />
      </Appear>
      <Appear from={at(4)} until={at(5)}>
        <Pic src={img("fork")} x={700} y={480} size={480} />
        <Big x={1340} y={480} w={800} size={130} color={MW.metal}>금속은?</Big>
      </Appear>
      <Appear from={at(5)} until={at(6)}>
        <DoorMesh box={WIDE} mode="solid" start={at(5)} />
        <TextCard x={1380} y={700} w={560} size={46} color={MW.metal}>금속 = 마이크로파 반사</TextCard>
      </Appear>
      <Appear from={at(6)}>
        <Pic src={img("fork")} x={760} y={500} size={520} rotate={-10} />
        <Sparks x={640} y={320} />
        <TextCard x={1400} y={480} w={620} size={50} color={MW.wave}>
          뾰족한 금속
          <br />
          불꽃 주의!
        </TextCard>
      </Appear>
    </Stage>
  );
};

export const M08Chocolate: React.FC = () => {
  const { frame, at } = useBeat();
  const bar = { x: 360, y: 240, w: 1200, h: 500 };
  return (
    <Stage glow={MW.choco}>
      <Appear from={at(0)} until={at(1)}>
        <Pic src={img("chocolate_bar")} x={600} y={480} size={520} />
        <Big x={1340} y={480} w={900} size={110} color={MW.wave}>빛의 속도 재기</Big>
      </Appear>
      <Appear from={at(1)} until={at(2)}>
        <Pic src={img("microwave_oven")} x={620} y={470} size={520} />
        <Pic src={img("chocolate_bar")} x={1360} y={440} size={420} delay={8} />
        <TextCard x={960} y={810} w={980} size={46}>회전 접시를 빼고, 평평한 접시에 초콜릿</TextCard>
      </Appear>
      <Appear from={at(2)} until={at(5)}>
        <Choco box={bar} melt={interpolate(frame, [at(2) + 20, at(2) + 110], [0, 1], clamp)} measure={frame >= at(3)} />
      </Appear>
      <Appear from={at(2)} until={at(3)}>
        <TextCard x={960} y={170} w={760} size={48} color={C.warm}>20초 뒤: 군데군데만 녹음</TextCard>
      </Appear>
      <Appear from={at(4)} until={at(5)}>
        <TextCard x={960} y={170} w={900} size={52} color={MW.wave}>파장 = 6 cm × 2 = 12 cm</TextCard>
      </Appear>
      <Appear from={at(5)} until={at(6)}>
        <ValueCard x={560} y={420} w={600} label="파장" value="0.12 m" color={MW.wave} />
        <Big x={960} y={420} w={160} size={130}>×</Big>
        <ValueCard x={1360} y={420} w={600} label="진동수" value="2450 MHz" color={C.cold} />
        <TextCard x={960} y={720} w={900} size={46}>2450 MHz = 1초에 24억 5천만 번</TextCard>
      </Appear>
      <Appear from={at(6)} until={at(7)}>
        <ValueCard x={960} y={400} w={1100} label="0.12 m × 2,450,000,000" value="≈ 초속 30만 km" color={C.warm} />
        <Big x={960} y={700} w={900} size={110} color={MW.wave}>빛의 속도!</Big>
      </Appear>
      <Appear from={at(7)}>
        <Pic src={img("chocolate_bar")} x={620} y={480} size={480} />
        <Pic src={PERSON} x={1340} y={500} size={560} delay={8} />
      </Appear>
    </Stage>
  );
};

const Tip: React.FC<{ n: string; children: React.ReactNode; color?: string }> = ({ n, children, color = C.cold }) => (
  <TextCard x={1380} y={480} w={720} size={52} color={color}>
    <span style={{ color }}>{n}</span> {children}
  </TextCard>
);

export const M09Tips: React.FC = () => {
  const { at } = useBeat();
  return (
    <Stage>
      <Appear from={at(0)} until={at(1)}>
        <Pic src={img("microwave_oven")} x={600} y={480} size={560} />
        <Big x={1340} y={480} w={900} size={110}>똑똑하게 쓰는 법</Big>
      </Appear>
      <Appear from={at(1)} until={at(2)}>
        <Pic src={img("donut_plate")} x={600} y={480} size={560} />
        <Tip n="①">도넛 모양으로 담기</Tip>
      </Appear>
      <Appear from={at(2)} until={at(3)}>
        <Pic src={img("rice_bowl")} x={600} y={480} size={520} />
        <Tip n="②">중간에 한 번 젓기</Tip>
      </Appear>
      <Appear from={at(3)} until={at(4)}>
        <Pic src={img("rice_bowl")} x={600} y={520} size={500} />
        {/* 살짝 걸친 뚜껑 */}
        <div style={{ position: "absolute", left: 370, top: 300, width: 460, height: 120, borderRadius: "230px 230px 20px 20px / 110px 110px 20px 20px", background: "rgba(200,230,255,0.45)", border: "6px solid white", rotate: "-6deg" }} />
        <Particles x={760} y={200} w={120} h={160} count={4} color="#FFFFFF" size={18} period={60} />
        <Tip n="③">뚜껑은 살짝 걸쳐 덮기</Tip>
      </Appear>
      <Appear from={at(4)} until={at(5)}>
        <Pic src={img("egg")} x={600} y={480} size={480} />
        <Cross x={600} y={480} size={420} from={at(4) + 14} />
        <Tip n="④" color={C.hot}>달걀 · 꽉 닫은 용기 금지</Tip>
      </Appear>
      <Appear from={at(5)}>
        <Pic src={img("fork")} x={600} y={480} size={480} />
        <Cross x={600} y={480} size={420} from={at(5) + 14} />
        <Tip n="⑤" color={C.hot}>금속 그릇 · 포일 금지</Tip>
      </Appear>
    </Stage>
  );
};

export const M10Outro: React.FC = () => {
  const { at } = useBeat();
  return (
    <Stage glow={MW.wave}>
      <Appear from={at(0)} until={at(1)}>
        <Wave x={160} y={420} len={520} wavelength={220} amp={60} color={MW.wave} />
        <Water x={960} y={420} size={360} dance={40} />
        <Pic src={img("rice_bowl")} x={1500} y={430} size={400} delay={10} />
        <TextCard x={960} y={770} w={1200} size={48} color={MW.wave}>마이크로파 → 물 분자 흔들기 → 열</TextCard>
      </Appear>
      <Appear from={at(1)} until={at(2)}>
        <Pic src={img("microwave_oven")} x={620} y={480} size={560} />
        <Water x={1200} y={360} size={300} dance={45} />
        <Water x={1500} y={540} size={260} dance={45} phase={2} />
        <Water x={1180} y={700} size={220} dance={45} phase={4} />
      </Appear>
      <Appear from={at(2)}>
        <Pic src={PERSON} x={640} y={480} size={560} />
        <TextCard x={1320} y={400} w={620} size={64} color={C.warm}>구독 · 좋아요</TextCard>
        <TextCard x={1320} y={600} w={620} size={48}>다음 영상에서 만나요!</TextCard>
      </Appear>
    </Stage>
  );
};

export const MW_LONG_VISUALS: Record<string, React.FC> = {
  m00: M00Intro,
  m01: M01Heat,
  m02: M02Microwave,
  m03: M03Water,
  m04: M04Bowl,
  m05: M05Myth,
  m06: M06Turntable,
  m07: M07Door,
  m08: M08Chocolate,
  m09: M09Tips,
  m10: M10Outro,
};
