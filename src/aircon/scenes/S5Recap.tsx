import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Backdrop, BigWord, Captions, Pic } from "../components";
import { C, headFont } from "../theme";

// 정리: 차갑게 해서 받고, 뜨겁게 해서 버린다 → 열 펌프
export const S5Recap: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Backdrop />
      <Pic src="person_cool.png" x={540} y={1000} size={760} float={8} />
      {frame >= 210 ? (
        <BigWord font={headFont} y={330} delay={210} size={150}>
          <span style={{ color: C.hot }}>열</span> 펌프
        </BigWord>
      ) : null}
      <Captions
        lines={[
          { from: 0, text: "정리하면, 냉매를 [차갑게] 해서 방의 열을 받고" },
          { from: 110, text: "[뜨겁게] 해서 바깥에 버리는 걸 계속 반복해요" },
          { from: 210, text: "그래서 에어컨은 [열을 퍼 나르는 펌프]예요" },
        ]}
      />
    </AbsoluteFill>
  );
};
