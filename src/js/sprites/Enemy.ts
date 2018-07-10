import Game, {game} from "../Game";
import enemy1 from '../../assets/enemy1.png'
import { Sprite, SpriteSheetPainter, SpriteAnimator } from "../Sprite";
import { SheetCell, Behavior, Rect } from "../modals";
import { getGUID, is2RectIntersect, getVelocityByLenPoint2Player } from "../utils";
import { eBulletsManager } from "./EBullet";
import { Player } from "./Player";
import { showBlast } from "./Blast";

const cells: SheetCell[] = [
  { left: 0,   top: 0, width: 48, height: 32 },
  { left: 48,  top: 0, width: 48, height: 32 },
  { left: 96,  top: 0, width: 48, height: 32 },
  { left: 144,  top: 0, width: 48, height: 32 },
]

export class Enemy extends Sprite {
  hp: number = 100
  score: number = 1

  // 普通自瞄弹
  fire(time: number, speed: number = 150) {
    if (this.visible) {
      const player = <Player>game.getSprite('player')
      const core = player.getCenterPoint()
      const {left, top, width, height} = this
      const b = eBulletsManager.addEnemyBullet([])
      b.left = left + width / 2 - b.width / 2
      b.top = top + b.height + 3
      b.visible = true
      const v = getVelocityByLenPoint2Player(b.left, b.top, core.left, core.top, speed)
      b.velocityX = v.x
      b.velocityY = v.y
    }
  }

  beHit() {
    const player = <Player>game.getSprite('player')
    const {attack} = player
    this.hp -= attack
    if (this.hp <= 0) {
      game.score += this.score
      this.visible = false
      showBlast(this)
    }
  }
}

export function getEnemy(behaviors: Behavior[] = []) {
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

  // const fire: Behavior = {
  //   lastAdvance: 0,
  //   PAGEFLIP_INTERVAL: 400,
  //   execute: function (sprite: Enemy, context: CanvasRenderingContext2D, now: number) {
  //     if (now - this.lastAdvance > this.PAGEFLIP_INTERVAL) {
  //       sprite.fire(now)
  //       this.lastAdvance = now
  //     }
  //   }
  // }

  const enemy = new Enemy(`enemy-${getGUID()}`, new SpriteSheetPainter(cells, game.getImage(enemy1)), [normal, ...behaviors])

  enemy.velocityY = 20
  enemy.velocityX = 40
  enemy.width = 48
  enemy.height = 32

  return enemy
}