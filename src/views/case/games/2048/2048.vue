<!--
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-08-14 22:34:45
 * @LastEditors: lgy
 * @LastEditTime: 2022-08-14 22:35:01

 1、重置游戏
 2、随机生成新数字 2或4
 3、选择难度
 4、上下左右移动
 5、合成新数字，根据数字改变颜色
 6、判输 需要满足条件 1.16宫格中没有空间生成新的格子。2.上下左右四个方向上无法移动   同时满足两项条件则判输。
-->
<template>
  <div>
    <div class="options">
      <div class="size">
        <span>大小：</span>
        <el-select v-model="boundary" placeholder="请选择大小">
          <el-option v-for="n in sizes" :key="n" :label="n" :value="n"> </el-option>
        </el-select>
      </div>

      <el-button type="primary" @click="startGame">{{ $t("startGame") }}</el-button>
    </div>

    <div class="score">当前得分:{{ score }}</div>

    <div class="grid-container" :style="containerStyle">
      <div v-for="row in board" class="grid-row">
        <div
          class="grid-cell"
          :style="`background-color:${bgColor[value]};color:${
            value > 8 ? '#ffffff' : '#191919'
          }`"
          v-for="value in row"
        >
          {{ value ? value : "" }}
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      board: [],
      added: [],
      score: 0,
      boundary: 4,
      sizes: [4, 5, 6, 7, 8, 9, 10],
      bgColor: {
        2: "#E8D3C0",
        4: "#E1CCB1",
        8: "#C2CEDC",
        16: "#E4E6E1",
        32: "#E5E2B9",
        64: "#E6D6D9",
        128: "#F3EEEA",
        256: "#D3D2D0",
        512: "#ECCED0",
        1024: "#F4D1D7",
        0: "#FEECD8",
      },
    };
  },
  watch: {
    boundary(val) {
      this.startGame();
    },
  },
  computed: {
    containerStyle() {
      let sl = this.boundary * 100 + 20;
      let containerStyle = `width:${sl}px;height:${sl}px`;

      return containerStyle;
    },
  },
  methods: {
    // 初始化
    init() {},
    valueChange(val) {
      console.log(val);
    },
    // 添加键盘监听事件
    addKeyDownListen() {
      document.onkeydown = (event) => {
        switch (event.keyCode) {
          case 37: //left
            this.toLeft();
            break;
          case 38: //up
            this.toUp();
            break;
          case 39: //right
            this.toRight();
            break;
          case 40: //down
            this.toDown();
            break;
        }
      };
    },
    // 开始游戏
    startGame() {
      this.board = [];
      for (let i = 0; i < this.boundary; i++) {
        let row = [];
        for (let j = 0; j < this.boundary; j++) {
          row.push(0);
        }
        this.board.push(row);
      }

      this.generateNewNumber();
      this.generateNewNumber();

      this.addKeyDownListen();
    },
    // 生成新数字
    generateNewNumber() {
      let board = this.board;
      if (this.nospace(board)) return false;

      //随机一个位置
      let randx = this.randomLocation();
      let randy = this.randomLocation();
      while (true) {
        if (board[randx][randy] === 0) break;
        randx = this.randomLocation();
        randy = this.randomLocation();
      }
      //随机一个数字
      let randNumber = Math.random() < 0.5 ? 2 : 4;
      //在随机位置显示随机数字
      board[randx][randy] = randNumber;
      this.$forceUpdate();
    },
    // 随机位置
    randomLocation() {
      return parseInt(Math.floor(Math.random() * this.boundary));
    },
    // 判断是否还有空间
    nospace(board) {
      for (let i = 0; i < this.boundary; i++) {
        for (let j = 0; j < this.boundary; j++) {
          if (board[i][j] === 0) return false;
        }
      }
      return true;
    },
    // 判断能否往某个方向移动
    canMoveUp() {
      let board = this.board;
      let boundary = this.boundary;
      //判断能否上移
      for (let i = 0; i < boundary; i++) {
        for (let j = 0; j < boundary; j++) {
          if (board[i][j] !== 0 && i !== 0) {
            // 上边有空位或者上边方块数值等于当前方块数值则视为可移动
            if (board[i - 1][j] === 0 || board[i - 1][j] === board[i][j]) return true;
          }
        }
      }

      return false;
    },
    canMoveDown() {
      let board = this.board;
      let boundary = this.boundary;
      //判断能否下移
      for (let i = 0; i < boundary; i++) {
        for (let j = 0; j < boundary; j++) {
          if (board[i][j] !== 0 && i < boundary - 1) {
            if (board[i + 1][j] === 0 || board[i + 1][j] === board[i][j]) return true;
          }
        }
      }

      return false;
    },
    canMoveLeft() {
      let board = this.board;
      let boundary = this.boundary;
      //判断能否左移
      for (let i = 0; i < boundary; i++) {
        for (let j = 0; j < boundary; j++) {
          if (board[i][j] !== 0 && j !== 0) {
            if (board[i][j - 1] === 0 || board[i][j - 1] === board[i][j]) return true;
          }
        }
      }

      return false;
    },
    canMoveRight() {
      let board = this.board;
      let boundary = this.boundary;
      //判断能否左移
      for (let i = 0; i < boundary; i++) {
        for (let j = 0; j < boundary; j++) {
          if (board[i][j] !== 0 && j < boundary - 1) {
            if (board[i][j + 1] === 0 || board[i][j + 1] === board[i][j]) return true;
          }
        }
      }

      return false;
    },
    // 是否游戏结束
    isGameOver() {
      if (
        this.canMoveUp() ||
        this.canMoveDown() ||
        this.canMoveLeft() ||
        this.canMoveRight()
      ) {
        return false;
      } else {
        this.$message({
          message: `游戏结束,您的最终得分是${this.score}`,
          type: "error",
        });
        return true;
      }
    },
    // 往某个方向移动
    toUp() {
      if (!this.canMoveUp()) {
        return;
      }
      let board = this.board;
      let boundary = this.boundary;
      let max = this.score;
      for (let i = 1; i < boundary; i++) {
        for (let j = 0; j < boundary; j++) {
          if (board[i][j] === 0) {
            continue;
          }

          // 上方有空格则看尽头是否是空格或者是否与当前方块值一样
          if (board[i - 1][j] === 0) {
            let k = i - 1;
            while (k > 0) {
              if (board[k][j]) {
                break;
              } else {
                k--;
              }
            }
            if (!board[k][j]) {
              // 尽头也是空格
              board[k][j] = board[i][j];
            } else if (board[k][j] === board[i][j]) {
              // 尽头和当前值一样
              board[k][j] = board[i][j] * 2;
              max = Math.max(max, board[k][j]);
            } else {
              // 尽头和当前值不一样
              board[k + 1][j] = board[i][j];
            }
            board[i][j] = 0;
          } else if (board[i - 1][j] === board[i][j]) {
            // 与当前方块值一样
            board[i - 1][j] = board[i][j] * 2;
            max = Math.max(max, board[i - 1][j]);
            board[i][j] = 0;
          }
        }
      }
      this.score = Math.max(max, this.score);
      this.generateNewNumber();
      this.isGameOver();
    },
    toDown() {
      if (!this.canMoveDown()) {
        return;
      }
      let board = this.board;
      let boundary = this.boundary;
      let max = this.score;
      for (let i = boundary - 2; i >= 0; i--) {
        for (let j = 0; j < boundary; j++) {
          if (board[i][j] !== 0) {
            // 下方有空格则看尽头是否是空格或者是否与当前方块值一样
            if (board[i + 1][j] === 0) {
              let k = i + 1;
              while (k < boundary - 1) {
                if (board[k][j]) {
                  break;
                } else {
                  k++;
                }
              }
              if (!board[k][j]) {
                // 尽头也是空格
                board[k][j] = board[i][j];
              } else if (board[k][j] === board[i][j]) {
                // 尽头和当前值一样
                board[k][j] = board[i][j] * 2;
                max = Math.max(max, board[k][j]);
              } else {
                // 尽头和当前值不一样
                board[k - 1][j] = board[i][j];
              }
              board[i][j] = 0;
            } else if (board[i + 1][j] === board[i][j]) {
              // 与当前方块值一样
              board[i + 1][j] = board[i][j] * 2;
              max = Math.max(max, board[i + 1][j]);
              board[i][j] = 0;
            }
          }
        }
      }
      this.score = Math.max(max, this.score);
      this.generateNewNumber();
      this.isGameOver();
    },
    toLeft() {
      if (!this.canMoveLeft()) {
        return;
      }
      let board = this.board;
      let boundary = this.boundary;
      let max = this.score;
      for (let j = 1; j < boundary; j++) {
        for (let i = 0; i < boundary; i++) {
          if (board[i][j] !== 0) {
            // 左方有空格则看尽头是否是空格或者是否与当前方块值一样
            if (board[i][j - 1] === 0) {
              let k = j - 1;
              while (k > 0) {
                if (board[i][k]) {
                  break;
                } else {
                  k--;
                }
              }

              if (!board[i][k]) {
                // 尽头也是空格
                board[i][k] = board[i][j];
              } else if (board[i][k] === board[i][j]) {
                // 尽头和当前值一样
                board[i][k] = board[i][j] * 2;
                max = Math.max(max, board[i][k]);
              } else {
                // 尽头和当前值不一样
                board[i][k + 1] = board[i][j];
              }
              board[i][j] = 0;
            } else if (board[i][j - 1] === board[i][j]) {
              // 与当前方块值一样
              board[i][j - 1] = board[i][j] * 2;
              max = Math.max(max, board[i][j - 1]);
              board[i][j] = 0;
            }
          }
        }
      }
      this.score = Math.max(max, this.score);
      this.generateNewNumber();
      this.isGameOver();
    },
    toRight() {
      if (!this.canMoveRight()) {
        return;
      }
      let board = this.board;
      let boundary = this.boundary;
      let max = this.score;
      for (let j = boundary - 2; j >= 0; j--) {
        for (let i = 0; i < boundary; i++) {
          if (board[i][j] !== 0) {
            // 右方有空格则看尽头是否是空格或者是否与当前方块值一样
            if (board[i][j + 1] === 0) {
              let k = j + 1;
              while (k < boundary - 1) {
                if (board[i][k]) {
                  break;
                } else {
                  k++;
                }
              }
              if (!board[i][k]) {
                // 尽头也是空格
                board[i][k] = board[i][j];
              } else if (board[i][k] === board[i][j]) {
                // 尽头和当前值一样
                board[i][k] = board[i][j] * 2;
                max = Math.max(max, board[i][k]);
              } else {
                // 尽头和当前值不一样
                board[i][k - 1] = board[i][j];
              }
              board[i][j] = 0;
            } else if (board[i][j + 1] === board[i][j]) {
              // 与当前方块值一样
              board[i][j + 1] = board[i][j] * 2;
              max = Math.max(max, board[i][j + 1]);
              board[i][j] = 0;
            }
          }
        }
      }
      this.score = Math.max(max, this.score);
      this.generateNewNumber();
      this.isGameOver();
    },
    // 得分
    getScore() {},
  },
  mounted() {
    this.startGame();
  },
};
</script>
<style>
.options {
  font-size: 1.5rem;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.size {
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 5rem;
}
.score {
  font-size: 5rem;
  font-weight: bold;
}
.grid-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  padding: 10px;
  margin: 4rem auto;
  background: #bbada0;
  border-radius: 1rem;
}
.grid-row {
  display: flex;
}
.grid-cell {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 36px;
  width: 80px;
  height: 80px;
  border-radius: 6px;
  background: #ccc0b3;
  margin: 10px;
  color: #191919;
}
</style>

<i18n>
{
  "zh": {
    "size":"大小",
    "selectSize":"请选择大小",
    "currentScore":"当前得分",
    "startGame":"开始游戏"
  },
  "en": {
    "size":"Size", 
    "selectSize":"Select Size",
    "currentScore":"Current Score",
    "startGame":"Start Game"
  }
 
}
</i18n>
