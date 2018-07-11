
Canvas 弹幕游戏分享
2018-07-12

# canvas & context

`canvas`：一块画布，充当图形容器

`context`：绘图环境，提供了所有的绘图能力

# 动画 or 游戏

简要总结动画就是一帧帧地绘制图像，并能够流畅地表现出来，而游戏是在这个基础上加上一些事件监听（控制角色等）、逻辑判断（碰撞检测等）。

为了流畅地进行绘制，借助`window.requestAnimationFrame`让浏览器自行来决定帧速率。

另外，还会借助双缓存技术来避免闪烁，即每一帧的内容先绘制在离屏 canvas 中，最后再绘制到可视的 canvas 上。

> 写这个的时候看到浏览器已经在 canvas 中内建了双缓存机制，开发者再去手工实现一遍会适得其反。这点还没了解过，本次分享中我手工实现了一遍:sweat_smile:。

<a href="./ex1.html" target="_blank">=========> ex1</a>

# 精灵

精灵是一个自定义对象，是一种可以集成入动画之中的图形对象，还能执行特定的动作。

## Sprite 类

```js
class Sprite {
  constructor(name, painter, behaviors) {
    this.name = name
    // 指向绘制器
    this.painter = painter
    // 行为数组
    this.behaviors = behaviors

    // 其他属性
    this.left = 0
    this.top = 0
    this.width = 10
    this.height = 10
    this.velocityX = 0
    this.velocityY = 0
    this.visible = true
    this.animating = false
  }

  paint(context) {
    if (this.painter && this.visible) {
      // 调用绘制器的绘制方法进行绘制
      this.painter.paint(this, context)
    }
  }

  update(context, time) {
    for (let index = this.behaviors.length; index > 0; index--) {
      // 执行精灵的行为
      this.behaviors[index - 1].execute(this, context, time)
    }
  }
}
```

1. `painter`属性指向一个`Painter`对象的引用，一个精灵长什么样子由`Painter（绘制器）`决定
2. `behaviors`，行为对象数组，执行精灵的行为

## Painter 类

核心是 drawImage() 方法，将图片绘制到 canvas

1. 图像绘制器，将一张图片直接绘制上去，本游戏中的弹幕由该类绘制
2. 精灵表绘制器，素材是精灵表（记录了精灵对象每一帧的信息），每次绘制一个方格，对象当中还会有个数组索引对应每个单元格信息，通过调用 advance() 增加索引，从而绘制一个动态的元素。

精灵表：
![](./pl00.png)

```js
/**
 * 图像绘制器
 */
class ImagePainter {
  constructor(imageUrl) {
    this.image = new Image()
    this.image.src = imageUrl
  }

  paint(sprite, context) {
    if (this.image !== undefined) {
      if (!this.image.complete) {
        this.image.onload = (e) => {
          sprite.width = this.image.width
          sprite.height = this.image.height

          context.drawImage(e.target,
            sprite.left, sprite.top,
            sprite.width, sprite.height)
        }
      } else {
        sprite.width = this.image.width
        sprite.height = this.image.height
        context.drawImage(this.image,
          sprite.left, sprite.top,
          sprite.width, sprite.height)
      }
    }
  }
}

/**
 * 精灵绘制器
 * cells: [
 *  { left: 0, top: 0, width: 32, height: 48 },
 * ]
 */
class SpriteSheetPainter {
  constructor(cells, spritesheet) {
    this.cells = cells
    this.spritesheet = spritesheet
    this.cellIndex = 0
  }

  advance() {
    this.cellIndex = (this.cellIndex + 1) % this.cells.length
  }

  paint(sprite, context) {
    const cell = this.cells[this.cellIndex]
    sprite.width = cell.width
    sprite.height = cell.height
    context.drawImage(this.spritesheet,
      cell.left, cell.top,
      cell.width, cell.height,
      sprite.left, sprite.top,
      cell.width, cell.height)
  }
}

```

## Behavior

```js
// 1. 根据速度移动精灵
// 2. 每隔 PAGEFLIP_INTERVAL 更新精灵表中的帧
const behavior = {
  lastAdvance: 0,
  PAGEFLIP_INTERVAL: 100,
  // 每次精灵 update 的时候该方法会被调用
  execute: function (sprite, context, now) {
    sprite.left += sprite.velocityX / 60
    sprite.top += sprite.velocityY / 60

    if (now - this.lastAdvance > this.PAGEFLIP_INTERVAL) {
      sprite.painter.advance()
      this.lastAdvance = now
    }
  }
}
```

<a href="./index.html" target="_blank">=========> sprite</a>

# Game（游戏引擎）

```ts
class Game {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  sprites: Sprite[]
  // ...

  constructor(gameName: string, canvasId: string) {
    // ... 属性初始化

    // 添加事件绑定
    window.onkeyup = (e: KeyboardEvent) => {
      // ...
    }
  }

  /*
    ...资源加载、事件处理等其他行为
  */

  // 游戏循环...........................................................................
  /**
   * start game
   */
  start() {
    this.startTime = getTimeNow()

    window.requestAnimationFrame((time) => {
      this.animate(time)
    })
  }

  /**
   * 驱动动画
   * @param {number} time
   */
  animate(time: number) {

    // 循环中的声明周期
    this.tick(time)           // update fps, game time
    this.clearScreen()

    this.startAnimate(time)   // 重写
    this.paintUnderSprites()  // 重写

    this.updateSprites(time)  // invoke sprite behaviors
    this.paintSprites(time)   // paint sprites in the canvas

    this.paintOverSprites()   // 重写
    this.endAnimate()         // 重写

    // keep animate going
    window.requestAnimationFrame((time) => {
      this.animate(time)
    })
  }

  /**
   * 更新 fps、游戏时间
   * @param {number} time
   */
  tick(time: number) {
    // ...
  }

  /**
   * 清屏
   */
  clearScreen() {
    this.context.clearRect(0, 0, this.W, this.H)
  }

  /**
   * 更新所有精灵的行为，精灵的 update() 会被调用
   * @param {number} time
   */
  updateSprites(time: number) {
    for (let i = 0; i < this.sprites.length; i++) {
      const sprite = this.sprites[i]
      sprite.visible && sprite.update(this.context, time)
    }
  }

  /**
   * 绘制所有可见的精灵
   * @param {number} time
   */
  paintSprites(time: number) {
    for (let i = 0; i < this.sprites.length; i++) {
      const sprite = this.sprites[i]
      if (sprite.visible) {
        sprite.paint(this.context)
      }
    }
  }

  /**
   * 返回当前帧某个对象改变的像素
   * @param {number} velocity
   */
  pixelsPerFrame(velocity: number) {
    // pixels per frame
    return velocity / this.fps
  }

  // Sprites ..............................................................................
  /**
   * add sprite
   * @param {Sprite} sprite
   */
  addSprite(sprite: Sprite) {
    this.sprites.push(sprite)
  }

  /**
   * get sprite by name
   * @param {string} name
   */
  getSprite(name: string): Sprite | null {
    for (const sprite of this.sprites) {
      if (sprite.name === name) {
        return sprite
      }
    }
    return null
  }

  // startAnimate、paintUnderSprites、paintOverSprites、endAnimate
  // 可根据需要进行重写
  startAnimate(time: number) {

  }

  paintUnderSprites() {

  }

  paintOverSprites() {

  }

  endAnimate() {

  }
}

```

# 游戏演示

<a href="./game/index.html" target="_blank">=========> start</a>

↑、↓、←、→控制方向，按住`shift`慢速移动。

敌方弹幕类型：
1. 自机狙
2. 环形弹幕

# 书籍

《HTML5 Canvas核心技术:图形、动画与游戏开发》
