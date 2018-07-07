import Game, {game} from "../Game";
import enemy1 from '../../assets/enemy1.png'
import { Sprite, SpriteSheetPainter } from "../Sprite";
import { SheetCell, Behavior } from "../modals";

const cells: SheetCell[] = [
  { left: 0,   top: 0, width: 48, height: 32 },
  { left: 48,  top: 0, width: 48, height: 32 },
  { left: 96,  top: 0, width: 48, height: 32 },
  { left: 144,  top: 0, width: 48, height: 32 },
]

// class Enemy extends Sprite {

// }


export function getEnemy() {
  const b: Behavior = {
    lastAdvance: 0,
    PAGEFLIP_INTERVAL: 150,
    execute: function (sprite: Sprite, context: CanvasRenderingContext2D, now: number) {
      if (now - this.lastAdvance > this.PAGEFLIP_INTERVAL) {
        sprite.painter.advance()
        this.lastAdvance = now
      }
    }
  }
  return new Sprite('enemy', new SpriteSheetPainter(cells, game.getImage(enemy1)), [b])
}