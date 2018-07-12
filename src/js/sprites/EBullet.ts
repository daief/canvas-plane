import {game} from "../Game";
import bullet3 from '../../assets/bullet3.png'
import { Sprite, ImagePainter } from "../Sprite";
import { Behavior, Rect } from "../modals";
import { is2RectIntersect, getGUID } from "../utils";

const cell = { left: 40, top: 72, width: 16, height: 16 }

class BulletPainter extends ImagePainter {
  paint(sprite: Sprite, context: CanvasRenderingContext2D) {
    if (this.image !== undefined) {
      if (!this.image.complete) {
        this.image.onload = (e) => {
          context.drawImage(this.image,
            cell.left, cell.top,
            cell.width, cell.height,
            sprite.left, sprite.top,
            cell.width, cell.height)
        }
      } else {
        context.drawImage(this.image,
          cell.left, cell.top,
          cell.width, cell.height,
          sprite.left, sprite.top,
          cell.width, cell.height)
      }
    }
  }
}

const normal: Behavior = {
  lastAdvance: 0,
  PAGEFLIP_INTERVAL: 0,
  execute: function(sprite, context, now) {
    sprite.left += game.pixelsPerFrame(now, sprite.velocityX)
    sprite.top += game.pixelsPerFrame(now, sprite.velocityY)
    if (!is2RectIntersect(<Rect>sprite, game.getRect())) sprite.visible = false
  }
}

class EBulletsManager {
  addEnemyBullet(behaviors: Behavior[]) {
    const b = new Sprite(`eBullet-${getGUID()}`, new BulletPainter(bullet3), [normal, ...behaviors])
    game.setFreeSpriteNew(b)
    return b
  }

  getEnemyBulletList(): Sprite[] {
    return game.sprites.filter((s: Sprite) => {
      return s.visible && s.name.startsWith('eBullet')
    })
  }
}

export const eBulletsManager = new EBulletsManager()
