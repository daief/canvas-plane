// 死亡爆炸动画
import { Sprite, SpriteSheetPainter } from "../Sprite";
import { game } from "../Game";
import { Behavior, SheetCell } from "../modals";
import { getGUID } from "../utils";
import arua from '../../assets/arua.png'

const BLAST_SIZE = 128
const blastCells: SheetCell[] = [
  { left: 0,    top: 0, width: BLAST_SIZE, height: BLAST_SIZE },
  { left: 128,  top: 0, width: BLAST_SIZE, height: BLAST_SIZE },
  { left: 256,  top: 0, width: BLAST_SIZE, height: BLAST_SIZE },
  { left: 384,  top: 0, width: BLAST_SIZE, height: BLAST_SIZE },
  { left: 512,  top: 0, width: BLAST_SIZE, height: BLAST_SIZE },
  { left: 640,  top: 0, width: BLAST_SIZE, height: BLAST_SIZE },
  { left: 768,  top: 0, width: BLAST_SIZE, height: BLAST_SIZE },
  { left: 896,  top: 0, width: BLAST_SIZE, height: BLAST_SIZE },
  { left: 640,  top: 0, width: BLAST_SIZE, height: BLAST_SIZE },
  { left: 384,  top: 0, width: BLAST_SIZE, height: BLAST_SIZE },
  { left: 128,  top: 0, width: BLAST_SIZE, height: BLAST_SIZE },
]

export function showBlast(sprite: Sprite, callBack?: Function) {
  const normal: Behavior = {
    lastAdvance: 0,
    PAGEFLIP_INTERVAL: 100,
    execute: function (sprite: Sprite, context: CanvasRenderingContext2D, now: number) {
      if (now - this.lastAdvance > this.PAGEFLIP_INTERVAL) {
        sprite.painter.advance()
        this.lastAdvance = now
      }
      if ((<SpriteSheetPainter>sprite.painter).cellIndex === blastCells.length - 1) {
        sprite.visible = false
        callBack && callBack()
      }
    }
  }
  const blastSprite = new Sprite(`blast-${getGUID()}`, new SpriteSheetPainter(blastCells, game.getImage(arua)), [normal])
  const {left, top, width, height} = sprite
  blastSprite.left = left + (width - BLAST_SIZE) / 2
  blastSprite.top = top + (height - BLAST_SIZE) / 2
  game.setFreeSpriteNew(blastSprite)
}