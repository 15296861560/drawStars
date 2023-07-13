<!--
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-11-26 16:37:23
 * @LastEditors: lgy
 * @LastEditTime: 2023-06-20 23:54:59
-->
<template>
  <div>
    <div class="m-map-search">
      <label
        >{{ $t("module.echarts.baiduMap.area")
        }}<el-input v-model="location" class="m-map-search-input"
      /></label>

      <label>
        {{ $t("module.echarts.baiduMap.keyWord")
        }}<el-input v-model="keyword" class="m-map-search-input"
      /></label>

      <label>
        {{ $t("module.echarts.baiduMap.longitude") }}
        <el-input v-model="markerPo.lat" class="m-map-search-input"
      /></label>

      <label>
        {{ $t("module.echarts.baiduMap.latitude") }}
        <el-input v-model="markerPo.lng" class="m-map-search-input"
      /></label>
    </div>

    <baidu-map
      class="map"
      ref="map"
      :apiKey="apiKey"
      :center="point"
      :zoom="13"
      :enableMapClick="true"
      :enableWheelZoom="true"
    >
      <!--点标注-->
      <bm-marker :point="markerPo" :show="true">
        <bm-marker-icon :size="[23, 25]" :imageOffset="[0, 0]"></bm-marker-icon>
      </bm-marker>

      <!-- 缩放控件 -->
      <bm-zoom-control :offset="[100, 400]" :show="true"></bm-zoom-control>

      <!-- 比例尺控件 -->
      <bm-scale-control :show="true" :offset="[100, 800]"></bm-scale-control>

      <!-- 地图类型控件 -->
      <bm-map-type-control :show="true" :offset="[100, 30]"></bm-map-type-control>

      <!-- 定位控件 -->
      <bm-location-control :show="true" :offset="[1000, 800]"></bm-location-control>

      <!-- 城市列表控件 -->
      <bm-city-list-control :show="true" :offset="[1000, 30]"></bm-city-list-control>

      <!-- 自定义控件 -->
      <bm-custom-control :show="true" :offset="[600, 800]">
        <!--显示更多-->
        <div class="more_panel">
          <span
            :class="{ down: showMorePanel }"
            @click.stop="showMorePanel = !showMorePanel"
          >
            <span>{{
              showMorePanel
                ? $t("module.echarts.baiduMap.showSearchList")
                : $t("module.echarts.baiduMap.hideSearchList")
            }}</span>
            <el-icon><ArrowRight /></el-icon>
          </span>
        </div>
      </bm-custom-control>
    </baidu-map>
  </div>
</template>
<script setup>
import { BaiduMap } from "baidu-map-vue3";
import { onMounted, ref, reactive } from "vue";
import { showTips } from "@/utils/message/showTips.js";
import { $axiosGet } from "@/assets/js/axios-api/axios-config.js";
const apiKey = ref("");

// 中心点
const point = ref({
  lng: 116.403963,
  lat: 39.915119,
});

// 位置
const location = ref("佛山");
//  关键词
const keyword = ref("佛山");
// 点标注经纬度
const markerPo = reactive({
  lng: 39.910925,
  lat: 116.413384,
});

// 是否显示展示更多面板
const showMorePanel = ref(true);

// 初始化
async function init() {
  const res = await $axiosGet({}, "/baiduApi/getMapApiKey");
  if (res.status) {
    apiKey.value = res.data;
  } else {
    showTips("error", "getApiKey fail");
  }
}

onMounted(() => {
  init();
});
</script>

<style lang="less" scoped>
.map {
  width: 100%;
  height: 80vh;
}

.more_panel {
  text-align: center;
  font-size: 16px;
  color: #2878ff;
  padding-top: 10px;
  padding-bottom: 10px;

  span {
    cursor: pointer;
    i {
      transform: rotate(90deg);
    }
  }

  span.down {
    i {
      transform: rotate(-90deg);
    }
  }
}
</style>
