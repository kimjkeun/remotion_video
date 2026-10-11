// 로컬 whisper.cpp 로 짧은 음성을 받아씁니다.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  downloadWhisperModel,
  installWhisperCpp,
  transcribe,
  type WhisperModel,
} from "@remotion/install-whisper-cpp";
import { writeWav, type Pcm } from "./wav";

export const WHISPER_VERSION = "1.5.5";

export type Lang = "en" | "ko";

// 영어는 가벼운 영어 전용 모델, 한국어는 다국어 모델을 씁니다.
export const modelFor = (lang: Lang) =>
  (lang === "en"
    ? process.env.WHISPER_MODEL || "base.en"
    : process.env.WHISPER_MODEL_KO || "small") as WhisperModel;

let installed: Promise<string> | undefined;
const downloaded = new Map<WhisperModel, Promise<void>>();

// 처음 한 번만 whisper.cpp 와 모델을 내려받습니다 (video/whisper.cpp 폴더).
export const ensureWhisper = async (root: string, model: WhisperModel) => {
  installed ??= (async () => {
    // .env 의 WHISPER_DIR 이 있으면 이미 설치된 whisper.cpp 를 재사용합니다.
    const whisperPath = process.env.WHISPER_DIR || path.join(root, "whisper.cpp");
    await installWhisperCpp({ to: whisperPath, version: WHISPER_VERSION, printOutput: false });
    return whisperPath;
  })();
  const whisperPath = await installed;
  if (!downloaded.has(model)) {
    const modelFile = path.join(whisperPath, `ggml-${model}.bin`);
    if (!fs.existsSync(modelFile)) {
      console.log(`      Whisper 모델(${model}) 내려받는 중... (처음 한 번만)`);
    }
    downloaded.set(model, downloadWhisperModel({ model, folder: whisperPath, printOutput: false }).then(() => {}));
  }
  await downloaded.get(model);
  return whisperPath;
};

// whisper.cpp 는 16kHz 모노 WAV 만 받으므로 변환합니다.
export const to16kMono = (pcm: Pcm): Pcm => {
  const frames = pcm.samples.length / pcm.channels;
  const outFrames = Math.floor((frames * 16000) / pcm.sampleRate);
  const out = new Int16Array(outFrames);
  for (let i = 0; i < outFrames; i++) {
    const pos = (i * pcm.sampleRate) / 16000;
    const i0 = Math.floor(pos);
    const i1 = Math.min(i0 + 1, frames - 1);
    const frac = pos - i0;
    let v0 = 0;
    let v1 = 0;
    for (let c = 0; c < pcm.channels; c++) {
      v0 += pcm.samples[i0 * pcm.channels + c];
      v1 += pcm.samples[i1 * pcm.channels + c];
    }
    out[i] = Math.round((v0 * (1 - frac) + v1 * frac) / pcm.channels);
  }
  return { sampleRate: 16000, channels: 1, samples: out };
};

export const transcribeText = async (pcm: Pcm, root: string, lang: Lang): Promise<string> => {
  const model = modelFor(lang);
  const whisperPath = await ensureWhisper(root, model);
  const tmp = path.join(os.tmpdir(), `aircon-${process.pid}-${Date.now()}.wav`);
  fs.writeFileSync(tmp, writeWav(to16kMono(pcm)));
  try {
    const output = await transcribe({
      inputPath: tmp,
      whisperPath,
      whisperCppVersion: WHISPER_VERSION,
      model,
      language: lang,
      tokenLevelTimestamps: false,
      // 토큰 단위가 아니라 문장 단위로 받아야 단어/한글이 쪼개지지 않습니다.
      // (null 은 내부에서 1 로 바뀌어 토큰마다 나뉘므로 0 을 넘깁니다)
      tokensPerItem: 0,
      printOutput: false,
    });
    return output.transcription
      .map((t) => t.text)
      .join("")
      .replace(/\s+/g, " ")
      .trim();
  } finally {
    fs.rmSync(tmp, { force: true });
  }
};
