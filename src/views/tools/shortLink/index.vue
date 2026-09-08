<template>
  <div class="short-link-page">
    <div class="page-header">
      <h1 class="page-title">短链生成器</h1>
      <p class="page-subtitle">一个简单的短链生成器</p>
    </div>

    <div class="main-card">
      <div class="notice-box">
        <p>
          请注意：短链的生成与使用必须严格遵循法律法规及公序良俗。指向内容需完全符合国家相关规定，严禁用于任何非法、不道德目的或实施攻击、滥用等行为。禁止指向黄色、赌博、诈骗网站及境外非法站点等违规内容。对于上述违法行为，我们有权且有义务向公安机关报送处理。
        </p>
      </div>

      <div class="input-row">
        <div class="url-prefix">https://</div>
        <el-input
          v-model="longUrl"
          placeholder="请输入URL"
          class="url-input"
          @keyup.enter="generateShortLink"
        />
        <el-button
          type="primary"
          class="generate-btn"
          @click="generateShortLink"
        >
          生成短链
        </el-button>
      </div>

      <div v-if="shortUrl" class="result-area">
        <div class="result-label">生成的短链：</div>
        <div class="result-link-row">
          <el-input :value="shortUrl" readonly class="result-input" />
          <el-button type="primary" plain @click="copyShortLink">
            {{ copied ? '已复制' : '复制' }}
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      longUrl: '',
      shortUrl: '',
      copied: false
    }
  },
  methods: {
    generateShortLink() {
      if (!this.longUrl.trim()) {
        this.$message.warning('请输入URL')
        return
      }
      let url = this.longUrl.trim()
      if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url
      }
      // 使用 base62 编码生成短码
      const hash = this.simpleHash(url)
      const shortCode = this.toBase62(Math.abs(hash))
      this.shortUrl = `https://s.link/${shortCode}`
      this.copied = false
    },
    simpleHash(str) {
      let hash = 0
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = (hash << 5) - hash + char
        hash = hash & hash
      }
      return hash
    },
    toBase62(num) {
      const chars =
        '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
      let result = ''
      do {
        result = chars[num % 62] + result
        num = Math.floor(num / 62)
      } while (num > 0)
      return result
    },
    copyShortLink() {
      navigator.clipboard
        .writeText(this.shortUrl)
        .then(() => {
          this.copied = true
          this.$message.success('复制成功')
          setTimeout(() => {
            this.copied = false
          }, 2000)
        })
        .catch(() => {
          // fallback
          const textarea = document.createElement('textarea')
          textarea.value = this.shortUrl
          document.body.appendChild(textarea)
          textarea.select()
          document.execCommand('copy')
          document.body.removeChild(textarea)
          this.copied = true
          this.$message.success('复制成功')
          setTimeout(() => {
            this.copied = false
          }, 2000)
        })
    }
  }
}
</script>

<style lang="less" scoped>
.short-link-page {
  min-height: 100%;
  background-color: #eef1f5;
  padding: 24px;
  box-sizing: border-box;
}

.page-header {
  text-align: center;
  margin-bottom: 24px;

  .page-title {
    font-size: 22px;
    font-weight: 600;
    color: #333;
    margin: 0 0 6px 0;
  }

  .page-subtitle {
    font-size: 13px;
    color: #999;
    margin: 0;
  }
}

.main-card {
  max-width: 720px;
  margin: 0 auto;
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.notice-box {
  background: #f5f6f7;
  border-radius: 6px;
  padding: 14px 16px;
  margin-bottom: 20px;

  p {
    font-size: 12px;
    color: #999;
    line-height: 1.8;
    margin: 0;
  }
}

.input-row {
  display: flex;
  align-items: center;
  gap: 0;

  .url-prefix {
    flex-shrink: 0;
    height: 36px;
    line-height: 36px;
    padding: 0 12px;
    background: #f5f7fa;
    border: 1px solid #dcdfe6;
    border-right: none;
    border-radius: 4px 0 0 4px;
    font-size: 14px;
    color: #606266;
  }

  .url-input {
    flex: 1;

    :deep(.el-input__wrapper) {
      border-radius: 0;
      border-left: none;
      border-right: none;
    }
  }

  .generate-btn {
    flex-shrink: 0;
    height: 36px;
    border-radius: 0 4px 4px 0;
  }
}

.result-area {
  margin-top: 20px;

  .result-label {
    font-size: 14px;
    color: #333;
    margin-bottom: 10px;
  }

  .result-link-row {
    display: flex;
    align-items: center;
    gap: 12px;

    .result-input {
      flex: 1;

      :deep(.el-input__wrapper) {
        background: #f5f7fa;
      }
    }
  }
}
</style>
