export class Sprite {
  name: string
  painter: any
  behaviors: any[]
  left: number
  top: number
  width: number
  height: number
  velocityX: number
  velocityY: number
  visible: boolean
  animating: boolean

  paint(context: CanvasRenderingContext2D) {
    if (this.painter && this.visible) {
      this.painter.paint(this, context)
    }
  }

  update(context: CanvasRenderingContext2D, time: number) {
    for (let index = this.behaviors.length; index > 0; index--) {
      this.behaviors[index - 1].execute(this, context, time)
    }
  }
}