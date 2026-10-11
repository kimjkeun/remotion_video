// 내레이터 스타일 목록. `npm run tts -- --style=2` 처럼 번호로 고릅니다 (기본 1).
// voice: Gemini TTS 기본 목소리 이름, style: 말투 지시문
import { NARRATOR } from "./longform/script";

export type Narrator = { voice: string; style: string; label: string };

// 번호는 고정: 1 선생님, 2 friendly, 3 언니·형 (이전 Puck·Charon·Kore 음성은 audio-archive/ 에 보관)
export const STYLES: Record<number, Narrator> = {
  1: { ...NARRATOR, label: "Laomedeia · 차분한 과학 선생님" },
  2: {
    label: "Laomedeia · friendly",
    voice: "Laomedeia",
    style: "friendly",
  },
  3: {
    label: "Achird · 친근한 언니·형",
    voice: "Achird",
    style:
      "a friendly older sibling casually explaining to a younger sibling in natural conversational Korean, relaxed and warm, slightly playful",
  },
};

// 음성 폴더 이름: 스타일 1은 기존 폴더 그대로, 나머지는 <프로젝트>-s<번호>
export const audioDirName = (project: string, style: number) => (style === 1 ? project : `${project}-s${style}`);
