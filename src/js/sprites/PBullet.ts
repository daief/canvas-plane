import {game} from "../Game";
import { Behavior, Rect } from "../modals";
import { ImagePainter, Sprite } from "../Sprite";
import { getGUID, is2RectIntersect } from "../utils";
import bullets1 from '../../assets/bullets1.png'

// 精灵图上的纵横长宽
const cell = { left: 1, top: 1, width: 6, height: 28 }

class BulletPainter extends ImagePainter {
  paint(sprite: Sprite, context: CanvasRenderingContext2D) {
    if (this.image !== undefined) {
      if (!this.image.complete) {
        this.image.onload = (e) => {
          context.drawImage(this.image,
            cell.left, cell.top,
            cell.width * 2, cell.height * 2,
            sprite.left, sprite.top,
            cell.width, cell.height)
        }
      } else {
        context.drawImage(this.image,
          cell.left, cell.top,
          cell.width * 2, cell.height * 2,
          sprite.left, sprite.top,
          cell.width, cell.height)
      }
    }
  }
}

export class PBulletsManager {
  FIRE_TIME: number = 165
  FIRE_LAST: number = 0

  addPlayerBullet(time: number) {
    const player = game.getSprite('player')
    if (time - this.FIRE_LAST <= this.FIRE_TIME || !player.visible) return

    this.FIRE_LAST = time

    const normal: Behavior = {
      lastAdvance: 0,
      PAGEFLIP_INTERVAL: 0,
      execute: function(sprite, context, now) {
        sprite.left += game.pixelsPerFrame(now, sprite.velocityX)
        sprite.top += game.pixelsPerFrame(now, sprite.velocityY)
        if (!is2RectIntersect(<Rect>sprite, {left: 0, top: 0, width: game.W, height: game.H}))  sprite.visible = false
      }
    }

    // 从引擎中取出两颗闲置bullet精灵，相当于从 playerBullets 中取
    let p = game.getSprite('player')
    const b = new Sprite(`pBullet-${getGUID()}`, new BulletPainter(bullets1), [{...normal}])
    b.left = p.left
    b.top = p.top - b.height
    b.velocityY = -770
    b.visible = true

    const b1 = new Sprite(`pBullet-${getGUID()}`, new BulletPainter(bullets1), [{...normal}])
    b1.left = p.left + p.width - b1.width
    b1.top = p.top - b1.height
    b1.velocityY = -770
    b1.visible = true

    game.setFreeSpriteNew(b)
    game.setFreeSpriteNew(b1)
  }

  getPlayerBulletList(): Sprite[] {
    return game.sprites.filter((s: Sprite) => {
      return s.visible && s.name.startsWith('pBullet')
    })
  }
}

export const pBulletsManager = new PBulletsManager()
