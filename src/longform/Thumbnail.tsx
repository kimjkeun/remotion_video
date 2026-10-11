// 유튜브 썸네일 (1280x720): Codex 가 그린 그림 위에 한글 제목을 얹습니다.
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { bodyFont, C, headFont } from "../aircon/theme";

export type ThumbnailProps = { bg: string };

// 작게 봐도 읽히도록 굵은 외곽선 + 그림자
const outline = (color: string, w: number) => ({
  WebkitTextStroke: `${w}px ${color}`,
  paintOrder: "stroke fill" as const,
  textShadow: "0 10px 24px rgba(0,0,0,0.55)",
});

export const Thumbnail: React.FC<ThumbnailProps> = ({ bg }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <Img src={staticFile(`images/${bg}`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      {/* 왼쪽 글자 영역을 살짝 어둡게 해서 대비 확보 */}
      <AbsoluteFill
        style={{ background: "linear-gradient(90deg, rgba(11,21,48,0.85) 0%, rgba(11,21,48,0.55) 40%, rgba(11,21,48,0) 58%)" }}
      />
      <div style={{ position: "absolute", left: 56, top: 92, width: 640, fontFamily: headFont, lineHeight: 1.04 }}>
        <div style={{ fontSize: 96, color: C.ink, ...outline(C.bg, 10) }}>에어컨은</div>
        <div style={{ fontSize: 112, color: C.cold, ...outline(C.bg, 12) }}>냉기를</div>
        <div style={{ fontSize: 134, color: C.hot, ...outline(C.bg, 14) }}>안 만든다?!</div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 60,
          top: 548,
          padding: "12px 28px",
          borderRadius: 999,
          background: C.warm,
          color: C.bg,
          fontFamily: bodyFont,
          fontWeight: 900,
          fontSize: 40,
          boxShadow: "0 10px 24px rgba(0,0,0,0.45)",
        }}
      >
        열을 옮기는 원리, 7분 정리
      </div>
    </AbsoluteFill>
  );
};
