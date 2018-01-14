import 'babel-polyfill'
import './index.css'
import Game from './js/gameEngine'

var game = new Game('plan', 'canvas')
console.log(game.W)

// game.paused = true
// game.start()