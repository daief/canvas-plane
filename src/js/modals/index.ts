import { Sprite } from "../Sprite";

export interface KeyListener {
  key: string
  listener: (e: KeyboardEvent, status: boolean) => void
}

export interface KeyImagePair {
  [key: string]: HTMLImageElement
}

export interface Painter {
  advance?: Function
  paint: (sprite: Sprite, context: CanvasRenderingContext2D) => void
}

export interface SheetCell {
  left: number
  top: number
  width: number
  height: number
}

export interface Behavior {
  lastAdvance?: number
  PAGEFLIP_INTERVAL?: number
  execute:  (sprite: Sprite, context: CanvasRenderingContext2D, now: number) => void
}

export interface Rect {
  top: number
  left: number
  width: number
  height: number
}