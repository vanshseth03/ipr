export function normalizeAudioLevel(level) {
  const value = Number(level);

  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(1, Math.max(0, value));
}

export function createAudioBuffer(data) {
  if (data instanceof Uint8Array) {
    return data;
  }

  if (ArrayBuffer.isView(data)) {
    return new Uint8Array(data.buffer);
  }

  return data;
}
