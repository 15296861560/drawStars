<template>
  <div class="dependence">
    <div class="title-row">
      <div class="dependence-title">{{ $t("dependence.dependenceInfo") }}</div>
    </div>
    <div class="dependence-main">
      <ul>
        <li class="li-row" v-for="(item, index) in dpList" :key="index">
          <div class="relyOn">{{ item.relyOn }}</div>
          <div class="version">{{ item.version }}</div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import packageMsg from "../../../package.json";
export default {
  name: "Dependence",
  props: {},
  data() {
    return {
      dpList: [],
    };
  },
  methods: {
    getDpList() {
      let dpList = [];
      for (let key in packageMsg.dependencies) {
        dpList.push({
          relyOn: key,
          version: packageMsg.dependencies[key],
        });
      }

      this.dpList = dpList;
    },
  },
  mounted() {
    console.log(packageMsg);
    this.getDpList();
  },
};
</script>

<style lang="less" scoped>
.dependence {
  display: flex;
  width: 49%;
  background-color: white;
  flex-direction: column;
  border-radius: 5px;
  .title-row {
    display: flex;
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
    display: block;
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
      }
    }
  }
}
</style>
