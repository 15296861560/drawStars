<template>
  <div class="g-box-normal">
    <h2>{{ $t("module.media.cropPic") }}</h2>
    <el-row class="mb40">
      <!-- <el-button type="primary">{{$t("btn.originalImg")}}</el-button> -->
      <el-button type="primary" @click="reLoad">{{ $t("btn.reLoad") }}</el-button>
      <el-button type="primary" @click="crop">{{ $t("btn.crop") }}</el-button>
    </el-row>

    <div class="g-box-double">
      <div class="g-box-inside" ref="insideBox">
        <div class="mb40" v-show="!showImg">
          <div class=" drawstars-icon-defaultPic" style="font-size:20vw" ></div>

          <!-- 隐藏元素 -->
          <input
            type="file"
            @input="importImg"
            ref="file"
            accept="image/*"
            capture="camera"
            v-show="false"
          />

          <div class="u-tip-normal">{{ $t("tips.addImgSuccess") }}</div>
        </div>

        <el-button class="mb20" v-show="!showImg" type="primary" round @click="addImg">{{
          $t("btn.addImg")
        }}</el-button>

        <div v-show="showImg">
          <!-- <img class="u-img-normal" ref="originalPic" :src="imaItem.src" /> -->
          <canvas ref="canvas" id="canvas" height="800"></canvas>
          <canvas ref="coverBox"></canvas>
        </div>
      </div>

      <div class="g-box-inside" ref="preImg">
        <canvas ref="clipPosImg" style="padding: 1vw"></canvas>
      </div>
    </div>

    <div class="g-flex-normal" style="margin-top: 5vh; margin-bottom: 5vh">
      <img
        :src="c"
        height="100"
        v-for="(c, index) in captures"
        :key="index"
        @click="download(c)"
      />
    </div>
  </div>
</template>
<script>
// import postFile from "./postFile.js"

export default {
  data() {
    return {
      tipTop: "",
      showImg: false,
      imaItem: {
        src: "",
      },
      captures: [],
      // canvas: {},
      clipPos: {
        //裁剪框的默认尺寸与定位
        x: 15,
        y: 15,
        height: 100,
        width: 100,
      },
    };
  },
  methods: {
    addImg() {
      Object.assign(this.$data, this.$options.data());
      this.$refs.file.click();
    },
    reLoad() {
      this.$confirm(this.$t("tips.confirmUpload"), this.$t("tipsTitle.warmTip"), {
        confirmButtonText: this.$t("btn.continue"),
        cancelButtonText: this.$t("btn.return"),
        type: "warning",
      })
        .then(() => {
          this.addImg();
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: this.$t("tips.cancelUpload"),
          });
        });
    },
    importImg(e) {
      let files = this.$refs.file.files;

      this.getImg(files[0]);
    },
    getImg(file) {
      let promise = new Promise((resolve, reject) => {
        let fileImg = new FileReader();
        fileImg.readAsDataURL(file); // readAsDataURL方法将图片转为base64格式存储于result中

        let _this = this;
        fileImg.onload = function (e) {
          // let oImg = new Image();
          // oImg.src = this.result; // 使用FileReader的result属性获取图片base64信息
          // resolve(oImg);
          _this.paintImage(this.result); //把预览图片url传给函数
        };
        fileImg.onerror = function (e) {
          console.log("error" + e);
          reject(e);
        };
      });

      return promise;
    },
    //裁剪
    crop() {
      let clipPosImg = this.$refs.clipPosImg;

      this.captures.push(clipPosImg.toDataURL("image/png"));
    },
    //加载图片和裁剪框
    paintImage(url) {
      let _this = this;
      let canvas = this.$refs.canvas;
      let insideBox = this.$refs.insideBox;

      //imgWidth：绘制后图片的宽度；imgHeight：绘制后图片的高度；px、py：绘制后图片的坐标
      let imgWidth = 100;
      let imgHeight = 100;
      let px = 0;
      let py = 0;

      let createCanvas = canvas.getContext("2d");
      let img = new Image();
      img.src = url;
      img.onload = function () {
        //等比例缩放图片(如果图片宽高都比容器小，则绘制的图片宽高 = 原图片的宽高。)
        if (img.width < insideBox.offsetWidth && img.height < insideBox.offsetHeight) {
          imgWidth = img.width;
          imgHeight = img.height;
        } else {
          //如果图片的宽度或者高度比容器大，则宽度或者高度 = 容器的宽度或者高度，另一高度或者宽度则等比例缩放

          let pWidth = img.width / (img.height / insideBox.offsetHeight);
          let pHeight = img.height / (img.width / insideBox.offsetWidth);
          //以原图片长的那边等于容器的那边为准进行缩放
          imgWidth = img.width > img.height ? insideBox.offsetWidth : pWidth;
          imgHeight = img.height > img.width ? insideBox.offsetHeight : pHeight;
        }
        //图片的坐标
        px = (insideBox.offsetWidth - imgWidth) / 2 + "px";
        py = (insideBox.offsetHeight - imgHeight) / 2 + "px";

        canvas.height = imgHeight;
        canvas.width = imgWidth;
        canvas.style.left = px;
        canvas.style.top = py;

        createCanvas.drawImage(img, 0, 0, imgWidth, imgHeight); //没用直接插入背景图片而用canvas绘制图片，是为了调整所需框内图片的大小

        _this.showImg = true;
        _this.$message({
          type: "success",
          message: _this.$t("tips.uploadSuccess"),
        });

        _this.imaItem.src = canvas.toDataURL(); //储存原图片地址
        _this.clipImg();
        _this.drag();
      };
    },
    // 绘制裁剪框
    clipImg() {
      let bgPagePos = this.$refs.canvas;
      let coverBox = this.$refs.coverBox;
      let clipPos = this.clipPos;
      //绘制遮罩层：
      coverBox.height = bgPagePos.height;
      coverBox.width = bgPagePos.width;
      coverBox.style.display = "block";
      coverBox.style.position = "absolute";
      coverBox.style.left = bgPagePos.style.left;
      coverBox.style.top = bgPagePos.style.top;

      let cover = coverBox.getContext("2d");
      cover.fillStyle = "rgba(0, 0, 0, 0.5)";
      cover.fillRect(0, 0, bgPagePos.width, bgPagePos.height);
      cover.clearRect(clipPos.x, clipPos.y, clipPos.height, clipPos.width);
      this.preview();
    },

    //拖到裁剪框
    drag() {
      let _this = this;
      let draging = false;
      let _startPos = null;
      let coverBox = this.$refs.coverBox;
      let bgPagePos = this.$refs.canvas;
      let clipPos = this.clipPos;

      coverBox.onmousemove = function (e) {
        e = e || window.event;

        //获取鼠标相对于图片的位置
        let _mousePos = {
          left: e.offsetX,
          top: e.offsetY,
        };

        //判断鼠标是否在裁剪区域里面：
        if (
          _mousePos.left > clipPos.x &&
          _mousePos.left < clipPos.x + clipPos.width - 10 &&
          _mousePos.top > clipPos.y &&
          _mousePos.top < clipPos.y + clipPos.height - 10
        ) {
          this.style.cursor = "move";

          this.onmousedown = function () {
            draging = true;

            //记录鼠标按下时候的坐标
            _startPos = {
              left: e.offsetX,
              top: e.offsetY,
            };
          };

          //记录上一次裁剪框的坐标
          // let lastClipPos = {};
          // lastClipPos.x = clipPos.x;
          // lastClipPos.y = clipPos.y;

          if (draging) {
            //移动时裁剪区域的坐标 = 上次记录的定位 + (当前鼠标的位置 - 按下鼠标的位置)，裁剪区域不能超出遮罩层的区域;
            //左右移动
            if (_mousePos.left - clipPos.width / 2 < 0) {
              clipPos.x = 0;
            } else if (_mousePos.left + clipPos.width / 2 > bgPagePos.width) {
              clipPos.x = bgPagePos.width - clipPos.width;
            } else {
              clipPos.x = _mousePos.left - clipPos.width / 2;
            }

            // 上下移动
            if (_mousePos.top - clipPos.height / 2 < 0) {
              clipPos.y = 0;
            } else if (_mousePos.top + clipPos.height / 2 > bgPagePos.height) {
              clipPos.y = bgPagePos.height - clipPos.height;
            } else {
              clipPos.y = _mousePos.top - clipPos.height / 2;
            }
            _this.clipPos = clipPos;
            _this.clipImg();
          }

          document.body.onmouseup = function () {
            draging = false;
            document.onmousemove = null;
            document.onmouseup = null;
          };
        } else if (
          _mousePos.left <= clipPos.x + clipPos.width + 10 &&
          _mousePos.left >= clipPos.x + clipPos.width - 10 &&
          _mousePos.top <= clipPos.y + clipPos.height + 10 &&
          _mousePos.top >= clipPos.y + clipPos.height - 10
        ) {
          //当鼠标在右下角时
          this.style.cursor = "se-resize";

          this.onmousedown = function () {
            draging = true;

            //记录鼠标按下时候的坐标
            _startPos = {
              left: e.offsetX,
              top: e.offsetY,
            };
          };

          if (draging) {
            clipPos.width = _mousePos.left - clipPos.x;
            clipPos.height = clipPos.width;
            // clipPos.height = _mousePos.top - clipPos.y;
            _this.clipPos = clipPos;
            _this.clipImg();
          }
        } else {
          this.style.cursor = "auto";
        }
      };
    },

    // 预览
    preview() {
      //预览截图
      let img = new Image();
      img.src = this.imaItem.src;
      let clipPosImg = this.$refs.clipPosImg;
      let clipPos = this.clipPos;
      clipPosImg.width = clipPos.width;
      clipPosImg.height = clipPos.height;
      let context = clipPosImg
        .getContext("2d")
        .drawImage(
          img,
          clipPos.x,
          clipPos.y,
          clipPos.width,
          clipPos.height,
          0,
          0,
          clipPos.width,
          clipPos.height,
        );
    },

    download(src) {
      this.$confirm(this.$t("tips.comfirmDownloadImg"), this.$t("tipsTitle.tip"), {
        confirmButtonText: this.$t("btn.confirm"),
        cancelButtonText: this.$t("btn.cancel"),
        type: "info",
      })
        .then(() => {
          this.picDownload(src);
          this.$message({
            type: "success",
            message: this.$t("tips.downloadSuccess"),
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: this.$t("tips.cancelDownload"),
          });
        });
    },
    picDownload(imgSrc) {
      // 创建隐藏的可下载链接
      var eleLink = document.createElement("a");
      eleLink.download = "crop";
      eleLink.style.display = "none";
      eleLink.href = imgSrc;
      // 触发点击
      document.body.appendChild(eleLink);
      eleLink.click();
      // 然后移除
      document.body.removeChild(eleLink);
    },
  },
  mounted() {},
};
</script>
<style></style>
