import { FrameCapture } from './frame-capture'
import { encodeGif } from './wasm/bridge'
import type { SweetPlayerGifOptions, ResolvedOptions } from './types'

export class SweetPlayerGif {
  private frameCapture: FrameCapture
  private options: ResolvedOptions
  private capturing = false

  constructor(video: HTMLVideoElement, options?: SweetPlayerGifOptions) {
    this.options = {
      duration: options?.duration ?? 3,
      fps: options?.fps ?? 10,
      maxWidth: options?.maxWidth ?? 320,
      quality: options?.quality ?? 10,
    }
    this.frameCapture = new FrameCapture(video, this.options)
  }

  start(): void {
    if (this.capturing) return
    this.capturing = true
    this.frameCapture.start()
  }

  async capture(): Promise<Blob> {
    const { frames, width, height } = this.frameCapture.getFrames()
    if (frames.length === 0) {
      throw new Error('No frames captured. Call start() and wait for frames to accumulate.')
    }

    const gifBytes = await encodeGif(frames, width, height, this.options.fps, this.options.quality)
    return new Blob([gifBytes], { type: 'image/gif' })
  }

  stop(): void {
    if (!this.capturing) return
    this.capturing = false
    this.frameCapture.stop()
  }

  destroy(): void {
    this.stop()
    this.frameCapture.destroy()
  }
}
