import { Composition, Still } from "remotion";
import { MyComposition } from "./Composition";
import { AirconShorts, AIRCON_DURATION } from "./aircon/AirconShorts";
import { LongForm } from "./longform/LongForm";
import { LONGFORM_DURATION } from "./longform/timeline";
import { Thumbnail } from "./longform/Thumbnail";
import { ShortsTTS } from "./shorts2/ShortsTTS";
import { SHORTS_STYLES, shortsTimeline } from "./shorts2/timeline";
import { SkyLong, SkyShort } from "./sky/Compositions";
import { SKY_LONG_DURATION, SKY_SHORT_DURATION } from "./sky/timeline";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="AirconShorts"
        component={AirconShorts}
        durationInFrames={AIRCON_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="AirconLongForm"
        component={LongForm}
        durationInFrames={LONGFORM_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
      {/* 내레이터 스타일별 쇼츠: AirconShortsTTS (스타일 1), AirconShortsTTS-s2 ~ s5 */}
      {SHORTS_STYLES.map((style) => (
        <Composition
          key={style}
          id={style === 1 ? "AirconShortsTTS" : `AirconShortsTTS-s${style}`}
          component={ShortsTTS}
          durationInFrames={shortsTimeline(style).duration}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{ style }}
        />
      ))}
      {/* 하늘 편 (내레이션 스타일2) */}
      <Composition id="SkyLong" component={SkyLong} durationInFrames={SKY_LONG_DURATION} fps={30} width={1920} height={1080} />
      <Composition id="SkyShort" component={SkyShort} durationInFrames={SKY_SHORT_DURATION} fps={30} width={1080} height={1920} />
      <Still id="ThumbA" component={Thumbnail} width={1280} height={720} defaultProps={{ bg: "thumb_a.png" }} />
      <Still id="ThumbB" component={Thumbnail} width={1280} height={720} defaultProps={{ bg: "thumb_b.png" }} />
      <MyComposition />
    </>
  );
};
