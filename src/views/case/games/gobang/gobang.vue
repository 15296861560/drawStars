<template>
  <div>
    <canvas class="checkerboard" id="gobang" ref="gobang" @click="playingChess"></canvas>

    <div class="control-part">
      <el-button type="primary" @click="startGame">开始游戏</el-button>
      <el-radio-group v-model="isBlack" class="ml-4">
        <el-radio label="true" size="large">黑子</el-radio>
        <el-radio label="false" size="large">白子</el-radio>
      </el-radio-group>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref, reactive } from "vue";
import { showTips } from "@/utils/message/showTips.js";

// 棋盘
const gobang = ref(null);
// 当前执棋
const isBlack = ref(true);
// 当前落子数据
let boards = [];
// 棋盘大小
const boardSize = 800;
// 棋子大小
const chessSize = 10;
// 网格数
const gap = 10;
// 网格宽度
const gapWidth = boardSize / gap;
// 是否游戏结束
let inGame = false;
// 当前步数
let allStep = 0;
// 最大步数
const maxStep = Math.pow(gap + 1, 2);

// 开始游戏
function startGame() {
  allStep = 0;
  inGame = true;
  isBlack.value = true;
  drawPanel();
  showTips("success", "游戏开始！");
}
// 下棋
function playingChess(event) {
  if (!inGame) {
    showTips("warning", "请先开始游戏");
    return;
  }

  const { offsetX, offsetY } = event;

  const x = Math.round(offsetX / gapWidth); // x轴坐标
  const y = Math.round(offsetY / gapWidth); // y轴坐标

  if (boards[x][y]) {
    return;
  }

  const canvas = gobang.value;
  const ctx = canvas.getContext("2d");
  ctx.beginPath();
  ctx.arc(x * gapWidth, y * gapWidth, chessSize, 0, Math.PI * 2);

  if (isBlack.value) {
    boards[x][y] = "b";
    ctx.fillStyle = "#000";
    ctx.fill();
  } else {
    boards[x][y] = "w";
    ctx.fillStyle = "#fff";
    ctx.fill();
  }

  if (isWin(x, y)) {
    return;
  }
  isBlack.value = !isBlack.value;
}

// 是否胜利
function isWin(x, y) {
  allStep++;
  if (allStep === maxStep) {
    showTips("success", "平局");
    inGame = false;
    return true;
  }

  if (
    lineCount(x, y, "x") >= 5 ||
    lineCount(x, y, "y") >= 5 ||
    lineCount(x, y, "xy") >= 5 ||
    lineCount(x, y, "yx") >= 5
  ) {
    showTips("success", `恭喜${isBlack.value ? "黑子" : "白子"}获胜`);
    inGame = false;
    return true;
  }
  return false;
}

function lineCount(x, y, direction) {
  const v = boards[x][y];
  let count = 1;
  let nx = x,
    ny = y,
    lx = x,
    ly = y;

  for (let i = 1; i < 5; i++) {
    switch (direction) {
      case "x":
        nx = x + i;
        break;
      case "y":
        ny = y + i;
        break;
      case "xy":
        nx = x + i;
        ny = y + i;
        break;
      case "yx":
        nx = x + i;
        ny = y - i;
        break;

      default:
        break;
    }
    if (nx >= 0 && ny >= 0 && nx <= gap && ny <= gap && boards[nx][ny] === v) {
      count++;
    } else {
      break;
    }
  }

  if (count >= 5) {
    return count;
  }
  for (let j = 1; j < 5; j++) {
    switch (direction) {
      case "x":
        lx = x - j;
        break;
      case "y":
        ly = y - j;
        break;
      case "xy":
        lx = x - j;
        ly = y - j;
        break;
      case "yx":
        lx = x - j;
        ly = y + j;
        break;

      default:
        break;
    }
    if (lx >= 0 && ly >= 0 && lx <= gap && ly <= gap && boards[lx][ly] === v) {
      count++;
    } else {
      break;
    }
  }
  return count;
}
// 绘制棋盘
function drawPanel() {
  boards = [];
  const canvas = gobang.value;
  canvas.width = boardSize;
  canvas.height = boardSize;
  const ctx = canvas.getContext("2d");
  //   循环画线，将线条画出来
  for (let i = 0; i < gap; i++) {
    // 将线段的开头表示出来
    ctx.moveTo(0, gapWidth * i); // 横线
    ctx.lineTo(boardSize, gapWidth * i);
    ctx.stroke();
    // 纵线
    ctx.moveTo(gapWidth * i, 0);
    ctx.lineTo(gapWidth * i, boardSize);
    ctx.stroke();

    boards.push(new Array(gap + 1).fill(""));
  }
  boards.push(new Array(gap + 1).fill(""));
}

function init() {
  drawPanel();
}

onMounted(() => {
  init();
});
</script>
<style lang="less" scoped>
.checkerboard {
  background: #b87c49;
  display: block;
  margin: 0 auto;
  border: solid 4px black;
  cursor: pointer;
}
.control-part {
  margin: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
