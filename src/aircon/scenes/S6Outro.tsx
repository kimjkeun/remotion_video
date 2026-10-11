import React from "react";
import { AbsoluteFill } from "remotion";
import { Backdrop, BigWord, Captions } from "../components";
import { C, headFont } from "../theme";

// 45~48초: 다음 영상 예고 + 구독 유도
export const S6Outro: React.FC = () => {
  return (
    <AbsoluteFill>
      <Backdrop glow={C.warm} />
      <BigWord font={headFont} y={640} size={110} color={C.cold}>
        다음 &quot;왜?&quot;
      </BigWord>
      <BigWord font={headFont} y={790} delay={8} size={110}>
        냉장고 편
      </BigWord>
      <Captions
        accent={C.warm}
        lines={[{ from: 0, text: "궁금한 [왜?]를 댓글로 남겨 주세요!" }]}
      />
    </AbsoluteFill>
  );
};
