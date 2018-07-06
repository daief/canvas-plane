import { Rect } from "./modals";

/**
 * return time now
 */
function getTimeNow(): number {
  return (+ new Date())
}

function getGUID(): string {
  // https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript/8809472#8809472
  let time: number = (new Date()).getTime()
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    // 使用更高精度的时间
    time += performance.now()
  }
  let guid: string = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(char) {
      var rand = (time + (Math.random() * 16)) % 16 | 0;
      time = Math.floor(time / 16);
      return (char === 'x' ? rand : ((rand & 0x3) | 0x8)).toString(16);
  })
  return guid
}

function is2RectIntersect(rect1: Rect, rect2: Rect): boolean {
  const maxLeft = Math.max(rect1.left, rect2.left)
  const maxTop = Math.max(rect1.top, rect2.top)
  const minRight = Math.min(rect1.left + rect1.width, rect2.left + rect2.width)
  const minBottom = Math.min(rect1.top + rect1.height, rect2.top + rect2.height)
  return !(maxLeft > minRight || maxTop > minBottom)
}

// x, y 与水平夹角 弧度
function getVAngle(x: number, y: number): number {
  return Math.acos(x / (Math.sqrt(x * x + y * y)))
}

export {
  getTimeNow,
  getGUID,
  is2RectIntersect,
  getVAngle,
}