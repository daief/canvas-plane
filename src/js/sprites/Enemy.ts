import Game, {game} from "../Game";
import enemy1 from '../../assets/enemy1.png'
import { Sprite, SpriteSheetPainter } from "../Sprite";
import { SheetCell, Behavior, Rect } from "../modals";
import { getGUID, is2RectIntersect } from "../utils";
import { eBulletsManager } from "./EBullet";

const cells: SheetCell[] = [
  { left: 0,   top: 0, width: 48, height: 32 },
  { left: 48,  top: 0, width: 48, height: 32 },
  { left: 96,  top: 0, width: 48, height: 32 },
  { left: 144,  top: 0, width: 48, height: 32 },
]

class Enemy extends Sprite {
  bulletList: Sprite[] = []

  fire(time: number) {
    if (this.visible && this.top > 50) {
      const {left, top, width, height} = this
      const b = eBulletsManager.addEnemyBullet(time, [])
      b.left = left + width / 2 - b.width / 2
      b.top = top + b.height + 3
      b.visible = true
      b.velocityY = 100
    }
  }
}

export function getEnemy() {
  const normal: Behavior = {
    lastAdvance: 0,
    PAGEFLIP_INTERVAL: 150,
    execute: function (sprite: Sprite, context: CanvasRenderingContext2D, now: number) {
      if (now - this.lastAdvance > this.PAGEFLIP_INTERVAL) {
        sprite.painter.advance()
        this.lastAdvance = now
      }
    }
  }

  const mv: Behavior = {
    lastAdvance: 0,
    PAGEFLIP_INTERVAL: 0,
    execute: function (sprite: Sprite, context: CanvasRenderingContext2D, now: number) {
      // sprite.left += game.pixelsPerFrame(now, sprite.velocityX)
      sprite.top += game.pixelsPerFrame(now, sprite.velocityY)

      const {left, top} = sprite
      const {W, H} = game
      if (top >= 300) {
        sprite.velocityY = 0
      }
      sprite.left = game.getSprite('player').left
      // if (!is2RectIntersect(<Rect>sprite, {left: 0, top: 0, width: game.W, height: game.H})) {
      //   sprite.velocityX = -sprite.velocityX
      // }
    }
  }

  const fire: Behavior = {
    lastAdvance: 0,
    PAGEFLIP_INTERVAL: 300,
    execute: function (sprite: Enemy, context: CanvasRenderingContext2D, now: number) {
      if (now - this.lastAdvance > this.PAGEFLIP_INTERVAL) {
        sprite.fire(now)
        this.lastAdvance = now
      }
    }
  }

  const enemy = new Enemy(`enemy-${getGUID()}`, new SpriteSheetPainter(cells, game.getImage(enemy1)), [normal, mv, fire])

  enemy.velocityY = 20
  enemy.velocityX = 20

  return enemy
}