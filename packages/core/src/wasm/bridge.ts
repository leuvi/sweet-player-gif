import workerCode from './worker-inline'

let worker: Worker | null = null

function getWorker(): Worker {
  if (!worker) {
    const blob = new Blob([workerCode], { type: 'text/javascript' })
    const url = URL.createObjectURL(blob)
    worker = new Worker(url)
  }
  return worker
}

export function encodeGif(
  frames: Uint8Array[],
  width: number,
  height: number,
  fps: number,
  quality: number,
): Promise<Uint8Array> {
  const frameSize = width * height * 4
  const allFrames = new Uint8Array(frames.length * frameSize)
  for (let i = 0; i < frames.length; i++) {
    allFrames.set(frames[i], i * frameSize)
  }

  const delay = Math.round(100 / fps)
  const wasmUrl = new URL('./sweet_player_gif_wasm_bg.wasm', import.meta.url).href
  const w = getWorker()

  return new Promise((resolve, reject) => {
    w.onmessage = (e: MessageEvent) => {
      if (e.data.error) {
        reject(new Error(e.data.error))
      } else {
        resolve(new Uint8Array(e.data.buffer))
      }
    }
    w.onerror = (e) => reject(new Error(e.message))

    const buffer = allFrames.buffer
    w.postMessage(
      { allFrames, width, height, frameCount: frames.length, delay, quality, wasmUrl },
      [buffer],
    )
  })
}

export function terminateWorker(): void {
  if (worker) {
    worker.terminate()
    worker = null
  }
}
