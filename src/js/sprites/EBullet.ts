import Game, {game} from "../Game";
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
    if (!is2RectIntersect(<Rect>sprite, {left: 0, top: 0, width: game.W, height: game.H}))  sprite.visible = false
  }
}

const buildBullet = (game: Game, sheet: string) => {
  const bullet = new Sprite(`eBullet-${getGUID()}`, new BulletPainter(sheet), [normal])

  bullet.width = cell.width
  bullet.height = cell.height

  bullet.velocityY = -770

  return bullet
}

class EBulletsManager {
  enemyBulletList: Sprite[]

  constructor() {
    this.enemyBulletList = []
  }

  private getBullet() {
    for (const bullet of this.enemyBulletList) {
      if (!bullet.visible)
        return bullet
    }
    return null
  }

  private addBullet() {
    const b = buildBullet(game, bullet3)
    game.addSprite(b)
    this.enemyBulletList.push(b)
    return b
  }

  addEnemyBullet(behaviors: Behavior[]) {
    const b = this.getBullet() || this.addBullet()
    b.behaviors = [normal, ...behaviors]
    return b
  }
}

export const eBulletsManager = new EBulletsManager()
console.log(eBulletsManager)
