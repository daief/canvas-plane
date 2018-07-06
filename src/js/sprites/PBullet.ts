import Game from "../Game";
import { Behavior, Rect } from "../modals";
import { ImagePainter, Sprite } from "../Sprite";
import { getGUID, is2RectIntersect } from "../utils";

// 精灵图上的纵横长宽
const cell = { left: 0, top: 147, width: 32, height: 11 }

class BulletPainter extends ImagePainter {
  paint(sprite: Sprite, context: CanvasRenderingContext2D) {
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
}

export const buildBullet = (game: Game, sheet: string) => {
  const normal: Behavior = {
    lastAdvance: 0,
    PAGEFLIP_INTERVAL: 0,
    execute: function(sprite, context, now) {
      sprite.left += game.pixelsPerFrame(now, sprite.velocityX)
      sprite.top += game.pixelsPerFrame(now, sprite.velocityY)
      if (!is2RectIntersect(<Rect>sprite, {left: 0, top: 0, width: game.W, height: game.H}))  sprite.visible = false
    }
  }

  const bullet = new Sprite(`bullet${getGUID()}`, new BulletPainter(sheet), [normal])

  bullet.width = cell.height
  bullet.height = cell.width

  bullet.velocityY = -770

  return bullet
}

export class PBulletsManager {
  playerBullets: Sprite[]
  FIRE_TIME: number = 55
  FIRE_LAST: number = 0
  game: Game
  sheet: string

  constructor(game: Game, sheet: string) {
    this.game = game
    this.sheet = sheet
    this.playerBullets = []
  }

  getBullet() {
    for (const bullet of this.playerBullets) {
      if (!bullet.visible)
        return bullet
    }
    return null
  }

  addBullet() {
    const b = buildBullet(this.game, this.sheet)
    this.game.addSprite(b)
    this.playerBullets.push(b)
    return b
  }

  addPlayerBullet(time: number) {
    if (time - this.FIRE_LAST <= this.FIRE_TIME) return

    this.FIRE_LAST = time

    // 从引擎中取出两颗闲置bullet精灵，相当于从 playerBullets 中取
    let p = this.game.getSprite('player')
    let b = this.getBullet() || this.addBullet()
    b.left = p.left
    b.top = p.top - b.height
    b.visible = true

    b = this.getBullet() || this.addBullet()
    b.left = p.left + p.width - b.width
    b.top = p.top - b.height
    b.visible = true
  }
}

let manager: PBulletsManager = null
export default (game: Game, sheet: string) => {
  if (manager) return manager
  else {
    manager = new PBulletsManager(game, sheet)
    return manager
  }
}