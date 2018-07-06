import { SheetCell, Behavior } from "../modals";
import Game from "../Game";
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
  leftCalled: (status: boolean) => void
  rightCalled: (status: boolean) => void
}

let player: Player = null

export default (game: Game, playerSheet: string) => {
  if (player) return player

  const normal: Behavior = {
    lastAdvance: 0,
    PAGEFLIP_INTERVAL: 95,
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
  const normalPainter = new SpriteSheetPainter(normalCells, playerImage)

  // 左移绘制器，实现过渡以及保持左移状态
  const toLeftPainter = new SpriteSheetPainter(toLeftCells, playerImage)
  const leftPainter = new SpriteSheetPainter(leftCells, playerImage)
  const leftAnimator = new SpriteAnimator([toLeftPainter], function (sprite: Player) {
    sprite.painter = leftPainter
  })
  const leftReveseAnimator = new SpriteAnimator([
      new SpriteSheetPainter(toLeftCells.slice().reverse(), playerImage)
    ], function (sprite: Player) {
      sprite.painter = sprite.toRight ? rightPainter : normalPainter
    })

  // 右移绘制器，实现过渡以及保持右移状态
  const toRightPainter = new SpriteSheetPainter(toRightCells, playerImage)
  const rightPainter = new SpriteSheetPainter(rightCells, playerImage)
  const rightAnimator = new SpriteAnimator([toRightPainter], function (sprite: Player) {
    sprite.painter = rightPainter
  })
  const rightReveseAnimator = new SpriteAnimator([
      new SpriteSheetPainter(toRightCells.slice().reverse(), playerImage)
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
  player.left = (game.W - player.width) / 2
  player.top = game.H - player.height - 50
  player.width = 32
  player.height = 48

  player.velocityX = 190
  player.velocityY = 200

  player.toUp = false
  player.toDown = false
  player.toLeft = false
  player.toRight = false

  return player
}