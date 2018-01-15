import {
  getTimeNow
} from './utils'

export default class Game {
  constructor(gameName, canvasId) {
    this.canvas = document.getElementById(canvasId)
    
    // General
    this.context = this.canvas.getContext('2d')
    this.W = this.context.canvas.width
    this.H = this.context.canvas.height
    this.gameName = gameName
    this.sprites = []
    this.keyListeners = []

    // localStorage 本地存储历史分数的键名后缀
    this.HIGH_SCORES_SUFFIX = '_highscores'

    // image loading
    this.imageLoadingProgressCallback = null
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
    this.STRATING_FPS = 60

    this.paused = false
    this.startedPauseAt = 0
    // 可看成暂停时的绘制时间间隔
    this.PAUSE_TIMEOUT = 100

    // Sound
    this.soundOn = true
    this.soundChannels = []
    this.audio = new Audio()
    this.NUM_SOUND_CHANNELS = 10

    for (let index = 0; index < this.NUM_SOUND_CHANNELS; index++) {
      let audio = new Audio()
      this.soundChannels.push(audio)
    }

    window.onkeyup = (e) => { this.keyPressed(e, false) }
    window.onkeydown = (e) => { this.keyPressed(e, true) }
  }

  /**
   * Given a URL, return the associated image
   * @param {String} imgurl 
   */
  getImage(imgurl) {
    return this.images[imgurl]
  }

  /**
   * called by loadImage() when an image loads successfully
   */
  imageLoadedCallback() {
    this.imagesLoaded++
  }

  /**
   * called by loadImage() when an image doesn't load successfully
   */
  imageLoadErrorCallback() {
    this.imagesFailedToLoad++
  }

  /**
   * loads a particular image
   * @param {String} imageUrl 
   */
  loadImage(imageUrl) {
    let img = new Image()

    img.src = imageUrl

    img.addEventListener('load', (e) => {
      this.imageLoadedCallback(e)
    })

    img.addEventListener('error', (e) => {
      this.imageLoadErrorCallback(e)
    })

    this.images[imageUrl] = img
  }

  /**
   * 
   */
  loadImages() {
    // if there are images left to load
    if (this.imagesIndex < this.imageUrls.length) {
      this.loadImage(this.imageUrls[this.imagesIndex])
      this.imagesIndex++
    }
    // return progress
    return (this.imagesLoaded + this.imagesFailedToLoad) / this.imageUrls.length * 100
  }

  /**
   * call this method to add an image to the queue, the image will be loaded by loadImages()
   * @param {String} imageUrl 
   */
  queueImage(imageUrl) {
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
   * @param {Number} time 
   */
  animate(time) {
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

      // keep animate going
      window.requestAnimationFrame((time) => {
        this.animate(time)
      })
    }
  }

  /**
   * 更新 fps、游戏时间
   * @param {Number} time 
   */
  tick(time) {
    this.updateFrameRate(time)
    this.gameTime = getTimeNow() - this.startTime
    this.lastTime = time
  }

  /**
   * 更新 fps
   * @param {Number} time 
   */
  updateFrameRate(time) {
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
   * @param {Number} time 
   */
  updateSprites(time) {
    for (let i = 0; i < this.sprites.length; i++) {
      let sprite = this.sprites[i]
      sprite.update(this.context, time)
    }
  }

  /**
   * 绘制所有可见的精灵
   * @param {Number} time 
   */
  paintSprites(time) {
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
   * @param {Number} time 
   * @param {Number} velocity 
   */
  pixelsPerFrame(time, velocity) {
    // pixels per frame
    return velocity / this.fps
  }

  /**
   * get high scores array
   * @returns array
   */
  getHighScores() {
    return JSON.parse(localStorage.getItem(this.gameName + this.HIGH_SCORES_SUFFIX) || '[]')
  }

  /**
   * set high score to localStorage
   * @param {Number} highScore 
   */
  setHighScore(highScore) {
    const key = this.gameName + this.HIGH_SCORES_SUFFIX
    localStorage.setItem(key, this.getHighScores().unshift(highScore))
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
   * @param {Object} keyAndListener 
   */
  addKeyListener(keyAndListener) {
    this.keyListeners.push(keyAndListener)
  }

  /**
   * Given a key, return the associated listener
   * @param {string} key 
   */
  findKeyListener(key) {
    let listener = null
    for (const iterator of this.keyListeners) {
      if (iterator.key === key) {
        listener = iterator.listener
      }
    }
    return listener
  }

  /**
   * called by key down and key press, init at constructor
   * @param {*} e 
   * @param {Boolean} status keydown 为 true，keyup 为 false 
   */
  keyPressed(e, status) {
    let listener = null, key
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

  // Sound ...................................................................................
  /**
   * XXX: 有点不懂
   * return the first sound available channel
   */
  getAvailableSoundChannel() {
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
  playSound(id) {
    let channel = this.getAvailableSoundChannel(), element = document.getElementById(id)
    
    if (channel && element) {
      channel.src = element.src === '' ? element.currentSrc : element.src
      channel.load()
      channel.play()
    }
  }

  // Sprites ..............................................................................
  /**
   * add sprite
   * @param {Object} sprite 
   */
  addSprite(sprite) {
    this.sprites.push(sprite)
  }

  /**
   * get sprite by name
   * @param {string} name 
   */
  getSprite(name) {
    for (const sprite of object) {
      if (sprite.name === name) {
        return sprite
      }
    }
    return null
  }

  // startAnimate、paintUnderSprites、paintOverSprites、endAnimate
  // 构成每帧的生命周期钩子，可自行重写
  startAnimate(time) {

  }

  paintUnderSprites() {
    
  }

  paintOverSprites() {
    
  }

  endAnimate() {
    
  }
}

/*
  键盘事件的改善，可实现同时按键的效果
*/
// function keyHandle(e, result) {
//   switch (e.keyCode) {
//     //case 88:myplan.fire = result;
//     //break;
//     case 90:
//       myplan.rotateLeft = result;
//       break;
//     case 67:
//       myplan.rotateRight = result;
//       break;
//     case 37:
//       myplan.toLeft = result;
//       break;
//     case 38:
//       myplan.toTop = result;
//       break;
//     case 39:
//       myplan.toRight = result;
//       break;
//     case 40:
//       myplan.toBottom = result;
//       break;
//   }
// }
// window.onkeydown = function(event) {
//   keyHandle(event, true);
// }
// window.onkeyup = function(event) {
//   keyHandle(event, false);
// }