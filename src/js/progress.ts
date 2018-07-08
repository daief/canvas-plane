import Game, { game } from './Game'
import playerSheet from '../assets/pl00.png'
import bullets1 from '../assets/bullets1.png'
import enemy1 from '../assets/enemy1.png'
import core from '../assets/core.png'
import {Player, getPlayer} from './sprites/Player'
import { pBulletsManager } from './sprites/PBullet'
import {getEnemy} from './sprites/Enemy'
import { eBulletsManager } from './sprites/EBullet';
import { is2RectIntersect } from './utils';
import { Rect } from './modals';
import { Sprite } from './Sprite';
import { stageControl } from './sprites/StageControl';

let enemyList: Sprite[] = []
let lastEnemyTime = 0

game.startAnimate = function (time) {
  // 添加 bullet
  pBulletsManager.addPlayerBullet(time)

  stageControl.display(time)
}

game.paintUnderSprites = function () {
  // 可见精灵数
  let visibleSprites = 0
  for (const s of this.sprites) {
    visibleSprites += s.visible
  }
  this.context.fillText(`fps: ${parseInt(this.fps)} sprites: ${
    visibleSprites}/${this.sprites.length}  ${
      parseInt((this.gameTime / 1000).toString())}`, 5, 15)
}

game.paintOverSprites = function() {
  const list = eBulletsManager.enemyBulletList
  for (const bullet of list) {
    if (bullet.visible
      && is2RectIntersect(bullet.getCoreRect(), game.getSprite('player').getCoreRect())) {
        bullet.visible = false
    }
  }
}

game.queueImage(playerSheet)
game.queueImage(bullets1)
game.queueImage(core)
game.queueImage(enemy1)

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