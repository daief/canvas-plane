import { SheetCell, Behavior, Rect, Point } from "../modals";
import bullet3 from '../../assets/bullet3.png'
import { Sprite, SpriteSheetPainter } from "../Sprite";
import { game } from "../Game";
import { is2RectIntersect, getGUID } from "../utils";
import { Player } from "./Player";

const powerSmallCell: SheetCell = {
  left: 0, top: 96, width: 16, height: 16,
}
const pointSmallCell: SheetCell = {
  left: 16, top: 96, width: 16, height: 16,
}
const powerBigCell: SheetCell = {
  left: 32, top: 96, width: 16, height: 16,
}
const pointBigCell: SheetCell = {
  left: 0, top: 96, width: 16, height: 16,
}
const EFFECT_TYPE_SCORE = 'score'
const EFFECT_TYPE_ATTACK = 'attack'
const BONUS_TYPES = [
  {
    type: EFFECT_TYPE_SCORE,
    num: 3,
    cell: pointSmallCell,
  },
  {
    type: EFFECT_TYPE_SCORE,
    num: 5,
    cell: pointBigCell,
  },
  {
    type: EFFECT_TYPE_ATTACK,
    num: 3,
    cell: powerSmallCell,
  },
  {
    type: EFFECT_TYPE_ATTACK,
    num: 5,
    cell: powerBigCell,
  }
]

export class Bonus extends Sprite {
  BOUNS_TYPE: any

  effect() {
    const player = <Player>game.getSprite('player')
    const {type, num} = this.BOUNS_TYPE
    switch(type) {
      case EFFECT_TYPE_ATTACK:
        player.attack += num
        break
      case EFFECT_TYPE_SCORE:
        game.score += num
        break
    }
  }
}

export function randomBonus(position: Rect) {
  if (Math.random() * 100 > 70) {
    // 30% 无奖励
    return
  }
  const randomResult = BONUS_TYPES[parseInt((Math.random() * BONUS_TYPES.length).toString())]

  const normal: Behavior = {
    lastAdvance: 0,
    PAGEFLIP_INTERVAL: 0,
    execute: function (sprite: Sprite, context: CanvasRenderingContext2D, now: number) {
      sprite.left += game.pixelsPerFrame(now, sprite.velocityX)
      sprite.top += game.pixelsPerFrame(now, sprite.velocityY)
      if (!is2RectIntersect(<Rect>sprite, game.getRect())) sprite.visible = false
    }
  }
  const bounsSprite = new Bonus(`bonus-${getGUID()}`, new SpriteSheetPainter([randomResult.cell], game.getImage(bullet3)), [normal])
  const {left, top, width, height} = position
  bounsSprite.BOUNS_TYPE = randomResult
  bounsSprite.left = left + (width - 16) / 2
  bounsSprite.top = top + (height - 16) / 2
  bounsSprite.velocityX = 0
  bounsSprite.velocityY = 120
  game.setFreeSpriteNew(bounsSprite)
}

export function getVisiblableBonusList() {
  return <Bonus[]>game.sprites.filter((s: Sprite) => {
    return s.visible && s.name.startsWith('bonus')
  })
}