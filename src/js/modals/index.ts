export interface KeyListener {
  key: string
  listener: (e: KeyboardEvent, status: boolean) => void
}

export interface KeyImagePair {
  [key: string]: HTMLImageElement
}
