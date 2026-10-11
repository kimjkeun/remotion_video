// 전체 음성을 "말하는 덩어리"로 나누고, 덩어리마다 Whisper 로 받아써서
// 원문 문장 순서대로 짝을 지어 문장별 음성을 만듭니다.
//
// - 자르는 위치는 음량(무음)으로 정하므로 정확합니다.
// - 어느 덩어리가 어느 문장인지는 받아쓴 내용으로 정합니다.
//   한 문장이 여러 덩어리로 나뉘면 합치고 ("Hi there." + "What can I..."),
//   모델이 같은 문장을 한 번 더 읽은 덩어리는 건너뜁니다.
import { tokens } from "./align";
import { transcribeText, type Lang } from "./whisper";
import type { Pcm } from "./wav";

const WINDOW_SEC = 0.02;
// 이보다 짧은 무음은 덩어리를 나누지 않습니다 (단어 사이 짧은 쉼)
const MIN_GAP_SEC = 0.25;
// 받아쓰기·잘라 낸 음성 앞뒤에 남기는 여유
const PAD_SEC = 0.12;
// 한 문장이 걸칠 수 있는 최대 덩어리 수 (한국어 해설은 쉼표마다 쉬어서 넉넉히)
const MAX_ISLANDS_PER_SENTENCE = 10;

// 검증 기준: 원문 토큰 중 그대로 들려야 하는 비율, 원문보다 더 들려도 되는 비율
// 한국어는 받아쓰기가 덜 정확하고 해설 속 영어 단어가 한글로 적히기도 해서 느슨하게
const RULES: Record<Lang, { minMatch: number; maxExtra: number }> = {
  en: { minMatch: 0.85, maxExtra: 0 },
  ko: { minMatch: 0.7, maxExtra: 0.15 },
};

type Island = { start: number; end: number }; // 샘플 프레임 단위

const findIslands = (pcm: Pcm): Island[] => {
  const frame = Math.round(pcm.sampleRate * WINDOW_SEC);
  const frames = pcm.samples.length / pcm.channels;
  const levels: number[] = [];
  for (let f = 0; f < frames; f += frame) {
    const end = Math.min(f + frame, frames);
    let sum = 0;
    for (let i = f * pcm.channels; i < end * pcm.channels; i++) {
      sum += pcm.samples[i] * pcm.samples[i];
    }
    levels.push(Math.sqrt(sum / Math.max(1, (end - f) * pcm.channels)));
  }
  const threshold = Math.max(...levels) * 0.03;
  const minGap = Math.round(MIN_GAP_SEC / WINDOW_SEC);

  const islands: Island[] = [];
  let start = -1;
  let silentRun = 0;
  for (let w = 0; w <= levels.length; w++) {
    const loud = w < levels.length && levels[w] >= threshold;
    if (loud) {
      if (start < 0) {
        start = w;
      }
      silentRun = 0;
    } else if (start >= 0) {
      silentRun++;
      if (silentRun >= minGap || w === levels.length) {
        islands.push({ start: start * frame, end: (w - silentRun + 1) * frame });
        start = -1;
        silentRun = 0;
      }
    }
  }
  return islands;
};

const slice = (pcm: Pcm, from: number, to: number, padFrames: number): Pcm => {
  const frames = pcm.samples.length / pcm.channels;
  const a = Math.max(0, from - padFrames);
  const b = Math.min(frames, to + padFrames);
  return { ...pcm, samples: pcm.samples.slice(a * pcm.channels, b * pcm.channels) };
};

const withSilence = (pcm: Pcm, sec: number): Pcm => {
  const pad = new Int16Array(Math.round(pcm.sampleRate * sec) * pcm.channels);
  const samples = new Int16Array(pad.length * 2 + pcm.samples.length);
  samples.set(pcm.samples, pad.length);
  return { ...pcm, samples };
};

const editDistance = (a: string[], b: string[]) => {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...new Array<number>(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(
        d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
      );
    }
  }
  return d[a.length][b.length];
};

// TTS 가 문장 사이 쉼 지시(<long pause>)를 소리 내어 읽어 버린 경우.
// 한국어는 원문에 없는 말을 조금 허용하므로, 이 경우는 따로 잡아냅니다.
const readsBreakTag = (heard: string, sentence: string) =>
  /pause|퍼즈|포즈/i.test(heard) && !/pause/i.test(sentence);

// 띄어쓰기·하이픈만 다르게 받아쓴 경우는 같은 문장으로 봅니다.
// (key card ↔ keycard, check-out ↔ checkout, Wi-Fi ↔ wifi, seven to ten ↔ 7-10)
// 글자를 이어 붙여 비교하되, 글자가 많이 늘었다면 다른 말이 섞인 것이라 통과시키지 않습니다.
const sameLetters = (expected: string[], heard: string[]) => {
  const a = [...expected.join("")];
  const b = [...heard.join("")];
  const match = 1 - editDistance(a, b) / Math.max(1, a.length);
  return match >= 0.9 && b.length - a.length <= Math.max(2, Math.floor(a.length * 0.1));
};

export type SentenceAudio = {
  pcm: Pcm;
  heard: string;
  match: number; // 원문 단어 중 그대로 들린 비율
  verified: boolean; // 원문과 (거의) 같게 들렸는지
};

/**
 * 전체 음성을 문장별 음성으로 나눕니다.
 * 받아쓴 내용과 원문을 비교해 문장마다 검증 결과도 함께 돌려줍니다.
 */
export const splitBySentences = async (
  pcm: Pcm,
  sentences: string[],
  root: string,
  lang: Lang,
): Promise<{ pieces: SentenceAudio[]; skipped: string[] } | undefined> => {
  const rule = RULES[lang];
  const islands = findIslands(pcm);
  if (islands.length < sentences.length) {
    return undefined;
  }
  const pad = Math.round(pcm.sampleRate * PAD_SEC);

  // 덩어리마다 따로 받아쓰기 (짧은 음성이라 시간 어긋남이 없음)
  const heard: { text: string; words: string[] }[] = [];
  for (const island of islands) {
    const text = await transcribeText(
      withSilence(slice(pcm, island.start, island.end, pad), 0.3),
      root,
      lang,
    );
    heard.push({ text, words: tokens(text) });
  }

  // 덩어리들을 순서대로 문장에 배정 (건너뛰는 덩어리 허용)
  const expected = sentences.map(tokens);
  const N = sentences.length;
  const M = islands.length;
  const INF = Number.POSITIVE_INFINITY;
  const cost = Array.from({ length: N + 1 }, () => new Array<number>(M + 1).fill(INF));
  const from = Array.from({ length: N + 1 }, () => new Array<[number, number] | null>(M + 1).fill(null));
  cost[0][0] = 0;
  for (let s = 0; s <= N; s++) {
    for (let i = 0; i <= M; i++) {
      if (cost[s][i] === INF || i === M) continue;
      // 덩어리 i 를 건너뜀: 그 안의 단어 수만큼 비용
      const skip = cost[s][i] + heard[i].words.length;
      if (skip < cost[s][i + 1]) {
        cost[s][i + 1] = skip;
        from[s][i + 1] = [s, i];
      }
      if (s === N) continue;
      // 덩어리 i..j-1 을 문장 s 로
      for (let j = i + 1; j <= Math.min(M, i + MAX_ISLANDS_PER_SENTENCE); j++) {
        const words = heard.slice(i, j).flatMap((h) => h.words);
        const c = cost[s][i] + editDistance(expected[s], words);
        if (c < cost[s + 1][j]) {
          cost[s + 1][j] = c;
          from[s + 1][j] = [s, i];
        }
      }
    }
  }
  if (cost[N][M] === INF) {
    return undefined;
  }

  // 역추적
  const ranges: { first: number; last: number }[] = new Array(N);
  const skippedIdx: number[] = [];
  let s = N;
  let i = M;
  while (s > 0 || i > 0) {
    const [ps, pi] = from[s][i]!;
    if (ps === s) {
      skippedIdx.push(pi);
    } else {
      ranges[ps] = { first: pi, last: i - 1 };
    }
    s = ps;
    i = pi;
  }

  const pieces = ranges.map((r, k) => {
    const words = heard.slice(r.first, r.last + 1).flatMap((h) => h.words);
    const text = heard.slice(r.first, r.last + 1).map((h) => h.text).join(" ");
    const distance = editDistance(expected[k], words);
    // 원문 단어 중 맞게 들린 비율 (대략: 1 - 편집 거리 / 원문 단어 수)
    const match = Math.max(0, 1 - distance / expected[k].length);
    // 원문보다 단어가 더 들렸다면 다른 문장이 섞인 것
    const extra = Math.max(0, words.length - expected[k].length);
    const wordsOk =
      match >= rule.minMatch && extra <= Math.floor(expected[k].length * rule.maxExtra);
    return {
      pcm: slice(pcm, islands[r.first].start, islands[r.last].end, pad),
      heard: text,
      match,
      verified:
        (wordsOk || sameLetters(expected[k], words)) && !readsBreakTag(text, sentences[k]),
    };
  });
  const skipped = skippedIdx
    .reverse()
    .map((k) => heard[k].text)
    .filter((t) => t.length > 0);
  return { pieces, skipped };
};
