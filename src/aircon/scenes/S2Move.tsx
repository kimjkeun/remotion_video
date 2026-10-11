import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Backdrop, Captions, HeatFlow } from "../components";
import { bodyFont, C } from "../theme";

// 5~11초: 방 안의 열이 벽을 넘어 바깥으로 이동. 방은 파랗게 식고 바깥은 뜨거워짐
export const S2Move: React.FC = () => {
  const frame = useCurrentFrame();
  const cool = interpolate(frame, [20, 160], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const roomTemp = Math.round(interpolate(cool, [0, 1], [33, 24]));
  return (
    <AbsoluteFill>
      <Backdrop />
      {/* 방 */}
      <div
        style={{
          position: "absolute",
          left: 90,
          top: 480,
          width: 520,
          height: 760,
          borderRadius: 40,
          border: "8px solid rgba(255,255,255,0.85)",
          background: `linear-gradient(180deg, rgba(255,122,61,${0.35 * (1 - cool)}) 0%, rgba(91,200,255,${0.4 * cool}) 100%)`,
        }}
      />
      {/* 바깥 */}
      <div
        style={{
          position: "absolute",
          left: 640,
          top: 480,
          width: 350,
          height: 760,
          borderRadius: 40,
          background: `rgba(255,122,61,${0.12 + 0.3 * cool})`,
          border: "4px dashed rgba(255,255,255,0.3)",
        }}
      />
      {[
        { x: 350, label: "방 안" },
        { x: 815, label: "바깥" },
      ].map((l) => (
        <div
          key={l.label}
          style={{
            position: "absolute",
            left: l.x - 150,
            width: 300,
            top: 400,
            textAlign: "center",
            fontFamily: bodyFont,
            fontWeight: 900,
            fontSize: 52,
            color: C.dim,
          }}
        >
          {l.label}
        </div>
      ))}
      {/* 방 온도 */}
      <div
        style={{
          position: "absolute",
          left: 90,
          width: 520,
          top: 1050,
          textAlign: "center",
          fontFamily: bodyFont,
          fontWeight: 900,
          fontSize: 120,
          color: cool > 0.5 ? C.cold : C.warm,
        }}
      >
        {roomTemp}°C
      </div>
      <HeatFlow from={[300, 800]} to={[860, 760]} count={7} period={50} start={15} size={46} />
      <HeatFlow from={[220, 950]} to={[880, 980]} count={5} period={65} start={30} size={38} />

      <Captions
        accent={C.hot}
        lines={[
          { from: 0, text: "방 안의 [열]을 붙잡아서" },
          { from: 85, text: "바깥으로 [옮겨 버리는] 기계예요" },
        ]}
      />
    </AbsoluteFill>
  );
};
