let worker: Worker | null = null

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' })
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
      { allFrames, width, height, frameCount: frames.length, delay, quality },
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
