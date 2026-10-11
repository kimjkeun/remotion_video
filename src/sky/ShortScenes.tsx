// 하늘 편 쇼츠 장면 (세로 1080x1920). 문장(beat)마다 화면이 바뀝니다.
import React from "react";
import { Backdrop } from "../aircon/components";
import { C } from "../aircon/theme";
import { useBeat } from "../longform/beat";
import { Appear, Big, Pic, TextCard } from "../longform/ui";
import { LightPath, Scatter, ScatterBars, SKY } from "./components";

const img = (name: string) => `sky/${name}.png`;

// 정사각 풍경 그림 카드
const Scene: React.FC<{ name: string; x: number; y: number; size: number; delay?: number }> = ({ name, x, y, size, delay }) => (
  <Pic src={img(name)} x={x} y={y} size={size} delay={delay} float={4} style={{ borderRadius: 36 }} />
);

export const Q1Hook: React.FC = () => {
  const { at } = useBeat();
  return (
    <>
      <Backdrop glow={SKY.blue} />
      <Appear from={at(0)} until={at(1)}>
        <Scene name="blue_sky" x={540} y={600} size={560} />
        <Scene name="sunset" x={540} y={1120} size={560} delay={10} />
        <Big x={900} y={880} w={300} size={200} color={SKY.yellow}>?</Big>
      </Appear>
      <Appear from={at(1)} until={at(2)}>
        <Pic src={img("prism")} x={540} y={820} size={820} delay={at(1)} />
      </Appear>
      <Appear from={at(2)}>
        <Scatter box={{ x: -110, y: 500, w: 1300, h: 650 }} mode="white" start={at(2)} />
      </Appear>
    </>
  );
};

export const Q2Blue: React.FC = () => {
  const { at } = useBeat();
  return (
    <>
      <Backdrop glow={SKY.blue} />
      <Appear from={at(0)} until={at(1)}>
        <ScatterBars box={{ x: 60, y: 520, w: 960, h: 560 }} start={at(0)} />
        <TextCard x={540} y={380} w={820} size={52}>
          <span style={{ color: SKY.blue }}>파랑</span>은 <span style={{ color: SKY.red }}>빨강</span>보다 5배+
        </TextCard>
      </Appear>
      <Appear from={at(1)}>
        <Scene name="blue_sky" x={540} y={620} size={640} />
        <Pic src={img("person_wonder")} x={540} y={1110} size={460} delay={8} />
      </Appear>
    </>
  );
};

export const Q3Sunset: React.FC = () => {
  const { at } = useBeat();
  return (
    <>
      <Backdrop glow={SKY.orange} />
      <Appear from={at(0)} until={at(1)}>
        <LightPath box={{ x: 40, y: 360, w: 1000, h: 562 }} mode="noon" start={at(0)} />
        <LightPath box={{ x: 40, y: 860, w: 1000, h: 562 }} mode="sunset" start={at(0) + 20} />
        <TextCard x={260} y={420} w={340} size={40}>한낮</TextCard>
        <TextCard x={260} y={920} w={340} size={40} color={SKY.orange}>저녁</TextCard>
      </Appear>
      <Appear from={at(1)} until={at(2)}>
        <LightPath box={{ x: 40, y: 560, w: 1000, h: 562 }} mode="sunset" drop start={at(1)} />
        <TextCard x={540} y={460} w={720} size={46} color={SKY.blue}>파랑은 오는 길에 흩어짐</TextCard>
      </Appear>
      <Appear from={at(2)}>
        <Scene name="sunset" x={540} y={820} size={760} delay={at(2)} />
      </Appear>
    </>
  );
};

export const Q4Outro: React.FC = () => {
  const { at } = useBeat();
  return (
    <>
      <Backdrop />
      <Appear from={at(0)} until={at(1)}>
        <Scene name="blue_sky" x={300} y={760} size={420} />
        <Scene name="sunset" x={780} y={760} size={420} delay={8} />
        <Big x={540} y={1130} w={1000} size={92}>같은 햇빛,</Big>
        <Big x={540} y={1250} w={1000} size={92} color={SKY.orange}>다른 길이</Big>
      </Appear>
      <Appear from={at(1)}>
        <Pic src={img("person_wonder")} x={540} y={900} size={640} />
        <Big x={540} y={430} w={900} size={96}>자세한 원리는</Big>
        <Big x={540} y={560} w={900} size={110} color={C.warm}>롱폼에서!</Big>
      </Appear>
    </>
  );
};

export const SKY_SHORT_VISUALS: Record<string, React.FC> = { q1: Q1Hook, q2: Q2Blue, q3: Q3Sunset, q4: Q4Outro };
