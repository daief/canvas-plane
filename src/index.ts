import './index.css'
import Game from './js/Game'
import playerSheet from './assets/pl00.png'
import bullets1 from './assets/bullets1.png'
import core from './assets/core.png'
import getPlayer, { Player } from './js/sprites/Player'
import { PBulletsManager } from './js/sprites/PBullet';

const game = new Game('project', 'canvas')
const pBulletManager = new PBulletsManager(game, bullets1)

game.startAnimate = function (time) {
  // 添加 bullet
  pBulletManager.addPlayerBullet(time)
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

function init() {
  game.addSprite(getPlayer(game))

  const player = <Player> game.getSprite('player')

  addKeyListeners(game, player)
}

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

game.queueImage(playerSheet)
game.queueImage(bullets1)
game.queueImage(core)

let loadingInterval = setInterval(() => {
  if (game.loadImages() >= 100) {
    clearInterval(loadingInterval)

    init()

    game.start()
  }
}, 30)

