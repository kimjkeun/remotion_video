// TTS 요청 한 건 (문장 하나)
export type AudioRequest = {
  key: string;
  lang: "en" | "ko";
  // 파일 이름용: 예) c05-07
  fileKey: string;
  // 누가 읽는지 (내레이터 한 명)
  label: string;
  text: string;
  voice: string;
  style: string;
};
