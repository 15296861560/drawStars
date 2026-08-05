<template>
  <div class="dependence">
    <div class="title-row">
      <div class="dependence-title">{{ $t('dependence.dependenceInfo') }}</div>
    </div>
    <div class="dependence-main">
      <ul>
        <li class="li-row" v-for="(item, index) in dpList" :key="index">
          <div class="relyOn">{{ item.relyOn }}</div>
          <div class="version">{{ item.version }}</div>
        </li>
        <li class="li-row" v-if="isOverflow">
          <span class="overflow-ellipsis">...</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import packageMsg from '../../../package.json'
// 最多显示多少条依赖信息
const maxShowLength = 10
export default {
  name: 'Dependence',
  props: {},
  data() {
    return {
      dpList: [],
      isOverflow: false
    }
  },
  methods: {
    getDpList() {
      let dpList = []
      for (let key in packageMsg.dependencies) {
        if (dpList.length >= maxShowLength) {
          this.isOverflow = true
          break
        }
        dpList.push({
          relyOn: key,
          version: packageMsg.dependencies[key]
        })
      }

      this.dpList = dpList
    }
  },
  mounted() {
    this.getDpList()
  }
}
</script>

<style lang="less" scoped>
/* 与更新日志卡片对齐：标题 5vh + 上下边距 4vh + 11 行 × 5vh */
.dependence {
  display: flex;
  width: 100%;
  height: calc(5vh + 4vh + 55vh);
  background-color: white;
  flex-direction: column;
  border-radius: 5px;
  .title-row {
    display: flex;
    flex-shrink: 0;
    padding-left: 2vw;
    align-items: center;
    height: 5vh;
    border-bottom: solid;
    border-color: #e6e6e6;
    border-width: 1px;
    .dependence-title {
      color: black;
    }
  }
  .dependence-main {
    flex: 1;
    min-height: 0;
    padding-left: 2vw;
    padding-right: 2vw;
    margin-top: 2vh;
    margin-bottom: 2vh;
    ul {
      border: 1px solid #e6e6e6;
      border-radius: 5px;
      .li-row {
        display: flex;
        justify-content: space-between;
        line-height: 5vh;
        height: 5vh;
        border: 1px solid #e6e6e6;
        .relyOn {
          text-align: center;
          background-color: #f7f7f7;
          width: 49%;
          border-right: 1px solid #e6e6e6;
        }
        .version {
          text-align: center;
          width: 50%;
        }
        .overflow-ellipsis {
          text-align: center;
          width: 100%;
        }
      }
    }
  }
}
</style>
