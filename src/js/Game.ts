import {
  getTimeNow
} from './utils'
import { KeyListener, KeyImagePair } from "./modals"
import { Sprite } from './Sprite';

export default class Game {
  canvas: HTMLCanvasElement
  W: number
  H: number
  _realContext: CanvasRenderingContext2D
  _buffCanvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  gameName: string
  sprites: Sprite[]
  keyListeners: KeyListener[]
  HIGH_SCORES_SUFFIX: string = '_highscores'
  images: KeyImagePair
  imageUrls: string[]
  imagesLoaded: number
  imagesFailedToLoad: number
  imagesIndex: number
  startTime: number
  lastTime: number
  gameTime: number
  fps: number
  STRATING_FPS: number = 60
  paused: boolean
  startedPauseAt: number
  // 可看成暂停时的绘制时间间隔
  PAUSE_TIMEOUT: number = 100
  soundOn: boolean
  soundChannels: HTMLAudioElement[]
  audio: HTMLAudioElement
  NUM_SOUND_CHANNELS: number = 10

  constructor(gameName: string, canvasId: string) {
    this.canvas = <HTMLCanvasElement> document.getElementById(canvasId)
    this.W = this.canvas.width
    this.H = this.canvas.height

    // real visible canvas context
    this._realContext = this.canvas.getContext('2d')

    // General
    this._buffCanvas = document.createElement('canvas')
    this._buffCanvas.width = this.W
    this._buffCanvas.height = this.H

    // buff context
    this.context = this._buffCanvas.getContext('2d')

    this.gameName = gameName
    this.sprites = []
    this.keyListeners = []

    // image loading
    // this.imageLoadingProgressCallback = null
    this.images = {}
    this.imageUrls = []
    this.imagesLoaded = 0
    this.imagesFailedToLoad = 0
    this.imagesIndex = 0

    // Time
    this.startTime = 0
    this.lastTime = 0
    this.gameTime = 0
    this.fps = 0

    this.paused = false
    this.startedPauseAt = 0

    // Sound
    this.soundOn = true
    this.soundChannels = []
    this.audio = new Audio()

    for (let index = 0; index < this.NUM_SOUND_CHANNELS; index++) {
      let audio = new Audio()
      this.soundChannels.push(audio)
    }

    window.onkeyup = (e: KeyboardEvent) => { this.keyPressed(e, false) }
    window.onkeydown = (e: KeyboardEvent) => { this.keyPressed(e, true) }
  }


  /**
   * called by key down and key press, init at constructor
   * @param {KeyboardEvent} e
   * @param {boolean} status keydown 为 true，keyup 为 false
   */
  keyPressed(e: KeyboardEvent, status: boolean) {
    let listener = null, key: string
    switch (e.keyCode) {
      case 32:
        key = 'space'
        break
      case 68:
        key = 'd'
        break
      case 75:
        key = 'k'
        break
      case 83:
        key = 's'
        break
      case 80:
        key = 'p'
        break
      case 37:
        key = 'left arrow'
        break
      case 39:
        key = 'right arrow'
        break
      case 38:
        key = 'up arrow'
        break
      case 40:
        key = 'down arrow'
        break
    }

    listener = this.findKeyListener(key)
    if (listener) {
      listener(e, status)
    }
  }

  /**
   * Given a key, return the associated listener
   * @param {string} key
   */
  findKeyListener(key: string): Function | null {
    let listener = null
    for (const iterator of this.keyListeners) {
      if (iterator.key === key) {
        listener = iterator.listener
      }
    }
    return listener
  }

  /**
   * Given a URL, return the associated image
   * @param {string} imgurl
   */
  getImage(imgurl: string): HTMLImageElement {
    return this.images[imgurl]
  }

  /**
   * called by loadImage() when an image loads successfully
   */
  private imageLoadedCallback() {
    this.imagesLoaded += 1
  }

  /**
   * called by loadImage() when an image doesn't load successfully
   */
  private imageLoadErrorCallback() {
    this.imagesFailedToLoad += 1
  }

  /**
   * loads a particular image
   * @param {string} imageUrl
   */
  loadImage(imageUrl: string) {
    let img: HTMLImageElement = new Image()

    img.src = imageUrl

    img.addEventListener('load', () => {
      this.imageLoadedCallback()
    })

    img.addEventListener('error', () => {
      this.imageLoadErrorCallback()
    })

    this.images[imageUrl] = img
  }

  /**
   * 加载图片
   * 返回图片加载进度
   */
  loadImages(): number {
    // if there are images left to load
    if (this.imagesIndex < this.imageUrls.length) {
      this.loadImage(this.imageUrls[this.imagesIndex])
      this.imagesIndex += 1
    }
    // return progress
    return (this.imagesLoaded + this.imagesFailedToLoad) / this.imageUrls.length * 100
  }

  /**
   * call this method to add an image to the queue, the image will be loaded by loadImages()
   * @param {string} imageUrl
   */
  queueImage(imageUrl: string) {
    this.imageUrls.push(imageUrl)
  }

  // Game loop ...........................................................................
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
    if (this.paused) {
      setTimeout(() => {
        this.animate(time)
      }, this.PAUSE_TIMEOUT)
    } else {
      // game is running
      this.tick(time)           // update fps, game time
      this.clearScreen()

      this.startAnimate(time)   // 重写
      this.paintUnderSprites()  // 重写

      this.updateSprites(time)  // invoke sprite behaviors
      this.paintSprites(time)   // paint sprites in the canvas

      this.paintOverSprites()   // 重写
      this.endAnimate()         // 重写

      // really draw visible canvas
      this._realContext.clearRect(0, 0, this.W, this.H)
      this._realContext.drawImage(this._buffCanvas, 0, 0)

      // keep animate going
      window.requestAnimationFrame((time) => {
        this.animate(time)
      })
    }
  }

  /**
   * 更新 fps、游戏时间
   * @param {number} time
   */
  tick(time: number) {
    this.updateFrameRate(time)
    this.gameTime = getTimeNow() - this.startTime
    this.lastTime = time
  }

  /**
   * 更新 fps
   * @param {number} time
   */
  updateFrameRate(time: number) {
    if (this.lastTime === 0) {
      this.fps = this.STRATING_FPS
    } else {
      this.fps = 1000 / (time - this.lastTime)
    }
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
      let sprite = this.sprites[i]
      sprite.update(this.context, time)
    }
  }

  /**
   * 绘制所有可见的精灵
   * @param {number} time
   */
  paintSprites(time: number) {
    for (let i = 0; i < this.sprites.length; i++) {
      let sprite = this.sprites[i]
      if (sprite.visible) {
        sprite.paint(this.context)
      }
    }
  }

  /**
   * 切换游戏状态（暂停/开始）
   */
  togglePaused() {
    let now = getTimeNow()

    this.paused = !this.paused

    if (this.paused) {
      this.startedPauseAt = now
    } else {
      // 调整开始时间，让游戏从暂停的时间继续开始
      this.startTime = this.startTime + now - this.startedPauseAt
      this.lastTime = now
    }
  }

  /**
   * 返回当前帧某个对象改变的像素
   * @param {number} time
   * @param {number} velocity
   */
  pixelsPerFrame(time: number, velocity: number) {
    // pixels per frame
    return velocity / this.fps
  }

  /**
   * get high scores array
   */
  getHighScores(): number[] {
    return JSON.parse(localStorage.getItem(this.gameName + this.HIGH_SCORES_SUFFIX) || '[]')
  }

  /**
   * set high score to localStorage
   * @param {number} highScore
   */
  setHighScore(highScore: number) {
    const key = this.gameName + this.HIGH_SCORES_SUFFIX
    localStorage.setItem(key, this.getHighScores().unshift(highScore).toString())
  }

  /**
   * clear high scores
   */
  clearHighScores() {
    localStorage.setItem(this.gameName + this.HIGH_SCORES_SUFFIX, '[]')
  }

  // Key listeners ...........................................................................
  /**
   * add a (key, listener) pair to the keyListeners array
   * @param {KeyListener} keyAndListener
   */
  addKeyListener(keyAndListener: KeyListener) {
    this.keyListeners.push(keyAndListener)
  }

  // Sound ...................................................................................
  /**
   * return the first sound available channel
   */
  getAvailableSoundChannel(): HTMLAudioElement | null {
    let audio

    for (let index = 0; index < this.NUM_SOUND_CHANNELS; index++) {
      audio = this.soundChannels[index]
      if (audio.played && audio.played.length > 0) {
        if (audio.ended)
          return audio
      } else {
        if (!audio.ended)
          return audio
      }
    }

    // all channels in use
    return null
  }

  /**
   * XXX: 暂未了解意图
   * play sound
   * @param {string} id
   */
  playSound(id: string) {
    let channel = this.getAvailableSoundChannel()
    let element: HTMLAudioElement = <HTMLAudioElement> document.getElementById(id)

    if (channel && element) {
      channel.src = element.src === '' ? element.currentSrc : element.src
      channel.load()
      channel.play()
    }
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
  // 构成每帧的生命周期钩子，可自行重写
  startAnimate(time: number) {

  }

  paintUnderSprites() {

  }

  paintOverSprites() {

  }

  endAnimate() {

  }
}

export const game = new Game('project', 'canvas')
