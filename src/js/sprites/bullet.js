import {
  ImagePainter,
  SpriteSheetPainter,
  SpriteAnimator,
  Sprite
} from '../sprites'
import {
  getGUID
} from '../utils'

// 精灵图上的纵横长宽
let cell = { left: 0, top: 147, width: 32, height: 11 }

// create bullet sprite
export default function (game, sheet) {

  let normal = {
    lastAdvance: 0,
    execute: function (sprite, context, now) {
      sprite.top -= game.pixelsPerFrame(now, sprite.velocityY)
      if (sprite.top <= - sprite.height)  sprite.visible = false
    }
  }

  let bulletPainter = new ImagePainter(sheet)
  // 重写 ImagePainter 的 paint 方法
  bulletPainter.paint = function(sprite, context) {
    if (this.image !== undefined) {
      context.save()
      context.rotate(Math.PI / 2)
      if (!this.image.complete) {
        this.image.onload = (e) => {
          context.drawImage(this.image,
            cell.left, cell.top,
            cell.width, cell.height,
            sprite.top, - sprite.left - sprite.width,
            cell.width, cell.height)
          
          context.restore()
        }
      } else {
        context.drawImage(this.image,
          cell.left, cell.top,
          cell.width, cell.height,
          sprite.top, - sprite.left - sprite.width,
          cell.width, cell.height)
        context.restore()
      }
    }
  }

  let bullet = new Sprite('bullet' + getGUID(), bulletPainter, [normal])

  // bullet.visible = false

  bullet.width = cell.height
  bullet.height = cell.width

  bullet.velocityY = 770

  return bullet
}