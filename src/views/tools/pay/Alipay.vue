<template>
  <div>
    <div class="g-home-module">
      <el-form :inline="true" :model="goods">
        <el-form-item label="订单编号">
          <el-input
            v-model="goods.outTradeNo"
            placeholder="请输入订单编号"
            ref="outTradeNo"
          ></el-input>
        </el-form-item>
        <el-form-item label="商品名称">
          <el-input
            v-model="goods.subject"
            placeholder="请输入商品名称"
            ref="subject"
          ></el-input>
        </el-form-item>
        <el-form-item label="商品详情">
          <el-input
            v-model="goods.detail"
            placeholder="请输入商品详情"
            ref="detail"
          ></el-input>
        </el-form-item>
        <el-form-item label="商品价格">
          <el-input
            v-model="goods.price"
            placeholder="请输入商品价格"
            ref="price"
          ></el-input>
        </el-form-item>
        <el-form-item label="购买数量">
          <el-input v-model="goods.qty" placeholder="请输入购买数量" ref="qty"></el-input>
        </el-form-item>

        <el-form-item>
          <el-button size="medium" type="primary" @click="pay">
            <span>支付</span>
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      goods: {
        outTradeNo: new Date().getTime(),
        subject: "商品a",
        price: 0.01,
        qty: 1,
        detail: "商品a是。。。",
      },
    };
  },
  methods: {
    init() {},
    async pay() {
      await this.$axios({ goods: this.goods }, "/payApi/toPay").then((res) => {
        window.open(res.data);
      });
    },
  },
};
</script>
<style></style>
