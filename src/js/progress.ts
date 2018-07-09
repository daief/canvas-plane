import Game, { game } from './Game'
import playerSheet from '../assets/pl00.png'
import bullets1 from '../assets/bullets1.png'
import bullet3 from '../assets/bullet3.png'
import enemy1 from '../assets/enemy1.png'
import core from '../assets/core.png'
import bg1 from '../assets/bg1.png'
import {Player, getPlayer} from './sprites/Player'
import { pBulletsManager } from './sprites/PBullet'
import {getEnemy, Enemy} from './sprites/Enemy'
import { eBulletsManager } from './sprites/EBullet';
import { is2RectIntersect } from './utils';
import { Rect } from './modals';
import { Sprite } from './Sprite';
import { stageControl } from './StageControl';

let bgOffset = 0
const bgSpeed = 80
game.startAnimate = function (time) {
  // bg
  const bgImg = game.getImage(bg1)
  game.context.drawImage(bgImg, 0, bgOffset - 512)
  game.context.drawImage(bgImg, 0, 0 + bgOffset)
  game.context.drawImage(bgImg, 0, bgOffset + 512)
  bgOffset += game.pixelsPerFrame(time, bgSpeed)
  bgOffset = bgOffset > 512 ? 0 : bgOffset


  // 添加 bullet
  pBulletsManager.addPlayerBullet(time)

  stageControl.display(time)
}

game.paintUnderSprites = function () {
  // 可见精灵数
  let visibleSprites = 0
  for (const s of game.sprites) {
    visibleSprites += +s.visible
  }
  const {context, fps, sprites, gameTime, score} = game
  context.save()
  context.fillStyle = '#fff'
  context.fillText(`fps: ${parseInt(fps.toString())} sprites: ${
    visibleSprites}/${sprites.length}  time: ${
      parseInt((gameTime / 1000).toString())} score: ${score}`, 5, 15)
  context.restore()
}

game.paintOverSprites = function() {
  const player = <Player>game.getSprite('player')
  const pCore = player.getCoreRect()

  for (const bullet of eBulletsManager.enemyBulletList) {
    if (bullet.visible
      && is2RectIntersect(bullet.getCoreRect(), pCore)) {
        bullet.visible = false
        // 击中玩家
    }
  }

  for (let i = 0; i < stageControl.enemyLists.length; i++) {
    const enemy = <Enemy>stageControl.enemyLists[i]

    if (is2RectIntersect(enemy.getCoreRect(), pCore)) {
      // 玩家与敌机相撞

    }

    for (let j = 0; j < pBulletsManager.playerBullets.length; j++) {
      const pBullet = pBulletsManager.playerBullets[j]
      if (enemy.visible && pBullet.visible && is2RectIntersect(enemy.getCoreRect(), pBullet.getCoreRect())) {
        // 击中敌军
        enemy.hp -= player.attack
        if (enemy.hp <= 0) {
          enemy.visible = false
          game.score += enemy.score
        }
        pBullet.visible = false
      }
    }
  }
}

game.queueImage(playerSheet)
game.queueImage(bullets1)
game.queueImage(core)
game.queueImage(enemy1)
game.queueImage(bg1)
game.queueImage(bullet3)

/**
 * 添加事件监听
 * @param {*} game
 * @param {*} player
 */
function addKeyListeners(game: Game, player: Player) {
  game.addKeyListener({
    key: 'left arrow',
    listener: (e: KeyboardEvent, status: boolean) => {
      if (status && !player.toLeft) {
        // 第一次按下时，触发一下
        player.leftCalled(true)
      } else if (!status && player.toLeft) {
        // 弹起的时候，触发一下
        player.leftCalled(false)
      }
      player.toLeft = status
    }
  })

  game.addKeyListener({
    key: 'right arrow',
    listener: (e: KeyboardEvent, status: boolean) => {
      if (status && !player.toRight) {
        player.rightCalled(true)
      } else if (!status && player.toRight) {
        player.rightCalled(false)
      }
      player.toRight = status
    }
  })

  game.addKeyListener({
    key: 'down arrow',
    listener: (e: KeyboardEvent, status: boolean) => {
      player.toDown = status
    }
  })

  game.addKeyListener({
    key: 'up arrow',
    listener: (e: KeyboardEvent, status: boolean) => {
      player.toUp = status
    },
  })

  game.addKeyListener({
    key: 'shift',
    listener: (e: KeyboardEvent, status: boolean) => {
      player.setVelocitySlow(status)
    },
  })

  game.addKeyListener({
    key: 'p',
    listener: (e: KeyboardEvent, status: boolean) => {
      if (!status) game.togglePaused()
    }
  })
}

export default () => {
  let loadingInterval = setInterval(() => {
    if (game.loadImages() >= 100) {
      clearInterval(loadingInterval)

      const player = getPlayer()
      game.addSprite(player)

      addKeyListeners(game, player)

      game.start()
    }
  }, 30)
  console.log(game)
}