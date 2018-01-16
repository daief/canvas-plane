/**
 * 图像绘制器
 */
class ImagePainter {
  constructor(imageUrl) {
    this.image = new Image()
    this.image.src = imageUrl
  }

  paint(sprite, context) {
    if (this.image !== undefined) {
      if (!this.image.complete) {
        this.image.onload = (e) => {
          sprite.width = this.width
          sprite.height = this.height

          context.drawImage(e.target,
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
class SpriteSheetPainter {
  constructor(cells, spritesheet) {
    this.cells = cells
    this.spritesheet = spritesheet
    this.cellIndex = 0
  }

  advance() {
    this.cellIndex = (this.cellIndex + 1) % this.cells.length
  }

  paint(sprite, context) {
    let cell = this.cells[this.cellIndex]
    sprite.width = cell.width
    sprite.height = cell.height
    context.drawImage(this.spritesheet,
      cell.left, cell.top,
      cell.width, cell.height,
      sprite.left, sprite.top,
      cell.width, cell.height);
  }
}

/**
 * 精灵动画制作器
 * SpriteAnimator 包含两个参数，Painter 数组和回调函数。
 */
class SpriteAnimator {
  constructor(painters, elapsedCallback) {
    this.painters = painters
    this.elapsedCallback = elapsedCallback
    
    this.duration = 1000
    this.startTime = 0
    this.index = 0
  }

  end(sprite, originalPainter) {
    sprite.animating = false

    if (this.elapsedCallback) {
      this.elapsedCallback(sprite)
    } else {
      sprite.painter = originalPainter
    }
  }

  start(sprite, duration) {
    let endTime = + new Date() + duration,
      period = duration / (this.painters.length),
      interval = null,
      originalPainter = sprite.painter
    
    this.index = 0
    sprite.animating = true
    sprite.painter = this.painters[this.index]

    interval = setInterval(() => {
      if (+new Date() < endTime) {
        sprite.painter = this.painters[++this.index];
      }
      else {
        this.end(sprite, originalPainter);
        clearInterval(interval);
      }
    }, period)
  }
}

/**
 * 精灵
 */
class Sprite {
  constructor(name, painter, behaviors = []) {
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

  paint(context) {
    if (this.painter && this.visible) {
      this.painter.paint(this, context)
    }
  }

  update(context, time) {
    for (let index = this.behaviors.length; index > 0; index--) {
      this.behaviors[index - 1].execute(this, context, time)
    }
  }
}

export {
  ImagePainter,
  SpriteSheetPainter,
  SpriteAnimator,
  Sprite
}