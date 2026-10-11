import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Backdrop, BigWord, Captions, Pic } from "../components";
import { C, headFont } from "../theme";

// 11~19초: 손소독제 → 증발하며 열을 빼앗음 → 냉매
export const S3Evaporate: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Backdrop />
      <Pic src="hand_sanitizer.png" x={540} y={880} size={720} float={5} />

      {/* 손 위로 증발하는 김 입자 */}
      {new Array(10).fill(0).map((_, i) => {
        const p = (((frame - 40) / 70 + i / 10) % 1 + 1) % 1;
        if (frame < 40) return null;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 400 + ((i * 53) % 280) + Math.sin(p * 6 + i) * 20,
              top: interpolate(p, [0, 1], [760, 420]),
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: C.coolGas,
              opacity: interpolate(p, [0, 0.2, 1], [0, 0.8, 0]),
              scale: String(interpolate(p, [0, 1], [0.6, 1.8])),
              filter: "blur(2px)",
            }}
          />
        );
      })}

      {/* 마지막 줄에서 '냉매' 강조 */}
      {frame >= 300 ? (
        <BigWord font={headFont} y={300} delay={300} color={C.cold} size={170}>
          냉매
        </BigWord>
      ) : null}

      <Captions
        lines={[
          { from: 0, text: "힌트는 손소독제! 바르면 [시원하죠?]" },
          { from: 90, text: "액체가 [기체로 변할 때] 손의 열을 빼앗아 가서예요" },
          { from: 200, text: "땀이 마를 때 시원한 것도 [같은 원리]예요" },
          { from: 300, text: "에어컨 속 [냉매]가 바로 이 일을 하는 물질이에요" },
        ]}
      />
    </AbsoluteFill>
  );
};
