import { SheetCell, Behavior } from "../modals";
import Game, {game} from "../Game";
import playerSheet from '../../assets/pl00.png'
import core from '../../assets/core.png'
import { Sprite, SpriteSheetPainter, SpriteAnimator } from "../Sprite";

const normalCells: SheetCell[] = [
  { left: 0,   top: 0, width: 32, height: 48 },
  { left: 32,  top: 0, width: 32, height: 48 },
  { left: 64,  top: 0, width: 32, height: 48 },
  { left: 96,  top: 0, width: 32, height: 48 },
  { left: 128, top: 0, width: 32, height: 48 },
  { left: 160, top: 0, width: 32, height: 48 },
  { left: 192, top: 0, width: 32, height: 48 },
  { left: 224, top: 0, width: 32, height: 48 },
]
const toLeftCells: SheetCell[] = [
  { left: 0,   top: 48, width: 32, height: 48 },
  { left: 32,  top: 48, width: 32, height: 48 },
  { left: 64,  top: 48, width: 32, height: 48 },
  { left: 96,  top: 48, width: 32, height: 48 },
  { left: 128, top: 48, width: 32, height: 48 },
  { left: 160, top: 48, width: 32, height: 48 },
  { left: 192, top: 48, width: 32, height: 48 },
  { left: 224, top: 48, width: 32, height: 48 },
]
const leftCells: SheetCell[] = [
  { left: 224, top: 48, width: 32, height: 48 },
]
const toRightCells: SheetCell[] = [
  { left: 0,   top: 96, width: 32, height: 48 },
  { left: 32,  top: 96, width: 32, height: 48 },
  { left: 64,  top: 96, width: 32, height: 48 },
  { left: 96,  top: 96, width: 32, height: 48 },
  { left: 128, top: 96, width: 32, height: 48 },
  { left: 160, top: 96, width: 32, height: 48 },
  { left: 192, top: 96, width: 32, height: 48 },
  { left: 224, top: 96, width: 32, height: 48 },
]
const rightCells: SheetCell[] = [
  { left: 224, top: 97, width: 32, height: 48 },
]

export class Player extends Sprite {
  toUp: boolean
  toDown: boolean
  toLeft: boolean
  toRight: boolean
  isShield: boolean = false
  shieldTimer: number
  leftCalled: (status: boolean) => void
  rightCalled: (status: boolean) => void
  getShield(duration: number) {
    this.shieldTimer && clearTimeout(this.shieldTimer)

    this.isShield = true
    this.shieldTimer = setTimeout(() => {
      this.isShield = false
      clearTimeout(this.shieldTimer)
    }, duration || 10000);
  }
}

class PlayerSheetPainter extends SpriteSheetPainter {
  paint(sprite: Player, context: CanvasRenderingContext2D) {
    const cell = this.cells[this.cellIndex]

    context.drawImage(this.spritesheet,
      cell.left, cell.top,
      cell.width, cell.height,
      sprite.left, sprite.top,
      cell.width, cell.height)

    const {width, height, top, left, coreWidth, coreHeight, isShield} = sprite
    const [centerX, centerY] = [left + width / 2, top + height / 2]
    context.save()
    context.drawImage(game.getImage(core), centerX - 5, centerY - 5)

    if (isShield) {
      const shieldColor = ['#de5050', '#d07926', '#8ae242', '#38ccad', '#3031cc', '#bf30cc']
      context.strokeStyle = shieldColor[parseInt(Math.random() * (shieldColor.length + 1))]
      context.beginPath()
      context.arc(centerX, centerY, 30, 0, 2 * Math.PI)
      context.closePath()
      context.stroke()
    }
    context.restore()
  }
}

let player: Player = null

// called after game ready
export function getPlayer () {
  if (player) return player

  const normal: Behavior = {
    lastAdvance: 0,
    PAGEFLIP_INTERVAL: 110,
    execute: function (sprite: Player, context: CanvasRenderingContext2D, now: number) {
      if (now - this.lastAdvance > this.PAGEFLIP_INTERVAL &&
        !(sprite.toLeft !== sprite.toRight)) {
          sprite.painter.advance()
          this.lastAdvance = now
      }
    }
  }

  const leftOrRight: Behavior = {
    lastAdvance: 0,
    PAGEFLIP_INTERVAL: 18,
    execute: function (sprite: Player, context: CanvasRenderingContext2D, now: number) {
      if (sprite.toLeft) {
        sprite.left -= game.pixelsPerFrame(now, sprite.velocityX)
      }
      if (sprite.toRight) {
        sprite.left += game.pixelsPerFrame(now, sprite.velocityX)
      }
      if (sprite.toUp) {
        sprite.top -= game.pixelsPerFrame(now, sprite.velocityY)
      }
      if (sprite.toDown) {
        sprite.top += game.pixelsPerFrame(now, sprite.velocityY)
      }
      sprite.left = sprite.left >= game.W - sprite.width ? game.W - sprite.width :
        sprite.left <= 0 ? 0 : sprite.left
      sprite.top = sprite.top >= game.H - sprite.height ? game.H - sprite.height :
        sprite.top <= 0 ? 0 : sprite.top
      if (now - this.lastAdvance > this.PAGEFLIP_INTERVAL &&
        (sprite.toLeft || sprite.toRight)) {
          sprite.painter.advance()
          this.lastAdvance = now
      }
    }
  }

  const playerImage = game.getImage(playerSheet)
  const normalPainter = new PlayerSheetPainter(normalCells, playerImage)

  // 左移绘制器，实现过渡以及保持左移状态
  const toLeftPainter = new PlayerSheetPainter(toLeftCells, playerImage)
  const leftPainter = new PlayerSheetPainter(leftCells, playerImage)
  const leftAnimator = new SpriteAnimator([toLeftPainter], function (sprite: Player) {
    sprite.painter = leftPainter
  })
  const leftReveseAnimator = new SpriteAnimator([
      new PlayerSheetPainter(toLeftCells.slice().reverse(), playerImage)
    ], function (sprite: Player) {
      sprite.painter = sprite.toRight ? rightPainter : normalPainter
    })

  // 右移绘制器，实现过渡以及保持右移状态
  const toRightPainter = new PlayerSheetPainter(toRightCells, playerImage)
  const rightPainter = new PlayerSheetPainter(rightCells, playerImage)
  const rightAnimator = new SpriteAnimator([toRightPainter], function (sprite: Player) {
    sprite.painter = rightPainter
  })
  const rightReveseAnimator = new SpriteAnimator([
      new PlayerSheetPainter(toRightCells.slice().reverse(), playerImage)
    ], function (sprite: Player) {
      sprite.painter = sprite.toLeft ? leftPainter : normalPainter
    })

  player = new Player('player', normalPainter, [normal, leftOrRight])

  // 左移（键）按下和弹起时调用，一次过程中只调用一次
  player.leftCalled = function (status: boolean) {
    if (status) {
      leftAnimator.start(this, leftOrRight.PAGEFLIP_INTERVAL * (toLeftCells.length - 1))
    } else {
      if (this.toRight) {
        this.painter = rightPainter
      } else {
        leftReveseAnimator.start(this, leftOrRight.PAGEFLIP_INTERVAL * (toLeftCells.length - 1))
      }
    }
  }

  player.rightCalled = function (status: boolean) {
    if (status) {
      rightAnimator.start(this, leftOrRight.PAGEFLIP_INTERVAL * (toRightCells.length - 1))
    } else {
      if (this.toLeft) {
        this.painter = leftPainter
      } else {
        rightReveseAnimator.start(this, leftOrRight.PAGEFLIP_INTERVAL * (toRightCells.length - 1))
      }
    }
  }

  // player prop init
  player.width = 32
  player.height = 48
  player.left = (game.W - player.width) / 2
  player.top = game.H - player.height - 50
  player.coreWidth = 10
  player.coreHeight = 10

  player.velocityX = 190
  player.velocityY = 200

  player.toUp = false
  player.toDown = false
  player.toLeft = false
  player.toRight = false

  return player
}