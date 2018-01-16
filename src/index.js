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

let game = new Game('project', 'canvas')

game.queueImage(playerSheet)

game.paintUnderSprites = function() {
  this.context.fillText(`fps: ${parseInt(this.fps)}`, 5, 15)
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
