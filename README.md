# sweet-player-gif

[![npm version](https://img.shields.io/npm/v/sweet-player-gif.svg)](https://www.npmjs.com/package/sweet-player-gif)
[![npm downloads](https://img.shields.io/npm/dw/sweet-player-gif.svg)](https://www.npmjs.com/package/sweet-player-gif)
[![GitHub stars](https://img.shields.io/github/stars/leuvi/sweet-player-gif?style=social)](https://github.com/leuvi/sweet-player-gif)
[![license](https://img.shields.io/npm/l/sweet-player-gif.svg)](./LICENSE)

Capture frames from HTML5 `<video>` and generate animated GIFs — powered by Rust WASM for fast encoding.

Part of the [sweet-player](https://github.com/leuvi/sweet-player) ecosystem, alongside [sweet-subtitle](https://github.com/leuvi/sweet-subtitle). Works with any `<video>` element, no player coupling required.

## Install

```bash
npm install sweet-player-gif
```

## Quick Start

```ts
import { SweetPlayerGif } from 'sweet-player-gif'

const video = document.querySelector('video')!

const gif = new SweetPlayerGif(video, {
  duration: 3,      // capture last N seconds (default: 3)
  fps: 10,          // capture framerate (default: 10)
  maxWidth: 320,    // scale down to max width (default: 320)
  quality: 10,      // color quantization 1-30, lower = better (default: 10)
})

// Start capturing frames (call when video starts playing)
gif.start()

// ... user watches video for a few seconds ...

// Generate GIF from buffered frames
const blob = await gif.capture()

// Download
const a = document.createElement('a')
a.href = URL.createObjectURL(blob)
a.download = 'capture.gif'
a.click()

// Cleanup
gif.destroy()
```

## API

### `new SweetPlayerGif(video, options?)`

Creates a new instance bound to a `<video>` element.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `duration` | `number` | `3` | Seconds of video to buffer (min: 1, max: 10, clamped automatically) |
| `fps` | `number` | `10` | Frame capture rate |
| `maxWidth` | `number` | `320` | Max width for scaling (maintains aspect ratio) |
| `quality` | `number` | `10` | NeuQuant color quantization quality (1 = best/slowest, 30 = fastest/lowest) |

### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `start()` | `void` | Begin capturing frames into the ring buffer |
| `capture()` | `Promise<Blob>` | Encode buffered frames into a GIF and return as Blob |
| `stop()` | `void` | Stop frame capture |
| `destroy()` | `void` | Stop capture and release all resources |

### CORS

If the video source is cross-origin, you must set the `crossorigin` attribute and the server must send CORS headers:

```html
<video crossorigin="anonymous" src="https://example.com/video.mp4"></video>
```

Without this, `capture()` will throw a descriptive error instead of silently failing.

## How It Works

1. **Frame capture**: A `setInterval` timer draws the video to a scaled `<canvas>` at the configured FPS, storing raw RGBA pixel data in a ring buffer
2. **Ring buffer**: Keeps only the most recent `duration × fps` frames, automatically discarding older ones
3. **GIF encoding**: When `capture()` is called, all buffered frames are sent to a Rust WASM module that performs NeuQuant color quantization (256 colors per frame) and GIF/LZW encoding
4. **Output**: Returns a `Blob` with `type: 'image/gif'` — the caller decides whether to download, preview, or copy to clipboard

## Project Structure

```
sweet-player-gif/
  packages/
    core/           # TypeScript library (npm package)
      src/
        SweetPlayerGif.ts   # Main class
        frame-capture.ts    # Video → Canvas → RGBA frames
        ring-buffer.ts      # Circular buffer for frame storage
        wasm/bridge.ts      # WASM loader and encoder wrapper
    wasm/           # Rust WASM crate (GIF encoder)
      src/
        encoder.rs          # NeuQuant quantization + GIF encoding
  playground/       # Vite demo app
```

## Development

### Prerequisites

- Node.js >= 18
- pnpm
- Rust + wasm-pack

### Setup

```bash
git clone https://github.com/leuvi/sweet-player-gif.git
cd sweet-player-gif
pnpm install

# Build WASM module
pnpm build:wasm

# Build TypeScript library
pnpm build

# Start playground
pnpm dev
```

## License

[MIT](LICENSE)
