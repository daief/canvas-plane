import 'babel-polyfill'
import './index.css'
import Game from './js/gameEngine'
import playerSheet from './assets/pl00.png'
import {
  ImagePainter,
  SpriteSheetPainter,
  SpriteAnimator,
  Sprite
} from './js/sprites'
import Runner from './js/sprites/player'
import Bullet from './js/sprites/bullet'

let game = new Game('project', 'canvas')
let playerBullets = [],
  FIRE_TIME = 55,
  FIRE_LAST = 0,
  getBullet = function () {
    for (const bullet of playerBullets) {
      if (!bullet.visible)
        return bullet  
    }
    return null
  },
  addBullet = function () {
    let b = Bullet(game, playerSheet)
    game.addSprite(b)
    playerBullets.push(b)
    return b
  }


game.queueImage(playerSheet)

game.startAnimate = function (time) {
  // 添加 bullet
  addPlayerBullet(time)
}

game.paintUnderSprites = function () {
  // 可见精灵数
  let visibleSprites = 0
  for (const s of this.sprites) {
    visibleSprites += s.visible
  }
  this.context.fillText(`fps: ${parseInt(this.fps)} sprites: ${visibleSprites}/${this.sprites.length}  ${parseInt(this.gameTime / 1000)}`, 5, 15)
}

function addPlayerBullet(time) {
  if (time - FIRE_LAST <= FIRE_TIME) return;
  
  FIRE_LAST = time  
  // 从引擎中取出两颗闲置bullet精灵，相当于从 playerBullets 中取
  let p = game.getSprite('player')
  let b = getBullet() || addBullet()
  b.left = p.left
  b.top = p.top - b.height
  b.visible = true

  b = getBullet() || addBullet()
  b.left = p.left + p.width - b.width
  b.top = p.top - b.height
  b.visible = true
}


let loadingInterval = setInterval(() => {
  if (game.loadImages() >= 100) {
    clearInterval(loadingInterval)

    init()
    
    game.start()
  }
}, 30)

function init() {
  game.addSprite(Runner(game, playerSheet))

  let player = game.getSprite('player')

  addKeyListeners(game, player)
}

/**
 * 添加事件监听
 * @param {*} game 
 * @param {*} player 
 */
function addKeyListeners(game, player) {
  game.addKeyListener({
    key: 'left arrow',
    listener: (e, status) => {
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
    listener: (e, status) => {
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
    listener: (e, status) => {
      player.toDown = status
    }
  })
  
  game.addKeyListener({
    key: 'up arrow',
    listener: (e, status) => {
      player.toUp = status
    }
  })
}
