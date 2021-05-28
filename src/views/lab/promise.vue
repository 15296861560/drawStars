<template>
  <div>
    <h2>Promise 对象用于表示一个异步操作的最终完成 (或失败)及其结果值。</h2>
    <!-- Promise其实是一个构造函数，它有resolve，reject，race等静态方法;它的原型（prototype）上有then，catch方法，因此只要作为Promise的实例，都可以共享并调用Promise.prototype上面的方法(then,catch) -->
    <h3>
      Promise的几种状态： <br/>
      pending: 初始状态，成功或失败状态。 <br/>
      fulfilled:意味着操作成功完成。 <br/>
      rejected: 意味着操作失败。
    </h3>

    <div class="outputMsg">
      <ul>
        <li v-for="(item, index) in logList" :key="index">{{ item }}</li>
      </ul>
    </div>
    <div class="btnArea">
      <div class="btnRow">
        <p>随机走resolve和reject</p>
        <el-button type="primary" @click="asyncMethod1">方法一</el-button>
      </div>

      <div class="btnRow">
        <p>顺序走resolve和reject</p>
        <el-button type="primary" @click="asyncMethod2">方法二</el-button>
      </div>

      <div class="btnRow">
        <p>链式调用</p>
        <el-button type="primary" @click="asyncMethod3">方法三</el-button>
      </div>

      <div class="btnRow">
        <el-button type="primary" @click="reset">清空</el-button>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      logList: [],
    };
  },
  methods: {
    asyncMethod1() {
      let promise = new Promise((resolve, reject) => {
        let y = Math.random();

        let flag = true;
        if (y > 0.5) flag = false;

        setTimeout(() => {
          if (flag) {
            this.logList.push("m1 resolve");
            resolve("resolve方法");
          } else {
            this.logList.push("m1 reject");
            reject("reject方法");
          }
        }, 1000);
      });

      return promise;
    },
    asyncMethod2() {
      let promise = new Promise((resolve, reject) => {
        setTimeout(() => {
          this.logList.push("m2 resolve");
          resolve("resolve方法");
          this.logList.push("m2 reject");
          reject("reject方法");
        }, 1000);
      });

      return promise;
    },
    asyncMethod3() {
      this.asyncMethod2().then((res) => {
        this.logList.push("then里方法2返回结果:" + res);
        this.logList.push("then里调用方法1");
        this.asyncMethod1()
          .then((res2) => {
            this.logList.push("方法2的then里方法1返回结果:" + res2);
          })
          .catch((e) => {
            this.logList.push("catch里的信息:" + e);
          });
      });
    },
    reset() {
      Object.assign(this.$data, this.$options.data());
    },
  },
  mounted() {},
};
</script>
<style lang="less" scoped>
.outputMsg {
  background-color: white;
  border-radius: 25px;
  padding: 20px;
}

.btnRow {
  margin-top: 2vh;
}
</style>
