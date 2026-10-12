// 전자레인지 편 쇼츠 장면 (세로 1080x1920). 문장(beat)마다 화면이 바뀝니다.
import React from "react";
import { interpolate } from "remotion";
import { Backdrop } from "../aircon/components";
import { C } from "../aircon/theme";
import { useBeat } from "../longform/beat";
import { Appear, Big, Cross, Pic, TextCard } from "../longform/ui";
import { Wave } from "../sky/components";
import { FieldFlip, Jiggle, MW, Penetration, WaterMol } from "./components";

const img = (name: string) => `microwave/${name}.png`;
// 캐릭터: 전용 그림(microwave/person_surprised.png)이 준비되면 여기만 바꾸면 됩니다.
const PERSON = "sky/person_wonder.png";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const W1Hook: React.FC = () => {
  const { at } = useBeat();
  return (
    <>
      <Backdrop glow={MW.wave} />
      <Appear from={at(0)} until={at(1)}>
        <Pic src={img("microwave_oven")} x={540} y={640} size={640} />
        <Pic src={img("rice_bowl")} x={540} y={1150} size={420} delay={8} />
        <Big x={900} y={900} w={300} size={200} color={MW.wave}>?</Big>
      </Appear>
      <Appear from={at(1)} until={at(2)}>
        <Big x={540} y={520} w={1000} size={130} color={MW.wave}>마이크로파</Big>
        <Wave x={60} y={900} len={960} wavelength={320} amp={110} color={MW.wave} width={14} />
      </Appear>
      <Appear from={at(2)}>
        <FieldFlip box={{ x: 0, y: 560, w: 1080, h: 630 }} period={14} mols={3} start={at(2)} />
        <TextCard x={540} y={400} w={860} size={54} color={MW.wave}>1초에 수십억 번 흔들기</TextCard>
      </Appear>
    </>
  );
};

export const W2Heat: React.FC = () => {
  const { frame, at } = useBeat();
  return (
    <>
      <Backdrop glow={C.hot} />
      <Appear from={at(0)} until={at(1)}>
        <Jiggle box={{ x: 0, y: 520, w: 1080, h: 720 }} cols={4} rows={3} water speed={0.7} energy={interpolate(frame, [at(0), at(0) + 80], [0.15, 1], clamp)} />
        <TextCard x={540} y={400} w={820} size={54} color={C.hot}>부딪히고 비벼져서 → 열</TextCard>
      </Appear>
      <Appear from={at(1)}>
        <Pic src={img("ceramic_bowl")} x={540} y={600} size={440} />
        <TextCard x={540} y={860} w={560} size={48}>그릇: 그대로</TextCard>
        <Pic src={img("rice_bowl")} x={540} y={1150} size={440} delay={8} />
        <TextCard x={540} y={1390} w={560} size={48} color={C.hot}>음식: 뜨거움</TextCard>
      </Appear>
    </>
  );
};

export const W3Myth: React.FC = () => {
  const { at } = useBeat();
  const food = { x: 90, y: 520, w: 900, h: 700 };
  return (
    <>
      <Backdrop glow={C.hot} />
      <Appear from={at(0)} until={at(1)}>
        <Big x={540} y={640} w={1000} size={120}>속부터</Big>
        <Big x={540} y={790} w={1000} size={120}>익는다?</Big>
        <Cross x={540} y={720} size={460} from={at(0) + 24} />
        <Pic src={PERSON} x={540} y={1160} size={460} delay={8} />
      </Appear>
      <Appear from={at(1)} until={at(2)}>
        <Penetration box={food} depth={0.3} label="1~2 cm" />
        <TextCard x={540} y={400} w={860} size={52} color={MW.wave}>겉에서 1~2 cm 까지만</TextCard>
      </Appear>
      <Appear from={at(2)}>
        <Penetration box={food} depth={0.3} coldLabel="차가움" />
        <TextCard x={540} y={400} w={860} size={52}>두꺼우면 가운데가 차가워요</TextCard>
      </Appear>
    </>
  );
};

export const W4Outro: React.FC = () => {
  const { at } = useBeat();
  return (
    <>
      <Backdrop />
      <Appear from={at(0)} until={at(1)}>
        <WaterMol box={{ x: 310, y: 400, w: 460, h: 460 }} dance={45} />
        <WaterMol box={{ x: 110, y: 760, w: 280, h: 280 }} dance={45} phase={2} />
        <WaterMol box={{ x: 690, y: 760, w: 280, h: 280 }} dance={45} phase={4} />
        <Big x={540} y={1150} w={1000} size={92}>불 대신,</Big>
        <Big x={540} y={1270} w={1000} size={92} color={MW.wave}>물 분자 흔들기</Big>
      </Appear>
      <Appear from={at(1)}>
        <Pic src={PERSON} x={540} y={900} size={640} />
        <Big x={540} y={430} w={900} size={96}>자세한 원리는</Big>
        <Big x={540} y={560} w={900} size={110} color={C.warm}>롱폼에서!</Big>
      </Appear>
    </>
  );
};

export const MW_SHORT_VISUALS: Record<string, React.FC> = { w1: W1Hook, w2: W2Heat, w3: W3Myth, w4: W4Outro };
