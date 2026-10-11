import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Backdrop, Captions, HeatFlow, Pic } from "../components";
import { bodyFont, C, headFont } from "../theme";

// 열의 규칙(뜨거운 곳 → 차가운 곳) + 문제 제기(바깥이 더 뜨거운데?)
const PUZZLE = 200;

const TempTag: React.FC<{ x: number; y: number; text: string; color: string }> = ({ x, y, text, color }) => (
  <div
    style={{
      position: "absolute",
      left: x - 150,
      width: 300,
      top: y,
      textAlign: "center",
      fontFamily: bodyFont,
      fontWeight: 900,
      fontSize: 72,
      color,
    }}
  >
    {text}
  </div>
);

export const S2bRule: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ruleOut = interpolate(frame, [PUZZLE - 10, PUZZLE], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const q = spring({ frame: frame - (PUZZLE + 100), fps, config: { damping: 8, stiffness: 180 } });

  return (
    <AbsoluteFill>
      <Backdrop glow={C.warm} />

      {/* 1부: 뜨거운 컵 → 얼음, 열이 흘러감 */}
      {frame < PUZZLE ? (
        <div style={{ opacity: ruleOut }}>
          <Pic src="hot_cup.png" x={290} y={820} size={380} />
          <Pic src="ice_cubes.png" x={800} y={830} size={330} delay={10} />
          <TempTag x={290} y={1030} text="80°C" color={C.hot} />
          <TempTag x={800} y={1030} text="0°C" color={C.cold} />
          <HeatFlow from={[400, 760]} to={[700, 800]} count={6} period={45} start={70} size={42} />
        </div>
      ) : null}

      {/* 2부: 방 30°C, 바깥 35°C, 열을 밖으로? */}
      {frame >= PUZZLE ? (
        <>
          {[
            { x: 290, label: "방 안", temp: "30°C", color: C.warm, d: 0 },
            { x: 790, label: "바깥", temp: "35°C", color: C.hot, d: 12 },
          ].map((b) => {
            const pop = spring({ frame: frame - PUZZLE - b.d, fps, config: { damping: 13 } });
            return (
              <div
                key={b.label}
                style={{
                  position: "absolute",
                  left: b.x - 180,
                  top: 640,
                  width: 360,
                  height: 380,
                  borderRadius: 40,
                  background: `${b.color}26`,
                  border: `6px solid ${b.color}`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: bodyFont,
                  fontWeight: 900,
                  scale: String(pop),
                }}
              >
                <div style={{ fontSize: 52, color: C.dim }}>{b.label}</div>
                <div style={{ fontSize: 110, color: b.color }}>{b.temp}</div>
              </div>
            );
          })}
          {/* 방 → 바깥 화살표와 물음표 */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 1080,
              textAlign: "center",
              fontFamily: headFont,
              fontSize: 110,
              color: C.ink,
              opacity: interpolate(frame, [PUZZLE + 90, PUZZLE + 105], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            열 →{" "}
            <span style={{ display: "inline-block", color: "#FF3B4E", scale: String(q) }}>?</span>
          </div>
        </>
      ) : null}

      <Captions
        accent={C.warm}
        lines={[
          { from: 0, text: "먼저 꼭 알아야 할 [규칙] 하나!" },
          { from: 70, text: "열은 항상 [뜨거운 곳 → 차가운 곳]으로만 흘러요" },
          { from: PUZZLE, text: "그런데 여름엔 바깥이 방보다 [더 뜨겁죠]" },
          { from: PUZZLE + 100, text: "그럼 방의 열을 [더 뜨거운 바깥]으로 어떻게 보낼까요?" },
        ]}
      />
    </AbsoluteFill>
  );
};
