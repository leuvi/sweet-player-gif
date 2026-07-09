import { RingBuffer } from './ring-buffer'
import type { ResolvedOptions } from './types'

export interface CapturedFrames {
  frames: Uint8Array[]
  width: number
  height: number
}

export class FrameCapture {
  private canvas: HTMLCanvasElement | OffscreenCanvas
  private ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
  private ringBuffer: RingBuffer<Uint8Array>
  private intervalId: ReturnType<typeof setInterval> | null = null
  private width: number
  private height: number

  constructor(
    private video: HTMLVideoElement,
    private options: ResolvedOptions,
  ) {
    const vw = video.videoWidth || 640
    const vh = video.videoHeight || 360
    const scale = Math.min(1, options.maxWidth / vw)
    this.width = Math.round(vw * scale)
    this.height = Math.round(vh * scale)

    if (typeof OffscreenCanvas !== 'undefined') {
      this.canvas = new OffscreenCanvas(this.width, this.height)
      this.ctx = this.canvas.getContext('2d')!
    } else {
      this.canvas = document.createElement('canvas')
      this.canvas.width = this.width
      this.canvas.height = this.height
      this.ctx = this.canvas.getContext('2d')!
    }

    this.ringBuffer = new RingBuffer(options.duration * options.fps)
  }

  start(): void {
    if (this.intervalId !== null) return

    const interval = 1000 / this.options.fps
    this.intervalId = setInterval(() => this.captureFrame(), interval)
  }

  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  getFrames(): CapturedFrames {
    return {
      frames: this.ringBuffer.drain(),
      width: this.width,
      height: this.height,
    }
  }

  destroy(): void {
    this.stop()
    this.ringBuffer.clear()
  }

  private captureFrame(): void {
    if (this.video.paused || this.video.ended || this.video.readyState < 2) return

    this.ctx.drawImage(this.video, 0, 0, this.width, this.height)

    try {
      const imageData = this.ctx.getImageData(0, 0, this.width, this.height)
      this.ringBuffer.push(new Uint8Array(imageData.data.buffer))
    } catch (e) {
      if (e instanceof DOMException && e.name === 'SecurityError') {
        throw new Error(
          'Cannot capture frames: video is loaded from a cross-origin source without CORS headers. ' +
          'Add crossorigin="anonymous" to the <video> element and ensure the server sends Access-Control-Allow-Origin headers.',
        )
      }
      throw e
    }
  }
}
