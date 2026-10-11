import { loadFont as loadBlackHan } from "@remotion/google-fonts/BlackHanSans";
import { loadFont as loadNoto } from "@remotion/google-fonts/NotoSansKR";

export const { fontFamily: headFont } = loadBlackHan("normal", {
  subsets: ["korean", "latin"],
  ignoreTooManyRequestsWarning: true,
});
export const { fontFamily: bodyFont } = loadNoto("normal", {
  weights: ["700", "900"],
  subsets: ["korean", "latin"],
  ignoreTooManyRequestsWarning: true,
});

export const C = {
  bg: "#0B1530",
  bg2: "#13244D",
  ink: "#FFFFFF",
  dim: "#8FA3C8",
  cold: "#5BC8FF",
  coolGas: "#B8E4FA",
  hot: "#FF7A3D",
  warm: "#FFB547",
};

export const FPS = 30;
