<!--
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-11-26 16:37:23
 * @LastEditors: lgy
 * @LastEditTime: 2022-12-04 00:18:59
-->
<template>
  <div>
    <e-map
      echartId="echart-e-map"
      :chartData="mapData"
      height="80vh"
      width="80vw"
      class="m-echart-standard"
    ></e-map>
  </div>
</template>

<script>
import EMap from "@/components/echarts/EMap.vue";

export default {
  components: {
    EMap,
  },
  data() {
    return {
      mapData: {
        title: "发货区域分布图",
        data: [
          { name: "北京", value: Math.round(Math.random() * 210000) },
          { name: "天津", value: Math.round(Math.random() * 210000) },
          { name: "上海", value: Math.round(Math.random() * 210000) },
          { name: "重庆", value: Math.round(Math.random() * 210000) },
          { name: "河北", value: Math.round(Math.random() * 210000) },
          { name: "河南", value: Math.round(Math.random() * 210000) },
          { name: "云南", value: Math.round(Math.random() * 210000) },
          { name: "辽宁", value: Math.round(Math.random() * 210000) },
          { name: "黑龙江", value: Math.round(Math.random() * 210000) },
          { name: "湖南", value: Math.round(Math.random() * 210000) },
          { name: "安徽", value: Math.round(Math.random() * 210000) },
          { name: "山东", value: Math.round(Math.random() * 210000) },
          { name: "新疆", value: Math.round(Math.random() * 210000) },
          { name: "江苏", value: Math.round(Math.random() * 210000) },
          { name: "浙江", value: Math.round(Math.random() * 210000) },
          { name: "江西", value: Math.round(Math.random() * 210000) },
          { name: "湖北", value: Math.round(Math.random() * 210000) },
          { name: "广西", value: Math.round(Math.random() * 210000) },
          { name: "甘肃", value: Math.round(Math.random() * 210000) },
          { name: "山西", value: Math.round(Math.random() * 210000) },
          { name: "内蒙古", value: Math.round(Math.random() * 210000) },
          { name: "陕西", value: Math.round(Math.random() * 210000) },
          { name: "吉林", value: Math.round(Math.random() * 210000) },
          { name: "福建", value: Math.round(Math.random() * 210000) },
          { name: "贵州", value: Math.round(Math.random() * 210000) },
          { name: "广东", value: Math.round(Math.random() * 210000) },
          { name: "青海", value: Math.round(Math.random() * 210000) },
          { name: "西藏", value: Math.round(Math.random() * 210000) },
          { name: "四川", value: Math.round(Math.random() * 210000) },
          { name: "宁夏", value: Math.round(Math.random() * 210000) },
          { name: "海南", value: Math.round(Math.random() * 210000) },
          { name: "台湾", value: Math.round(Math.random() * 210000) },
          { name: "香港", value: Math.round(Math.random() * 210000) },
          { name: "澳门", value: Math.round(Math.random() * 210000) },
        ], //数据
      },
    };
  },
};
</script>
