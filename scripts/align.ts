// Whisper 가 받아쓴 내용과 원문을 비교하기 위한 토큰 나누기
// - 영어: 단어 단위 (소문자, 구두점·아포스트로피 제거)
// - 한국어: 글자(음절) 단위 (띄어쓰기는 받아쓰기마다 달라서 무시)

// 숫자와, 발음이 같아서 Whisper 가 헷갈리는 단어는 같은 것으로 봅니다.
const SAME_AS: Record<string, string> = {
  zero: "0", one: "1", won: "1", two: "2", too: "2", to: "2", three: "3",
  four: "4", for: "4", five: "5", six: "6", seven: "7", eight: "8", ate: "8",
  nine: "9", ten: "10", eleven: "11", twelve: "12",
  ok: "okay", hey: "hi",
};

export const tokens = (text: string) =>
  (text.toLowerCase().replace(/[’']/g, "").match(/[가-힣]|[a-z0-9]+/g) ?? []).map(
    (t) => SAME_AS[t] ?? t,
  );
