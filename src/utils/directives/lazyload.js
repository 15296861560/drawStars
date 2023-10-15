/*
 * @Description:
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-10-13 22:57:26
 * @LastEditors: lgy
 * @LastEditTime: 2022-10-23 13:38:18
 */
const lazyload = {
  // 初始化
  init(el, val, def) {
    el.setAttribute('data-src', val);
    el.setAttribute('src', def);
  },
  // 利用IntersectionObserver监听el
  observe(el) {
    let io = new IntersectionObserver(entries => {
      const realSrc = el.dataset.src;
      if (entries[0].isIntersecting) {
        if (realSrc) {
          el.src = realSrc;
          el.removeAttribute('data-src');
        }
      }
    });
    io.observe(el);
  },
  // 监听scroll事件
  listenerScroll(el) {
    const handler = lazyload.throttle(lazyload.load, 300);
    lazyload.load(el);
    window.addEventListener('scroll', () => {
      handler(el);
    });
  },
  // 加载真实图片
  load(el) {
    const windowHeight = document.documentElement.clientHeight;
    const elTop = el.getBoundingClientRect().top;
    const elBtm = el.getBoundingClientRect().bottom;
    const realSrc = el.dataset.src;
    if (elTop - windowHeight < 0 && elBtm > 0) {
      if (realSrc) {
        el.src = realSrc;
        el.removeAttribute('data-srcdata-src');
      }
    }
  },

  // 节流
  throttle(fn, delay) {
    let preTime = Date.now();
    return function () {
      let _this = this;
      let args = arguments;
      let nowTime = Date.now();

      // 如果两次时间间隔超过了指定时间，则执行函数。
      if (nowTime - preTime >= delay) {
        preTime = Date.now();
        return fn.apply(_this, args);
      }
    };

  },
};


const lazy = {
  mounted(el, binding) {
    const defaultSrc = require('@/assets/img/commom/loading.gif');
    lazyload.init(el, binding.value, defaultSrc);
  },
  beforeMount(el) {
    // 判断该浏览器是否支持IntersectionObserver API
    if (IntersectionObserver) {
      lazyload.observe(el);
    } else {
      lazyload.listenerScroll(el);
    }
  },
};

export default lazy;