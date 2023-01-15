/*
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2023-01-15 22:35:53
 * @LastEditors: lgy
 * @LastEditTime: 2023-01-15 22:42:17
 */
// requestAnimationFrame不兼容时的降级策略
function animationFrame() {
  const vendors = ["webkit", "moz"];
  for (let i = 0; i < vendors.length && !window.requestAnimationFrame; i++) {
    let vp = vendors[i];
    window.requestAnimationFrame = window[vp + "RequestAnimationFrame"];
    window.cancelAnimationFrame =
      window[vp + "CancelAnimationFrame"] ||
      window[vp + "CancelRequestAnimationFrame"];
  }
  if (
    /iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) || // iOS6 is buggy
    !window.requestAnimationFrame ||
    !window.cancelAnimationFrame
  ) {
    let lastTime = 0;
    window.requestAnimationFrame = function (callback) {
      let now = Date.now();
      let nextTime = Math.max(lastTime + 16, now);
      return setTimeout(function () {
        callback((lastTime = nextTime));
      }, nextTime - now);
    };
    window.cancelAnimationFrame = clearTimeout;
  }
}

export {
  animationFrame
}