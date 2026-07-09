export interface SweetPlayerGifOptions {
  duration?: number
  fps?: number
  maxWidth?: number
  quality?: number
}

export type ResolvedOptions = Required<SweetPlayerGifOptions>
