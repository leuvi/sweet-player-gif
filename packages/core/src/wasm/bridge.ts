import __wbg_init, { encode_gif } from './wasm_module'

let wasmReady: Promise<unknown> | null = null

async function loadWasm(): Promise<void> {
  if (wasmReady) {
    await wasmReady
    return
  }
  wasmReady = __wbg_init()
  await wasmReady
}

export async function encodeGif(
  frames: Uint8Array[],
  width: number,
  height: number,
  fps: number,
  quality: number,
): Promise<Uint8Array> {
  await loadWasm()

  const frameSize = width * height * 4
  const allFrames = new Uint8Array(frames.length * frameSize)
  for (let i = 0; i < frames.length; i++) {
    allFrames.set(frames[i], i * frameSize)
  }

  const delay = Math.round(100 / fps)
  return encode_gif(allFrames, width, height, frames.length, delay, quality)
}
