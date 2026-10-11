// 16bit PCM WAV 읽기/쓰기

export type Pcm = {
  sampleRate: number;
  channels: number;
  samples: Int16Array; // 인터리브된 샘플 (채널 수만큼 번갈아 저장)
};

export const parseWav = (buffer: Buffer): Pcm => {
  let sampleRate = 0;
  let channels = 0;
  let bitsPerSample = 0;
  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const id = buffer.toString("ascii", offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    if (id === "fmt ") {
      channels = buffer.readUInt16LE(offset + 10);
      sampleRate = buffer.readUInt32LE(offset + 12);
      bitsPerSample = buffer.readUInt16LE(offset + 22);
    }
    if (id === "data") {
      if (bitsPerSample !== 16) {
        throw new Error(`16bit WAV만 지원합니다 (받은 값: ${bitsPerSample}bit)`);
      }
      // 스트리밍용 헤더는 크기가 0xFFFFFFFF 일 수 있어 실제 남은 바이트로 보정
      const start = offset + 8;
      const bytes = Math.min(size, buffer.length - start) & ~1;
      const samples = new Int16Array(bytes / 2);
      for (let i = 0; i < samples.length; i++) {
        samples[i] = buffer.readInt16LE(start + i * 2);
      }
      return { sampleRate, channels, samples };
    }
    offset += 8 + size + (size % 2);
  }
  throw new Error("WAV data chunk not found");
};

export const writeWav = (pcm: Pcm): Buffer => {
  const dataBytes = pcm.samples.length * 2;
  const buffer = Buffer.alloc(44 + dataBytes);
  buffer.write("RIFF", 0, "ascii");
  buffer.writeUInt32LE(36 + dataBytes, 4);
  buffer.write("WAVE", 8, "ascii");
  buffer.write("fmt ", 12, "ascii");
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(pcm.channels, 22);
  buffer.writeUInt32LE(pcm.sampleRate, 24);
  buffer.writeUInt32LE(pcm.sampleRate * pcm.channels * 2, 28);
  buffer.writeUInt16LE(pcm.channels * 2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36, "ascii");
  buffer.writeUInt32LE(dataBytes, 40);
  for (let i = 0; i < pcm.samples.length; i++) {
    buffer.writeInt16LE(pcm.samples[i], 44 + i * 2);
  }
  return buffer;
};

export const pcmDuration = (pcm: Pcm) =>
  pcm.samples.length / pcm.channels / pcm.sampleRate;
