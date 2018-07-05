/**
 * return time now
 */
function getTimeNow(): number {
  return (+ new Date())
}

function getGUID() {
  // https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript/8809472#8809472
  let time = (new Date()).getTime()
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    // 使用更高精度的时间
    time += performance.now()
  }
  let guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(char) {
      var rand = (time + (Math.random() * 16)) % 16 | 0;
      time = Math.floor(time / 16);
      return (char === 'x' ? rand : ((rand & 0x3) | 0x8)).toString(16);
  })
  return guid
}

export {
  getTimeNow,
  getGUID
}