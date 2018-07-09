import { Sprite } from "./Sprite";
import { game } from "./Game";
import { getEnemy, Enemy } from "./sprites/Enemy";
import { Behavior } from "./modals";
import { is2RectIntersect, getVelocityByLenPoint2Player } from "./utils";

const normalMove: Behavior = {
  execute: function (sprite: Sprite, context: CanvasRenderingContext2D, now: number) {
    sprite.left += game.pixelsPerFrame(now, sprite.velocityX)
    sprite.top += game.pixelsPerFrame(now, sprite.velocityY)

    if (!is2RectIntersect(sprite.getCoreRect(), game.getRect())) {
      sprite.visible = false
    }
  }
}

class StageControl {
  enemyLists: Sprite[] = []
  lastTime: number = 0

  private addToList(old: Sprite, newS: Sprite) {
    const i = this.enemyLists.findIndex(v => v === old)
    if (i === -1) {
      this.enemyLists.push(newS)
    } else {
      this.enemyLists[i] = newS
    }
  }

  private getVisibleEnemyNum() {
    return this.enemyLists.filter(v => v.visible).length
  }

  display(time: number) {
    if (game.score >= 0) {
      return this.stage1(time)
    }
  }

  stage1(time: number) {
    const player = game.getSprite('player')

    if (game.score < 4 && time - this.lastTime >= 1000 && this.getVisibleEnemyNum() === 0) {
      const b1: Behavior = {
        lastAdvance: 0,
        PAGEFLIP_INTERVAL: 600,
        execute: function (sprite: Enemy, context: CanvasRenderingContext2D, now: number) {
          if (sprite.top >= 150) sprite.velocityY = 0
          if (now - this.lastAdvance > this.PAGEFLIP_INTERVAL && sprite.top >= 150) {
            sprite.fire(now)
            this.lastAdvance = now
          }
        }
      }

      const e = getEnemy([normalMove, {...b1}])
      const rs = game.setFreeSpriteNew(e)
      this.addToList(rs, e)
      e.hp = 350
      e.left = 100
      e.top = 0
      e.velocityX = 0
      e.velocityY = 80
      e.visible = true

      const e2 = getEnemy([normalMove, {...b1}])
      const rs2 = game.setFreeSpriteNew(e2)
      this.addToList(rs2, e2)
      e.hp = 350
      e2.left = game.W - 100 - e2.width
      e2.top = 0
      e2.velocityX = 0
      e2.velocityY = 80
      e2.visible = true

      this.lastTime = time
      return
    }
    if (game.score >= 4 && time - this.lastTime >= 2000 && this.getVisibleEnemyNum() < 4) {
      const behavior1: Behavior = {
        lastAdvance: 0,
        PAGEFLIP_INTERVAL: 1300,
        execute: function (sprite: Enemy, context: CanvasRenderingContext2D, now: number) {
          if (now - this.lastAdvance > this.PAGEFLIP_INTERVAL && game.H - sprite.top > 100) {
            sprite.fire(now)
            this.lastAdvance = now
          }
        }
      }

      const e = getEnemy([normalMove, {...behavior1}])
      const rs = game.setFreeSpriteNew(e)
      const pArr = [{x: 100, y: 0},{x: 0, y: 70},{x: 0, y: 130},{x: 200, y: 0},{x: 300, y: 0},{x: 500, y: 100},]
      const position = pArr[parseInt((Math.random() * pArr.length).toString())]
      this.addToList(rs, e)
      e.hp = 61
      e.left = position.x
      e.top = position.y
      const v = getVelocityByLenPoint2Player(e.left, e.top, player.left, player.top, 80)
      e.velocityX = v.x
      e.velocityY = v.y
      e.visible = true

      this.lastTime = time
    }
  }
}

export const stageControl = new StageControl()
console.log(stageControl)
