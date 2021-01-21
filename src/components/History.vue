<template>
  <div>
    <div>
      <el-row class="history">
        <el-button size="medium" v-for="(item, index) in routeList" :key="index">{{item.Name}}</el-button>
      </el-row>
    </div>
  </div>
</template>

<script>
export default {
  name: "History",
  props: {
  },
  data() {
    return {
      routeList: [],
    };
  },
  methods: {
    getHistory() {
      this.routeList=this.$store.getters.getHistory;
    },
  },
  mounted() {},
};
</script>

<style scoped>
.history {
  display: flex;
  border-bottom: solid 1px #d7d7d7;
  padding: 10px;
}
</style>
