import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Backdrop, Captions, Pic } from "../components";
import { C, headFont } from "../theme";

// 0~5초: 더운 여름, "냉기를 만든다?" 에 X 표시
export const S1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stamp = spring({ frame: frame - 85, fps, config: { damping: 9, stiffness: 220 } });
  return (
    <AbsoluteFill>
      <Backdrop glow={C.hot} />
      <Pic src="sun_hot.png" x={800} y={470} size={360} float={14} />
      <Pic src="person_hot.png" x={460} y={900} size={680} delay={8} float={6} />

      {/* "냉기 생성?" 말풍선과 X 도장 */}
      <div
        style={{
          position: "absolute",
          left: 120,
          top: 330,
          padding: "22px 36px",
          borderRadius: 30,
          background: C.cold,
          color: C.bg,
          fontFamily: headFont,
          fontSize: 76,
          scale: String(spring({ frame: frame - 60, fps, config: { damping: 12 } })),
          rotate: "-6deg",
        }}
      >
        냉기를 만든다?
        <div
          style={{
            position: "absolute",
            inset: -20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 200,
            color: "#FF3B4E",
            opacity: interpolate(stamp, [0, 0.3], [0, 1], { extrapolateRight: "clamp" }),
            scale: String(interpolate(stamp, [0, 1], [2.2, 1])),
            textShadow: "0 6px 20px rgba(0,0,0,0.5)",
          }}
        >
          ✕
        </div>
      </div>

      <Captions
        accent={C.warm}
        lines={[
          { from: 0, text: "에어컨 바람은 [왜] 차가울까?" },
          { from: 75, text: "사실 에어컨은 [냉기를 만들지 않아요]" },
        ]}
      />
    </AbsoluteFill>
  );
};
