// c03 증발하면 시원해진다, c04 냉매와 압력
import React from "react";
import { C } from "../../aircon/theme";
import { useBeat } from "../beat";
import { Appear, Big, Cross, Particles, Pic, Stage, TextCard, ValueCard } from "../ui";

export const C03Evaporate: React.FC = () => {
  const { at } = useBeat();
  return (
    <Stage>
      <Appear from={at(0)} until={at(3)}>
        <Pic src="hand_sanitizer.png" x={700} y={500} size={560} float={5} />
      </Appear>
      <Appear from={at(1)} until={at(2)}>
        <TextCard x={1360} y={420} w={420} size={70}>시원!</TextCard>
      </Appear>
      <Appear from={at(2)} until={at(3)}>
        <Particles x={560} y={160} w={300} h={300} count={12} start={at(2)} />
        <TextCard x={1360} y={460} w={620} size={52}>
          알코올이 날아가며<br /><span style={{ color: C.cold }}>손의 열을 빼앗아요</span>
        </TextCard>
      </Appear>

      {/* 3번째 문장부터: 규칙 카드 두 장이 차례로 쌓임 */}
      <Appear from={at(3)}>
        <TextCard x={960} y={230} w={1240} size={58}>
          액체 → 기체 <span style={{ color: C.dim }}>(증발)</span> : <span style={{ color: C.cold }}>열을 빼앗아요</span>
        </TextCard>
      </Appear>
      <Appear from={at(4)} until={at(5)}>
        <Pic src="person_cool.png" x={960} y={560} size={460} delay={at(4)} />
        <Particles x={800} y={330} w={320} h={180} count={8} start={at(4)} size={16} />
      </Appear>
      <Appear from={at(5)}>
        <TextCard x={960} y={450} w={1240} size={58} color={C.hot}>
          기체 → 액체 : <span style={{ color: C.hot }}>열을 내놓아요</span>
        </TextCard>
      </Appear>
      <Appear from={at(6)}>
        <Big x={960} y={700} size={100} color={C.warm}>이 둘을 번갈아!</Big>
      </Appear>
    </Stage>
  );
};

export const C04Pressure: React.FC = () => {
  const { at } = useBeat();
  return (
    <Stage>
      <Appear from={at(0)} until={at(2)}>
        <Pic src="thermometer.png" x={540} y={470} size={480} />
        <ValueCard x={1250} y={300} w={560} label="물이 끓는 온도" value="100°C" color={C.hot} />
      </Appear>
      <Appear from={at(1)} until={at(2)}>
        <ValueCard x={1250} y={620} w={560} label="방 공기" value="30°C" color={C.warm} />
        <Cross x={1530} y={620} from={at(1) + 40} size={180} />
      </Appear>
      <Appear from={at(2)} until={at(4)}>
        <Big x={960} y={260} size={190} color={C.cold}>냉매</Big>
        <Pic src="indoor_unit.png" x={960} y={560} size={360} delay={at(2)} />
      </Appear>
      <Appear from={at(3)} until={at(4)}>
        <div style={{ position: "absolute", inset: 0, background: "rgba(11,21,48,0.6)" }} />
        <ValueCard x={960} y={520} w={760} label="냉매가 끓는 온도 (보통 압력)" value="약 -50°C" color={C.cold} />
      </Appear>
      <Appear from={at(4)} until={at(5)}>
        <ValueCard x={600} y={470} w={620} label="압력 ↑" value="잘 안 끓음" color={C.hot} />
        <ValueCard x={1320} y={470} w={620} label="압력 ↓" value="쉽게 끓음" color={C.cold} />
      </Appear>
      <Appear from={at(5)} until={at(6)}>
        <Pic src="pressure_cooker.png" x={620} y={470} size={480} delay={at(5)} />
        <TextCard x={1320} y={470} w={680} size={52} color={C.hot}>
          압력을 높이면<br />100°C가 넘어도<br /><span style={{ color: C.hot }}>안 끓어요</span>
        </TextCard>
      </Appear>
      <Appear from={at(6)}>
        <Pic src="indoor_unit.png" x={560} y={360} size={340} />
        <Pic src="outdoor_unit.png" x={1360} y={360} size={340} delay={8} />
        <TextCard x={560} y={680} w={640} size={46}>
          압력 낮게 → <span style={{ color: C.cold }}>끓는 곳</span>
        </TextCard>
        <TextCard x={1360} y={680} w={640} size={46} color={C.hot}>
          압력 높게 → <span style={{ color: C.hot }}>액체가 되는 곳</span>
        </TextCard>
      </Appear>
    </Stage>
  );
};
