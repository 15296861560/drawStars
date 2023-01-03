<!--
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2023-01-01 00:06:26
 * @LastEditors: lgy
 * @LastEditTime: 2023-01-03 23:32:54
-->
<template>
  <audio controls autoplay loop ref="skystarMusic">
    <source src="./skystar.mp3" type="audio/mp3" />
  </audio>

  <div class="container" @click="playMusic">
    <img class="skystar-bg" src="./skystar.jpg" />
    <div class="center-text text-one">
      <span>{{ centerTextOne }}</span>
    </div>
    <div class="center-text text-two">
      <span>{{ centerTextTwo }}</span>
    </div>
    <div class="center-text text-three">
      <span>{{ centerTextThree }}</span>
    </div>
  </div>
</template>
<script setup>
import { onMounted, ref } from "vue";

const skystarMusic = ref(null);

const centerContent = [
  {
    one: "今晚，整片星空将为你一人闪烁",
  },
  {
    one: "从前从前,有个人爱你很久",
    two: "但偏偏，风渐渐",
    three: "把距离吹的好远",
  },
];

let centerTextOne = ref(centerContent[0].one);
let centerTextTwo = ref("");
let centerTextThree = ref("");

// poem
const words = [
  "伤心桥下春波绿",
  "曾是惊鸿照影来",
  "当年明月在",
  "曾照彩云归",
  "归去来兮",
  "真堪偕隐",
  "画船听雨眠",
  "愿为江水",
  "与君重逢",
  "一日不见兮",
  "思之若狂",
  "好想回到那个夏天",
  "趴在桌子上偷偷看你",
  "你曾是我灰色人生中的一道彩虹",
  "柳絮空缱绻",
  "南风知不知",
  "我见青山多妩媚",
  "料青山见我也应如是",
  "取次花丛懒回顾",
  "半缘修道半缘君",
  "三笑徒然当一痴",
  "人生若只如初见",
  "我余光中都是你",
  "人生自是有情痴",
  "此恨不关风与月",
  "因为你，我多少适应了这个世界",
  "春蚕到死丝方尽",
  "蜡炬成灰泪始干",
  "今夜何夕",
  "见此良人",
  "愿我如星君如月",
  "夜夜流光相皎洁",
  "情不所起",
  "一往而深",
  "玲珑骰子安红豆",
  "入骨相思知不知",
  "多情只有春庭月",
  "尤为离人照落花",
  "若有知音见采",
  "不辞唱遍阳春",
  "休言半纸无多重",
  "万斛离愁尽耐担",
  "夜月一帘幽梦",
  "和光同尘",
  "杳霭流玉",
  "月落星沉",
  "霞姿月韵",
  "喜上眉梢",
  "醉后不知天在水",
  "满船星梦压星河",
  "落花人独立",
  "微雨燕双飞",
  "掬水月在手",
  "弄花香满衣",
  "夜深忽梦少年事",
  "唯梦闲人不梦君",
  "垆边人似月",
  "皓腕凝霜雪",
  "众里嫣然通一顾",
  "人间颜色如尘土",
  "若非群玉山头见",
  "会向瑶台月下逢",
  "沉鱼落雁鸟惊喧",
  "羞花闭月花愁颤",
  "解释春风无限恨",
  "沉香亭北倚阑干",
];

function randomNum(min, max) {
  var num = (Math.random() * (max - min + 1) + min).toFixed(2);
  return num;
}

function init() {
  let container = document.querySelector(".container");
  let f = document.createDocumentFragment();
  words.forEach((w) => {
    let word_box = document.createElement("div");
    let word = document.createElement("div");
    word.innerText = w;
    word.classList.add("word");
    word.style.color = "#BAABDA";
    word.style.fontFamily = "楷体";
    word.style.fontSize = "24px";
    word_box.classList.add("word-box");
    word_box.style.setProperty("--margin-top", randomNum(-60, 20) + "vh");
    word_box.style.setProperty("--margin-left", randomNum(5, 25) + "vw");
    word_box.style.setProperty("--animation-duration", randomNum(8, 20) + "s");
    word_box.style.setProperty("--animation-delay", randomNum(-20, 0) + "s");

    word_box.appendChild(word);
    f.appendChild(word_box);
  });
  container.appendChild(f);
}

function playMusic() {
  skystarMusic.value.play();
}

function changeWords() {
  setTimeout(() => {
    centerTextOne.value = centerContent[1].one;
    centerTextTwo.value = centerContent[1].two;
    centerTextThree.value = centerContent[1].three;
  }, 30 * 1000);
}

onMounted(() => {
  init();
  changeWords();
});
</script>
<style lang="less">
.container {
  width: 100%;
  height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  perspective: 1300px;
  .skystar-bg {
    width: 100%;
    height: auto;
    position: absolute;
    left: 0px;
    top: 0px;
  }

  .center-text {
    font-size: 36px;
    font-family: "楷体";
    font-weight: bold;
    background-image: -webkit-linear-gradient(45deg, red, yellow, aqua, #ea80b0);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    -webkit-animation: com-linear 6s infinite linear;
    &.text-one {
      position: absolute;
      left: 50%;
      top: 40%;
      transform: translateX(-50%);
      animation-delay: -2s;
    }
    &.text-two {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translateX(-50%);
      animation-delay: -4s;
    }

    &.text-three {
      position: absolute;
      left: 50%;
      top: 60%;
      transform: translateX(-50%);
      animation-delay: -6s;
    }
  }

  :root {
    --margin-top: 0;
    --margin-left: 0;
    --animation-duration: 0s;
    --animation-delay: 0s;
  }
  div {
    transform-style: preserve-3d;
  }

  .word-box {
    margin-top: var(--margin-top);

    position: absolute;
    animation: rotY 0s linear infinite;
    animation-duration: var(--animation-duration);
    animation-delay: var(--animation-delay);
    .word {
      margin-left: var(--margin-left);
      animation-duration: reverse;

      position: absolute;
      animation: rotY 0s linear infinite;
      animation-duration: var(--animation-duration);
      animation-delay: var(--animation-delay);
    }
  }
}

@keyframes rotY {
  to {
    transform: rotateY(360deg);
  }
}

@-webkit-keyframes com-linear {
  from {
    -webkit-filter: hue-rotate(0deg);
  }

  to {
    -webkit-filter: hue-rotate(-360deg);
  }
}
</style>
