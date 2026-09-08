<template>
  <div class="watermark-page">
    <div class="page-header">
      <h1 class="page-title">图片水印工具</h1>
      <p class="page-subtitle">添加水印到图片</p>
    </div>

    <div class="main-card">
      <!-- 上传区域 -->
      <div
        class="upload-area"
        :class="{ 'has-image': imageUrl }"
        @dragover.prevent
        @drop.prevent="handleDrop"
        @click="triggerUpload"
      >
        <template v-if="!imageUrl">
          <div class="upload-icon">
            <el-icon :size="48"><UploadFilled /></el-icon>
          </div>
          <p class="upload-text">
            拖拽上传图片或 <span class="upload-link">点击上传</span>
          </p>
          <p class="upload-tip">仅支持 JPG/PNG 文件</p>
        </template>
        <template v-else>
          <img :src="imageUrl" class="uploaded-image" />
        </template>
        <input
          ref="fileInput"
          type="file"
          accept="image/jpeg,image/png"
          style="display: none"
          @change="handleFileChange"
        />
      </div>

      <!-- 水印设置 -->
      <div class="watermark-settings" v-if="imageUrl">
        <h3 class="section-title">水印设置</h3>

        <div class="setting-item">
          <label class="setting-label">水印文字</label>
          <el-input
            v-model="watermarkText"
            placeholder="请输入水印文字"
            class="setting-input"
          />
        </div>

        <div class="setting-item">
          <label class="setting-label">文字颜色</label>
          <el-color-picker v-model="textColor" />
        </div>

        <div class="setting-item">
          <label class="setting-label">字体大小</label>
          <el-slider
            v-model="fontSize"
            :min="12"
            :max="72"
            class="setting-slider"
          />
        </div>

        <div class="setting-item">
          <label class="setting-label">透明度</label>
          <el-slider
            v-model="opacity"
            :min="0"
            :max="100"
            class="setting-slider"
          />
        </div>

        <div class="setting-item">
          <label class="setting-label">水印位置</label>
          <div class="position-grid">
            <div
              v-for="pos in positions"
              :key="pos"
              class="position-btn"
              :class="{ active: watermarkPosition === pos }"
              @click="watermarkPosition = pos"
            >
              <span class="position-dot"></span>
            </div>
          </div>
        </div>
      </div>

      <!-- 水印效果预览 -->
      <div class="preview-section" v-if="imageUrl">
        <h3 class="section-title">水印效果预览</h3>
        <div class="preview-container">
          <canvas ref="previewCanvas" class="preview-canvas"></canvas>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons" v-if="imageUrl">
        <el-button type="primary" @click="downloadWatermarkImage">
          下载水印图片
        </el-button>
        <el-button @click="previewLarge">大图预览</el-button>
      </div>
    </div>

    <!-- 大图预览对话框 -->
    <el-dialog v-model="showLargePreview" title="大图预览" width="80%">
      <div class="large-preview">
        <canvas ref="largeCanvas"></canvas>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { UploadFilled } from '@element-plus/icons-vue'

export default {
  components: {
    UploadFilled
  },
  data() {
    return {
      imageUrl: '',
      watermarkText: '水印文字',
      textColor: '#ffffff',
      fontSize: 32,
      opacity: 50,
      watermarkPosition: 'bottom-right',
      positions: [
        'top-left',
        'top-center',
        'top-right',
        'middle-left',
        'middle-center',
        'middle-right',
        'bottom-left',
        'bottom-center',
        'bottom-right'
      ],
      showLargePreview: false,
      originalImage: null
    }
  },
  watch: {
    watermarkText() {
      this.drawWatermark()
    },
    textColor() {
      this.drawWatermark()
    },
    fontSize() {
      this.drawWatermark()
    },
    opacity() {
      this.drawWatermark()
    },
    watermarkPosition() {
      this.drawWatermark()
    }
  },
  methods: {
    triggerUpload() {
      this.$refs.fileInput.click()
    },

    handleFileChange(e) {
      const file = e.target.files[0]
      if (file) {
        this.loadImage(file)
      }
    },

    handleDrop(e) {
      const file = e.dataTransfer.files[0]
      if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
        this.loadImage(file)
      } else {
        this.$message.warning('仅支持 JPG/PNG 文件')
      }
    },

    loadImage(file) {
      const reader = new FileReader()
      reader.onload = e => {
        this.imageUrl = e.target.result
        const img = new Image()
        img.onload = () => {
          this.originalImage = img
          this.$nextTick(() => {
            this.drawWatermark()
          })
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    },

    getWatermarkPosition(canvas, textWidth, textHeight) {
      const padding = 20
      const pos = this.watermarkPosition
      const [vAlign, hAlign] = pos.split('-')
      let x, y
      if (hAlign === 'left') x = padding
      else if (hAlign === 'center') x = (canvas.width - textWidth) / 2
      else x = canvas.width - textWidth - padding
      if (vAlign === 'top') y = padding + textHeight
      else if (vAlign === 'middle') y = (canvas.height + textHeight) / 2
      else y = canvas.height - padding
      return { x, y }
    },

    drawWatermark() {
      if (!this.originalImage || !this.$refs.previewCanvas) return

      const canvas = this.$refs.previewCanvas
      const ctx = canvas.getContext('2d')

      const maxWidth = 600
      const scale = Math.min(1, maxWidth / this.originalImage.width)
      canvas.width = this.originalImage.width * scale
      canvas.height = this.originalImage.height * scale

      ctx.drawImage(this.originalImage, 0, 0, canvas.width, canvas.height)

      ctx.save()
      const scaledFontSize = this.fontSize * scale
      ctx.font = `${scaledFontSize}px Arial`
      ctx.fillStyle = this.textColor
      ctx.globalAlpha = this.opacity / 100

      const text = this.watermarkText
      const textWidth = ctx.measureText(text).width
      const { x, y } = this.getWatermarkPosition(
        canvas,
        textWidth,
        scaledFontSize
      )

      ctx.fillText(text, x, y)
      ctx.restore()
    },

    downloadWatermarkImage() {
      if (!this.originalImage) return

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      canvas.width = this.originalImage.width
      canvas.height = this.originalImage.height

      // 绘制原图
      ctx.drawImage(this.originalImage, 0, 0)

      // 绘制水印
      ctx.save()
      ctx.font = `${this.fontSize}px Arial`
      ctx.fillStyle = this.textColor
      ctx.globalAlpha = this.opacity / 100

      const text = this.watermarkText
      const textWidth = ctx.measureText(text).width
      const { x, y } = this.getWatermarkPosition(
        canvas,
        textWidth,
        this.fontSize
      )

      ctx.fillText(text, x, y)
      ctx.restore()

      // 下载
      const link = document.createElement('a')
      link.download = 'watermarked-image.png'
      link.href = canvas.toDataURL('image/png')
      link.click()

      this.$message.success('下载成功')
    },

    previewLarge() {
      if (!this.originalImage) return

      this.showLargePreview = true
      this.$nextTick(() => {
        if (this.$refs.largeCanvas) {
          const canvas = this.$refs.largeCanvas
          const ctx = canvas.getContext('2d')

          canvas.width = this.originalImage.width
          canvas.height = this.originalImage.height

          ctx.drawImage(this.originalImage, 0, 0)

          ctx.save()
          ctx.font = `${this.fontSize}px Arial`
          ctx.fillStyle = this.textColor
          ctx.globalAlpha = this.opacity / 100

          const text = this.watermarkText
          const textWidth = ctx.measureText(text).width
          const { x, y } = this.getWatermarkPosition(
            canvas,
            textWidth,
            this.fontSize
          )

          ctx.fillText(text, x, y)
          ctx.restore()
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.watermark-page {
  min-height: 100%;
  padding: 40px 20px;
  background: #f0f2f5;

  .page-header {
    text-align: center;
    margin-bottom: 30px;

    .page-title {
      font-size: 28px;
      color: #333;
      margin: 0 0 10px 0;
    }

    .page-subtitle {
      font-size: 14px;
      color: #999;
      margin: 0;
    }
  }

  .main-card {
    max-width: 900px;
    margin: 0 auto;
    background: #fff;
    border-radius: 8px;
    padding: 30px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

    .upload-area {
      border: 2px dashed #dcdfe6;
      border-radius: 8px;
      padding: 60px 20px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s;
      margin-bottom: 30px;

      &:hover {
        border-color: #409eff;
        background: #f5f7fa;
      }

      &.has-image {
        padding: 20px;
      }

      .upload-icon {
        color: #c0c4cc;
        margin-bottom: 16px;
      }

      .upload-text {
        font-size: 14px;
        color: #606266;
        margin: 0 0 8px 0;

        .upload-link {
          color: #409eff;
        }
      }

      .upload-tip {
        font-size: 12px;
        color: #909399;
        margin: 0;
      }

      .uploaded-image {
        max-width: 100%;
        max-height: 300px;
        object-fit: contain;
      }
    }

    .watermark-settings {
      margin-bottom: 30px;

      .section-title {
        font-size: 16px;
        color: #409eff;
        margin: 0 0 20px 0;
        padding-bottom: 10px;
        border-bottom: 1px solid #ebeef5;
      }

      .setting-item {
        display: flex;
        align-items: center;
        margin-bottom: 20px;

        .setting-label {
          width: 100px;
          font-size: 14px;
          color: #606266;
          flex-shrink: 0;
        }

        .setting-input {
          flex: 1;
        }

        .setting-slider {
          flex: 1;
          max-width: 300px;
        }

        .position-grid {
          display: grid;
          grid-template-columns: repeat(3, 36px);
          grid-template-rows: repeat(3, 36px);
          gap: 6px;

          .position-btn {
            width: 36px;
            height: 36px;
            border: 1px solid #dcdfe6;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;

            &:hover {
              border-color: #409eff;
            }

            &.active {
              border-color: #409eff;
              background: #ecf5ff;

              .position-dot {
                background: #409eff;
              }
            }

            .position-dot {
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: #c0c4cc;
              transition: background 0.2s;
            }
          }
        }
      }
    }

    .preview-section {
      margin-bottom: 30px;

      .section-title {
        font-size: 16px;
        color: #409eff;
        margin: 0 0 20px 0;
        padding-bottom: 10px;
        border-bottom: 1px solid #ebeef5;
      }

      .preview-container {
        border: 1px solid #ebeef5;
        border-radius: 4px;
        padding: 20px;
        min-height: 300px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f5f7fa;

        .preview-canvas {
          max-width: 100%;
          max-height: 400px;
        }
      }
    }

    .action-buttons {
      display: flex;
      gap: 12px;
    }
  }

  .large-preview {
    text-align: center;

    canvas {
      max-width: 100%;
    }
  }
}
</style>
