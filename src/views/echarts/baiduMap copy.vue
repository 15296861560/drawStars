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
    <!-- <div id="echart-map" class="m-echart-standard"></div> -->
    <baidu-map :scroll-wheel-zoom="true" @rightclick="clickBmap">
      <!--地图视图-->

      <bm-view class="map"></bm-view>

      <!--显示更多-->

      <div class="more_panel">
        <span :class="{ down: isShowPanel }" @click.stop="showPanel">
          <span>{{
            isShowPanel
              ? $t("module.echarts.baiduMap.showSearchList")
              : $t("module.echarts.baiduMap.hideSearchList")
          }}</span
          ><i class="el-icon-d-arrow-right"></i>
        </span>
      </div>

      <!--搜索-->

      <bm-local-search
        :keyword="keyword"
        :panel="isShowPanel"
        :auto-viewport="true"
        :location="location"
        @searchcomplete="searchcomplete"
      ></bm-local-search>

      <!--点标注-->

      <bm-marker
        :position="markerPo"
        :dragging="true"
        :title="storeName"
        :zIndex="999"
        @click="infoWindowOpen"
        :icon="{ url: markerIcon, size: { width: 34, height: 34 } }"
        @dragend="dragend"
      >
        <bm-info-window
          :show="isShowInfo"
          @close="infoWindowClose"
          @open="infoWindowOpen"
          >{{ address }}</bm-info-window
        >
      </bm-marker>
    </baidu-map>
  </div>
</template>

<script>
export default {
  data() {
    return {
      option: {},
      storeName: "点标注",

      center: {
        //经纬度
        lng: 39.9,
        lat: 116.3,
      },

      zoom: 3, //地图展示级别
      location: "佛山",
      keyword: "佛山",

      markerPo: {
        lng: 39.910925,
        lat: 116.413384,
      },

      isShowPanel: true,

      isShowInfo: false,

      markerIcon: "@/assets/img/echarts/position.svg", //标注图片

      address: "",
    };
  },
  methods: {
    initData() {
      this.getBaiduData();
    },
    getBaiduData() {},
    getJsData() {},
    clickBmap(val) {
      //右击鼠标放标注

      this.markerPo = val.point;
    },

    showPanel() {
      //点击标注出现弹框
      this.isShowPanel = !this.isShowPanel;
    },

    infoWindowClose() {
      //弹框关闭
      this.isShowInfo = false;
    },

    infoWindowOpen() {
      //弹框打开
      this.isShowInfo = true;
    },

    dragend(val) {
      //标注拖拽完成获取坐标信息

      this.markerPo = val.point;

      let geocoder = new BMap.Geocoder(); //创建地址解析器的实例

      geocoder.getLocation(val.point, (rs) => {
        this.address = rs.address;
      });
    },

    searchcomplete(arr) {
      this.isShowPanel = true;
    },
  },
  mounted() {
    // this.initData();
    // 隐藏百度广告
    // let baidu = document.getElementsByClassName("anchorBL");
    // baidu[0].style = "display:none";
    // baidu[1].style = "display:none";
  },
};
</script>

<style lang="less" scoped>
.map {
  width: 100%;
  height: 500px;
}

//隐藏百度图标
deep(.anchorBL) {
  display: none;
}

// .BMap_cpyCtrl {
//   display: none;
// }

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
