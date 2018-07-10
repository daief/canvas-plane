import { Sprite } from "./Sprite";
import { game } from "./Game";
import { getEnemy, Enemy } from "./sprites/Enemy";
import { Behavior, Point } from "./modals";
import { is2RectIntersect, getVelocityByLenPoint2Player, delay, angle2radian } from "./utils";
import { eBulletsManager } from "./sprites/EBullet";

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
    const {score} = game

    if (score < 4 && time - this.lastTime >= 1000 && this.getVisibleEnemyNum() === 0) {
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
      e2.hp = 350
      e2.left = game.W - 100 - e2.width
      e2.top = 0
      e2.velocityX = 0
      e2.velocityY = 80
      e2.visible = true

      this.lastTime = time
      return
    }
    if (4 <= score && score < 10 && time - this.lastTime >= 2000 && this.getVisibleEnemyNum() < 4) {
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
      return
    }
    if (10 <= score && score < 1e5 && time - this.lastTime >= 4000 && this.getVisibleEnemyNum() < 1) {
      const ABS_VElOCITY_X = 90
      const BOSS_HP = 1000
      const FIRE2_INTERVAL = 45
      const ß = 15
      const rv = 70
      const size = 360 / ß * 4

      const fire2 = async (sprite: Enemy, time: number) => {
        if (sprite.visible) {
          const {left, top, width, height} = sprite
          const fire2List: Sprite[] = []

          for (let index = 0; index < size; index++) {
            await delay((i: number) => {
              const r = rv * (parseInt((ß * i / 360).toString()) + 1)
              const d = ß * i
              const b = eBulletsManager.addEnemyBullet([])
              b.left = left + width / 2 + r * Math.cos(d / 180 * Math.PI) - b.width / 2
              b.top = top + height / 2 + r * Math.sin(d / 180 * Math.PI) - b.height / 2
              b.velocityX = 0
              b.velocityY = 0
              b.visible = true
              fire2List[i] = b
            }, FIRE2_INTERVAL, index)
          }

          for (let index = 0; index < size; index++) {
            const b = fire2List[index]
            const bSpeed = 120
            const rad = angle2radian(ß * index)
            b.velocityX = bSpeed * Math.cos(rad)
            b.velocityY = bSpeed * Math.sin(rad)
          }
        }
      }

      const behavior1: Behavior = {
        lastAdvance: 0,
        PAGEFLIP_INTERVAL: 750,
        execute: function (sprite: Enemy, context: CanvasRenderingContext2D, now: number) {
          if (now - this.lastAdvance > this.PAGEFLIP_INTERVAL && sprite.top > 20) {
            sprite.fire(now, 230)
            this.lastAdvance = now
          }
        }
      }

      const behavior2: Behavior = {
        lastAdvance: 0,
        PAGEFLIP_INTERVAL: 0,
        execute: function (sprite: Enemy, context: CanvasRenderingContext2D, now: number) {
          if (sprite.top >= 130 && sprite.velocityY > 0) {
            sprite.velocityY = 0
            sprite.velocityX = ABS_VElOCITY_X
          }
          if (sprite.left >= game.W - 100 && sprite.velocityX > 0) {
            sprite.velocityX = 0
            delay(() => {
              sprite.velocityX = -ABS_VElOCITY_X
            }, (Math.random() * 3 + 2) * 1000)
          }
          if (sprite.left <= 100 - sprite.width && sprite.velocityX < 0) {
            sprite.velocityX = 0
            delay(() => {
              sprite.velocityX = ABS_VElOCITY_X
            }, (Math.random() * 3 + 2) * 1000)
          }
        }
      }

      const behavior3: Behavior = {
        lastAdvance: 0,
        // cd
        PAGEFLIP_INTERVAL: 13 * 1000,
        execute: function (sprite: Enemy, context: CanvasRenderingContext2D, now: number) {
          // 到达水平中央时 fire2
          const center: Point = sprite.getCenterPoint()
          if (sprite.velocityY === 0 && sprite.velocityX !== 0
            && now - this.lastAdvance > this.PAGEFLIP_INTERVAL
            && (game.W / 2 - 10 < center.left && center.left < game.W / 2 + 10)) {
            sprite.velocityX = 0
            fire2(sprite, now)
            delay(() => {
              const direction = [-1, 1]
              sprite.velocityX = ABS_VElOCITY_X * direction[parseInt((Math.random() * direction.length).toString())]
              this.lastAdvance = now
            }, size * FIRE2_INTERVAL)
          }
        }
      }

      const boss = getEnemy([normalMove, behavior1, behavior2, {...behavior3}])
      const rs = game.setFreeSpriteNew(boss)
      this.addToList(rs, boss)
      boss.hp = BOSS_HP
      boss.score = 10
      boss.left = (game.W - boss.width) / 2
      boss.top = 0
      boss.velocityX = 0
      boss.velocityY = 80
      boss.visible = true

      this.lastTime = time
      return
    }
  }
}

export const stageControl = new StageControl()
console.log(stageControl)
