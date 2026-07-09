import { SweetPlayerGif } from 'sweet-player-gif'

const video = document.getElementById('video') as HTMLVideoElement
const dropZone = document.getElementById('drop-zone') as HTMLDivElement
const fileInput = document.getElementById('file-input') as HTMLInputElement
const btnStart = document.getElementById('btn-start') as HTMLButtonElement
const btnCapture = document.getElementById('btn-capture') as HTMLButtonElement
const btnStop = document.getElementById('btn-stop') as HTMLButtonElement
const status = document.getElementById('status') as HTMLDivElement
const result = document.getElementById('result') as HTMLDivElement
const gifPreview = document.getElementById('gif-preview') as HTMLImageElement
const gifDownload = document.getElementById('gif-download') as HTMLAnchorElement

let gif: SweetPlayerGif | null = null

function setStatus(text: string) {
  status.textContent = text
}

function loadVideo(file: File) {
  const url = URL.createObjectURL(file)
  video.src = url
  video.load()
  setStatus(`Loaded: ${file.name}`)

  video.addEventListener('loadedmetadata', () => {
    if (gif) gif.destroy()
    gif = new SweetPlayerGif(video, {
      duration: 5,
      fps: 10,
      maxWidth: 320,
      quality: 10,
    })
    btnStart.disabled = false
    setStatus(`Ready — ${video.videoWidth}x${video.videoHeight}, duration: ${Math.round(video.duration)}s`)
  }, { once: true })
}

fileInput.addEventListener('change', () => {
  if (fileInput.files?.[0]) loadVideo(fileInput.files[0])
})

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault()
  dropZone.classList.add('dragover')
})

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover')
})

dropZone.addEventListener('drop', (e) => {
  e.preventDefault()
  dropZone.classList.remove('dragover')
  if (e.dataTransfer?.files[0]) loadVideo(e.dataTransfer.files[0])
})

btnStart.addEventListener('click', () => {
  if (!gif) return
  gif.start()
  video.play()
  btnStart.disabled = true
  btnCapture.disabled = false
  btnStop.disabled = false
  setStatus('Capturing frames...')
})

btnCapture.addEventListener('click', async () => {
  if (!gif) return
  btnCapture.disabled = true
  setStatus('Encoding GIF...')

  try {
    const blob = await gif.capture()
    const url = URL.createObjectURL(blob)

    gifPreview.src = url
    gifDownload.href = url
    result.style.display = 'block'

    const sizeKB = Math.round(blob.size / 1024)
    setStatus(`GIF generated — ${sizeKB} KB`)
  } catch (e) {
    setStatus(`Error: ${(e as Error).message}`)
  }

  btnCapture.disabled = false
})

btnStop.addEventListener('click', () => {
  if (!gif) return
  gif.stop()
  btnStart.disabled = false
  btnCapture.disabled = true
  btnStop.disabled = true
  setStatus('Capture stopped')
})
