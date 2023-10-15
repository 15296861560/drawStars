// 背景动画设置
// color: String类型。默认'#dedede'。粒子颜色。
// particleOpacity: Number类型。默认0.7。粒子透明度。
// particlesNumber: Number类型。默认80。粒子数量。
// shapeType: String类型。默认'circle'。可用的粒子外观类型有："circle","edge","triangle", "polygon","star"。
// particleSize: Number类型。默认80。单个粒子大小。
// linesColor: String类型。默认'#dedede'。线条颜色。
// linesWidth: Number类型。默认1。线条宽度。
// lineLinked: 布尔类型。默认true。连接线是否可用。
// lineOpacity: Number类型。默认0.4。线条透明度。
// linesDistance: Number类型。默认150。线条距离。
// moveSpeed: Number类型。默认3。粒子运动速度。
// hoverEffect: 布尔类型。默认true。是否有hover特效。
// hoverMode: String类型。默认true。可用的hover模式有: "grab", "repulse", "bubble"。
// clickEffect: 布尔类型。默认true。是否有click特效。
// clickMode: String类型。默认true。可用的click模式有: "push", "remove", "repulse", "bubble"。

// particles 后续引入的变量 必须保持一致!

export const particles = {
  fpsLimit: 60,
  fullScreen: {
    enable: true
  },
  particles: {
    number: {
      value: 50
    },
    shape: {
      type: 'circle'
    },
    opacity: {
      value: 0.5
    },
    size: {
      value: 400,
      random: {
        enable: true,
        minimumValue: 200
      }
    },
    move: {
      enable: true,
      speed: 10,
      direction: 'top',
      outModes: {
        default: 'out',
        top: 'destroy',
        bottom: 'none'
      }
    }
  },
  interactivity: {
    detectsOn: 'canvas',
    events: {
      resize: true
    }
  },
  detectRetina: true,
  themes: [{
    name: 'light',
    default: {
      value: true,
      mode: 'light'
    },
    options: {
      background: {
        color: '#f7f8ef'
      },
      particles: {
        color: {
          value: ['#5bc0eb', '#fde74c', '#9bc53d', '#e55934', '#fa7921']
        }
      }
    }
  },
  {
    name: 'dark',
    default: {
      value: true,
      mode: 'dark'
    },
    options: {
      background: {
        color: '#080710'
      },
      particles: {
        color: {
          value: ['#004f74', '#5f5800', '#245100', '#7d0000', '#810c00']
        }
      }
    }
  }
  ],
  emitters: {
    direction: 'top',
    position: {
      x: 50,
      y: 150
    },
    rate: {
      delay: 0.2,
      quantity: 2
    },
    size: {
      width: 100,
      height: 0
    }
  }
};