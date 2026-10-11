// Gemini TTS 요청 · Whisper 검증 공용 코드
// (참고: wordtalktalk/video/scripts/tts-core.ts 를 가져와 롱폼용으로 씁니다)
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { AudioRequest } from "./types";
import { parseWav, pcmDuration, writeWav, type Pcm } from "./wav";
import { splitBySentences, type SentenceAudio } from "./segment";

export { parseWav, pcmDuration, writeWav };

export const MODEL = "gemini-3.8-flash-tts";
export const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/interactions";
const MAX_RETRIES = 6;
// 문장 사이에 넣는 쉼 (자르기 쉽도록)
export const SENTENCE_BREAK = " <long pause>";
// 묶는 방식이나 요청 형식을 바꾸면 올려서 전체를 다시 만들게 합니다.
export const GROUPING_VERSION = "2";

export const ROOT = path.resolve(import.meta.dirname, "..");

export const loadDotEnv = () => {
  const file = path.join(ROOT, ".env");
  if (!fs.existsSync(file)) {
    return;
  }
  for (const line of fs.readFileSync(file, "utf-8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }
};

export const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .replace(/-+$/g, "");


// ---------- 묶음 ----------

export type Group = { id: string; items: AudioRequest[] };

// version: 묶는 방식이 바뀌면 다시 만들도록 hash 에 섞는 값 (회화는 GROUPING_VERSION)
export const groupHash = (group: Group, version = GROUPING_VERSION) =>
  createHash("sha1")
    .update(
      JSON.stringify([
        MODEL,
        version,
        group.items.map((r) => [r.label, r.voice, r.style, r.text]),
      ]),
    )
    .digest("hex")
    .slice(0, 16);

// ---------- API ----------

type InteractionResponse = {
  output_audio?: { data?: string };
  steps?: {
    type?: string;
    content?: { type?: string; data?: string }[];
  }[];
  error?: {
    message?: string;
    details?: { "@type"?: string; retryDelay?: string }[];
  };
};

export class DailyQuotaError extends Error {}

const extractAudio = (json: InteractionResponse) => {
  if (json.output_audio?.data) {
    return json.output_audio.data;
  }
  const audio = (json.steps ?? [])
    .filter((step) => step.type === "model_output")
    .flatMap((step) => step.content ?? [])
    .filter((c) => c.type === "audio" && c.data);
  return audio[audio.length - 1]?.data;
};

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// 분당 요청 수 제한: 요청 시작 간격을 일정하게 벌립니다.
let nextRequestAt = 0;
const throttle = async (rpm: number) => {
  const interval = Math.ceil(60_000 / rpm) + 200;
  const wait = nextRequestAt - Date.now();
  if (wait > 0) {
    await sleep(wait);
  }
  nextRequestAt = Date.now() + interval;
};

// 문장 여러 개를 한 번에 요청합니다. 화자가 둘 이상이면 대화 모드로 보냅니다.
const buildBody = (items: AudioRequest[]) => {
  const speakers = [...new Map(items.map((r) => [r.label, r.voice])).entries()];
  const conversational = speakers.length > 1;
  return {
    model: MODEL,
    input: [
      {
        type: "user_input",
        content: items.map((r, i) => ({
          type: "text",
          text: i < items.length - 1 ? r.text + SENTENCE_BREAK : r.text,
          annotations: [
            {
              type: "speech_metadata",
              ...(conversational ? { speaker: r.label } : {}),
              style: r.style,
            },
          ],
        })),
      },
    ],
    response_format: { type: "audio", mime_type: "audio/wav" },
    generation_config: {
      speech_config: conversational
        ? {
            mode: "conversational",
            speakers: speakers.map(([speaker, voice]) => ({ speaker, voice })),
          }
        : [{ voice: items[0].voice }],
    },
  };
};

export const synthesize = async (
  items: AudioRequest[],
  apiKey: string,
  rpm: number,
): Promise<Pcm> => {
  const body = JSON.stringify(buildBody(items));
  for (let attempt = 1; ; attempt++) {
    await throttle(rpm);
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body,
    });
    const json = (await response.json().catch(() => ({}))) as InteractionResponse;

    if (response.status === 429) {
      const message = json.error?.message ?? "";
      if (/per.?day|daily/i.test(message)) {
        throw new DailyQuotaError(message);
      }
      if (attempt < MAX_RETRIES) {
        // 서버가 알려 준 대기 시간(예: "37s")을 따르고, 없으면 1분 대기
        const delay = json.error?.details?.find((d) => d.retryDelay)?.retryDelay;
        const waitMs = (delay ? parseFloat(delay) : 60) * 1000 + 1000;
        console.warn(`    요청 한도 도달 — ${Math.round(waitMs / 1000)}초 기다렸다가 다시 시도합니다`);
        await sleep(waitMs);
        continue;
      }
    }
    if (response.status >= 500 && attempt < MAX_RETRIES) {
      const waitMs = 2 ** attempt * 1000;
      console.warn(`    서버 오류 HTTP ${response.status} — ${waitMs / 1000}초 후 재시도`);
      await sleep(waitMs);
      continue;
    }
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${json.error?.message ?? ""}`);
    }
    const data = extractAudio(json);
    if (!data) {
      throw new Error("응답에 오디오가 없습니다");
    }
    return parseWav(Buffer.from(data, "base64"));
  }
};

// ---------- 문장별로 나누기 + Whisper 검증 ----------

export type Piece = SentenceAudio;

export const cacheFile = (episodeDir: string, group: Group, hash: string) =>
  path.join(episodeDir, `${group.id}_${hash}.wav`);

// 묶음 전체 음성 → 덩어리별 Whisper → 문장별 음성.
// 실패하면 묶음을 한 번 더 생성하고, 그래도 안 되면 문제 문장만 따로 생성합니다.
export const synthesizeGroup = async (
  group: Group,
  hash: string,
  cacheDir: string,
  apiKey: string,
  rpm: number,
  useCache: boolean,
): Promise<Piece[]> => {
  const cached = cacheFile(cacheDir, group, hash);
  const texts = group.items.map((r) => r.text);
  let pieces: Piece[] | undefined;

  for (let attempt = 1; attempt <= 2; attempt++) {
    let full: Pcm;
    if (attempt === 1 && useCache && fs.existsSync(cached)) {
      console.log("      보관된 전체 음성 사용 (API 호출 없음)");
      full = parseWav(fs.readFileSync(cached));
    } else {
      full = await synthesize(group.items, apiKey, rpm);
      fs.writeFileSync(cached, writeWav(full));
    }
    console.log(`      Whisper 받아쓰기 중... (${pcmDuration(full).toFixed(1)}초)`);
    const result = await splitBySentences(full, texts, ROOT, group.items[0].lang);
    if (!result) {
      console.warn("      ✗ 문장 수만큼 나눌 수 없습니다");
    } else {
      pieces = result.pieces;
      for (const skipped of result.skipped) {
        console.warn(`      (원문에 없는 부분 제외: "${skipped}")`);
      }
      const bad = pieces.filter((p) => !p.verified);
      if (bad.length === 0) {
        return pieces;
      }
      pieces.forEach((p, i) => {
        if (!p.verified) {
          console.warn(`      ✗ ${group.items[i].fileKey}: 원문 "${texts[i]}" / 들린 내용 "${p.heard}"`);
        }
      });
    }
    if (attempt === 1) {
      console.warn("      원문과 다르게 읽힌 문장이 있어 묶음을 한 번 더 생성합니다");
    }
  }

  // 두 번 다 실패: 통과한 문장은 그대로 쓰고, 문제 문장만 따로 생성
  const result: Piece[] = [];
  for (const [i, item] of group.items.entries()) {
    if (pieces?.[i]?.verified) {
      result[i] = pieces[i];
      continue;
    }
    console.warn(`      ${item.fileKey} 를 따로 생성합니다`);
    let best = pieces?.[i];
    for (let attempt = 1; attempt <= 2; attempt++) {
      const pcm = await synthesize([item], apiKey, rpm);
      const one = (await splitBySentences(pcm, [item.text], ROOT, item.lang))?.pieces[0];
      if (one && (!best || one.verified || one.match > best.match)) {
        best = one;
      }
      if (one?.verified) {
        break;
      }
    }
    if (!best) {
      throw new Error(`${item.fileKey}: 음성을 만들지 못했습니다`);
    }
    result[i] = best;
  }
  return result;
};

// ---------- 목소리 확인 ----------

const PREBUILT_VOICES = [
  "Zephyr", "Puck", "Charon", "Kore", "Fenrir", "Leda", "Orus", "Aoede",
  "Callirrhoe", "Autonoe", "Enceladus", "Iapetus", "Umbriel", "Algieba",
  "Despina", "Erinome", "Algenib", "Rasalgethi", "Laomedeia", "Achernar",
  "Alnilam", "Schedar", "Gacrux", "Pulcherrima", "Achird", "Zubenelgenubi",
  "Vindemiatrix", "Sadachbia", "Sadaltager", "Sulafat",
];

// 응답 형식에 상관없이 JSON 안의 문자열 값을 모두 모읍니다.
const collectStrings = (value: unknown, out: Set<string>) => {
  if (typeof value === "string") {
    out.add(value.replace(/^voices\//, "").toLowerCase());
  } else if (Array.isArray(value)) {
    value.forEach((v) => collectStrings(v, out));
  } else if (value && typeof value === "object") {
    Object.values(value).forEach((v) => collectStrings(v, out));
  }
};

// 프리셋에 없는 목소리는 Extended Voice Library(GET /v1beta/voices)에서 찾아봅니다.
// 목록을 못 받아 오면 검사를 건너뛰고, 실제 요청에서 오류가 나면 그때 알려 줍니다.
export const checkVoices = async (voices: string[], apiKey: string) => {
  const prebuilt = new Set(PREBUILT_VOICES.map((v) => v.toLowerCase()));
  const unknown = voices.filter((v) => !prebuilt.has(v.toLowerCase()));
  if (unknown.length === 0) {
    return;
  }
  const library = new Set<string>();
  try {
    let pageToken = "";
    do {
      const url = new URL("https://generativelanguage.googleapis.com/v1beta/voices");
      url.searchParams.set("pageSize", "1000");
      if (pageToken) {
        url.searchParams.set("pageToken", pageToken);
      }
      const response = await fetch(url, { headers: { "x-goog-api-key": apiKey } });
      if (!response.ok) {
        console.warn(`목소리 목록을 확인하지 못했습니다 (HTTP ${response.status}). 검사를 건너뜁니다.`);
        return;
      }
      const json = (await response.json()) as { nextPageToken?: string };
      collectStrings(json, library);
      pageToken = json.nextPageToken ?? "";
    } while (pageToken);
  } catch {
    console.warn("목소리 목록을 확인하지 못했습니다. 검사를 건너뜁니다.");
    return;
  }
  const missing = unknown.filter((v) => !library.has(v.toLowerCase()));
  if (missing.length > 0) {
    const similar = [...library]
      .filter((name) => missing.some((m) => name.startsWith(m.slice(0, 3).toLowerCase())))
      .slice(0, 10);
    throw new Error(
      `목소리를 찾을 수 없습니다: ${missing.join(", ")}` +
        (similar.length ? `\n  비슷한 이름: ${similar.join(", ")}` : ""),
    );
  }
};

