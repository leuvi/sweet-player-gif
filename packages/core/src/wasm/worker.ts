import __wbg_init, { encode_gif } from './wasm_module'

let wasmReady: Promise<unknown> | null = null

async function loadWasm(wasmUrl?: string): Promise<void> {
  if (wasmReady) {
    await wasmReady
    return
  }
  wasmReady = __wbg_init(wasmUrl)
  await wasmReady
}

self.onmessage = async (e: MessageEvent) => {
  const { allFrames, width, height, frameCount, delay, quality, wasmUrl } = e.data

  try {
    await loadWasm(wasmUrl)
    const result = encode_gif(allFrames, width, height, frameCount, delay, quality)
    const buffer = result.buffer
    ;(self as unknown as Worker).postMessage({ buffer }, [buffer])
  } catch (err) {
    ;(self as unknown as Worker).postMessage({ error: (err as Error).message })
  }
}
