import { Painter, SheetCell, Behavior } from "./modals";

/**
 * 图像绘制器
 */
export class ImagePainter implements Painter {
  image: HTMLImageElement

  constructor(imageUrl: string) {
    this.image = new Image()
    this.image.src = imageUrl
  }

  paint(sprite: Sprite, context: CanvasRenderingContext2D) {
    if (this.image !== undefined) {
      if (!this.image.complete) {
        this.image.onload = (e) => {
          sprite.width = this.image.width
          sprite.height = this.image.height

          context.drawImage(<HTMLImageElement> e.target,
            sprite.left, sprite.top,
            sprite.width, sprite.height)
        }
      } else {
        sprite.width = this.image.width
        sprite.height = this.image.height
        context.drawImage(this.image,
          sprite.left, sprite.top,
          sprite.width, sprite.height)
      }
    }
  }
}

/**
 * 精灵绘制器
 */
export class SpriteSheetPainter implements Painter {
  cells: SheetCell[]
  spritesheet: HTMLImageElement
  cellIndex: number
  constructor(cells: SheetCell[], spritesheet: HTMLImageElement) {
    this.cells = cells
    this.spritesheet = spritesheet
    this.cellIndex = 0
  }

  advance() {
    this.cellIndex = (this.cellIndex + 1) % this.cells.length
  }

  paint(sprite:Sprite, context: CanvasRenderingContext2D) {
    let cell = this.cells[this.cellIndex]
    sprite.width = cell.width
    sprite.height = cell.height
    context.drawImage(this.spritesheet,
      cell.left, cell.top,
      cell.width, cell.height,
      sprite.left, sprite.top,
      cell.width, cell.height)
  }
}

/**
 * 精灵动画制作器
 * SpriteAnimator 包含两个参数，Painter 数组和回调函数。
 */
export class SpriteAnimator {
  painters: Painter[]
  elapsedCallback: Function
  duration: number
  startTime: number
  index: number

  constructor(painters: Painter[], elapsedCallback: Function) {
    this.painters = painters
    this.elapsedCallback = elapsedCallback

    this.duration = 1000
    this.startTime = 0
    this.index = 0
  }

  end(sprite: Sprite, originalPainter: Painter) {
    sprite.animating = false

    if (this.elapsedCallback) {
      this.elapsedCallback(sprite)
    } else {
      sprite.painter = originalPainter
    }
  }

  start(sprite: Sprite, duration: number) {
    let endTime = + new Date() + duration,
      period = duration / (this.painters.length),
      interval: number|null = null,
      originalPainter = sprite.painter

    this.index = 0
    sprite.animating = true
    sprite.painter = this.painters[this.index]

    interval = setInterval(() => {
      if (+new Date() < endTime) {
        this.index += 1
        sprite.painter = this.painters[this.index] || sprite.painter
      } else {
        this.end(sprite, originalPainter);
        clearInterval(interval);
      }
    }, period)
  }
}

/**
 * 精灵
 */
export class Sprite {
  name: string
  painter: Painter
  behaviors: Behavior[]
  left: number
  top: number
  width: number
  height: number
  // 核心区域
  coreWidth: number
  coreHeight: number
  velocityX: number
  velocityY: number
  visible: boolean
  animating: boolean

  constructor(name: string, painter: Painter, behaviors: Behavior[]) {
    this.name = name
    this.painter = painter
    this.behaviors = behaviors

    this.left = 0
    this.top = 0
    this.width = 10
    this.height = 10
    this.velocityX = 0
    this.velocityY = 0
    this.visible = true
    this.animating = false
  }

  paint(context: CanvasRenderingContext2D) {
    if (this.painter && this.visible) {
      this.painter.paint(this, context)
    }
  }

  update(context: CanvasRenderingContext2D, time: number) {
    for (let index = this.behaviors.length; index > 0; index--) {
      this.behaviors[index - 1].execute(this, context, time)
    }
  }
}