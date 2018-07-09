import Game, {game} from "../Game";
import { Behavior, Rect } from "../modals";
import { ImagePainter, Sprite } from "../Sprite";
import { getGUID, is2RectIntersect, getVAngle } from "../utils";
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

const buildBullet = (game: Game, sheet: string) => {
  const normal: Behavior = {
    lastAdvance: 0,
    PAGEFLIP_INTERVAL: 0,
    execute: function(sprite, context, now) {
      sprite.left += game.pixelsPerFrame(now, sprite.velocityX)
      sprite.top += game.pixelsPerFrame(now, sprite.velocityY)
      if (!is2RectIntersect(<Rect>sprite, {left: 0, top: 0, width: game.W, height: game.H}))  sprite.visible = false
    }
  }

  const bullet = new Sprite(`pBullet-${getGUID()}`, new BulletPainter(sheet), [normal])

  bullet.width = cell.width
  bullet.height = cell.height

  bullet.velocityY = -770

  return bullet
}

export class PBulletsManager {
  playerBullets: Sprite[]
  FIRE_TIME: number = 165
  FIRE_LAST: number = 0

  constructor() {
    this.playerBullets = []
  }

  getBullet() {
    for (const bullet of this.playerBullets) {
      if (!bullet.visible)
        return bullet
    }
    return null
  }

  private addBullet() {
    const b = buildBullet(game, bullets1)
    game.addSprite(b)
    this.playerBullets.push(b)
    return b
  }

  addPlayerBullet(time: number) {
    const player = game.getSprite('player')
    if (time - this.FIRE_LAST <= this.FIRE_TIME || !player.visible) return

    this.FIRE_LAST = time

    // 从引擎中取出两颗闲置bullet精灵，相当于从 playerBullets 中取
    let p = game.getSprite('player')
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

export const pBulletsManager = new PBulletsManager()
