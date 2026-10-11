import React from "react";
import { AbsoluteFill } from "remotion";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { bodyFont, C } from "./theme";
import { S1Hook } from "./scenes/S1Hook";
import { S2Move } from "./scenes/S2Move";
import { S2bRule } from "./scenes/S2bRule";
import { S3Evaporate } from "./scenes/S3Evaporate";
import { CYCLE_DURATION, S4Cycle } from "./scenes/S4Cycle";
import { S5Recap } from "./scenes/S5Recap";
import { S6Outro } from "./scenes/S6Outro";

const T = 10; // 장면 전환 프레임 수

// 장면 길이 합계 3120 - 전환 6회 x 10 = 3060프레임 (약 102초)
export const AIRCON_DURATION = 3060;

export const AirconShorts: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={150} name="S1 훅">
          <S1Hook />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence durationInFrames={180} name="S2 열을 옮긴다">
          <S2Move />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence durationInFrames={420} name="S2b 열의 규칙">
          <S2bRule />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence durationInFrames={420} name="S3 증발과 냉매">
          <S3Evaporate />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence durationInFrames={CYCLE_DURATION} name="S4 냉매 순환">
          <S4Cycle />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence durationInFrames={300} name="S5 정리">
          <S5Recap />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence durationInFrames={120} name="S6 아웃트로">
          <S6Outro />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {/* 상단 시리즈 라벨 (영상 전체 고정) */}
      <div
        style={{
          position: "absolute",
          top: 140,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontFamily: bodyFont,
            fontWeight: 900,
            fontSize: 46,
            color: C.bg,
            background: C.cold,
            padding: "12px 34px",
            borderRadius: 999,
          }}
        >
          1분 과학 · 에어컨
        </div>
      </div>
    </AbsoluteFill>
  );
};
