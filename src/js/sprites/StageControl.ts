import { Sprite } from "../Sprite";
import { game } from "../Game";
import { getEnemy, Enemy } from "./Enemy";
import { Behavior } from "../modals";
import { is2RectIntersect } from "../utils";

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
    const setFire = function() {

    }
    if (game.score < 10 && time - this.lastTime >= 1000 && this.getVisibleEnemyNum() < 2) {
      const e = getEnemy([normalMove, {...b1}])
      const rs = game.setFreeSpriteNew(e)
      this.addToList(rs, e)
      e.left = 100
      e.top = 0
      e.velocityX = 0
      e.velocityY = 50
      e.visible = true

      const e2 = getEnemy([normalMove, {...b1}])
      const rs2 = game.setFreeSpriteNew(e2)
      this.addToList(rs2, e2)
      e2.left = game.W - 100 - e2.width
      e2.top = 0
      e2.velocityX = 0
      e2.velocityY = 50
      e2.visible = true


      this.lastTime = time
    }
  }
}

export const stageControl = new StageControl()
console.log(stageControl)
