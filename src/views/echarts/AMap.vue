<template>
  <div class="flex flex-col h-full simple-map-components">
    <el-row v-show="search" :gutter="20" class="flex-center">
      <el-col :span="12" class="mb-4">
        <el-input v-model="state.searchAddress" placeholder="请输入搜索地址" />
      </el-col>
      <el-col :span="12">
        <el-button type="primary" @click="handleGeocoderLocation"
          >搜索</el-button
        >
        <el-button type="primary" :icon="EditPen" @click.stop="enterDraw"
          >绘画模式</el-button
        >
      </el-col>
    </el-row>

    <div id="SimpleMap" ref="simpleMapRef" class="flex-1" />

    <div v-show="drawToolInfo.drawingState" class="draw-tool">
      <div class="draw-tool__btn" @click.stop="exitDraw">
        <el-icon><Back /></el-icon>
        {{ drawToolInfo.editingState ? "退出" : "返回" }}
      </div>
      <div
        v-show="drawToolInfo.editingState"
        class="draw-tool__btn"
        @click.stop="saveDraw"
      >
        <el-icon><DocumentChecked /></el-icon>
        保存
      </div>
      <div
        v-show="!drawToolInfo.editingState"
        class="draw-tool__btn"
        @click.stop="saveDraw"
      >
        <el-icon><Edit /></el-icon>
        绘制
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>

<script setup lang="ts">
/**
 * 简易地图 组件
 * */
import { nextTick, onMounted, reactive, ref, watch } from "vue";
import type { AnyObject } from "@/types/global";
import {
  AMapOptions,
  createPolygonGraphic,
  refreshLayer,
} from "@/utils/hooks/useAMap";
import { EditPen } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

const VITE_MAP_CENTER = [114.5208633462726, 30.788403946730268]; // 地图统一中心位置

const emit = defineEmits<{
  (e: "handle-items", value: AnyObject): void;
}>();

const show = ref(false);
const search = ref(true);
const reuseForm = ref({
  address: "",
  point: { lng: 0, lat: 0 },
});

const simpleMapRef = ref();

const state = reactive<AnyObject>({
  AMap: null,
  AMapLoading: false,
  marker: null,
  lnglat: {},
  searchAddress: "",
  gLayGroups: null, // 总图形绘制组
  highlightLayGroups: null, // 高亮绘制组
});

const handleSave = (): void => {
  emit("handle-items", state.lnglat);
};

const handleInitMap = (): void => {
  nextTick(() => {
    state.AMap = new AMap.Map(simpleMapRef.value, AMapOptions());
    state.AMapLoading = true;

    state.AMap.on("click", (ev: any) => {
      if (drawToolInfo.drawingState) {
        return;
      }
      let { lng, lat } = ev.lnglat;
      handleAddMarker(lng, lat, true);
      handleSave();
    });

    state.AMap.on("complete", async () => {
      state.AMapLoading = false;
      // 地图图块加载完成后触发
      state.gLayGroups = refreshLayer(state.AMap, state.gLayGroups);
      state.highlightLayGroups = refreshLayer(
        state.AMap,
        state.highlightLayGroups
      );
      polyEditorTool();
    });

    handleInitData();
  });
};

const handleAddMarker = (
  lng: number,
  lat: number,
  geocoder?: boolean
): void => {
  if (state.marker) {
    state.marker.setMap(null);
    state.marker = null;
  }

  let pointIcon = new URL("@/assets/img/svg/location.svg", import.meta.url)
    .href;

  state.marker = new AMap.Marker({
    position: [lng, lat],
    content: `<div class="amap-marker"><div class="point-special"></div><img src="${pointIcon}" alt=""></div>`,
    offset: new AMap.Pixel(-15, -15),
  });
  state.marker.setMap(state.AMap);
  if (geocoder) handleGeocoderAddress(lng, lat);
};

//根据坐标获取中文名
const handleGeocoderAddress = (lng: number, lat: number): void => {
  let geocoder = new AMap.Geocoder({
    radius: 1000,
  });
  geocoder.getAddress([lng, lat], function (status: string, result: any) {
    if (status === "complete" && result?.regeocode) {
      state.lnglat["address"] = result?.regeocode?.formattedAddress ?? "";
    } else {
      console.error("根据经纬度查询地址失败");
    }
  });

  state.lnglat = Object.assign({}, state.lnglat, {
    point: {
      lng,
      lat,
      type: 1,
    },
  });
};
//根据中文名获取坐标
const handleGeocoderLocation = (): void => {
  let geocoder = new AMap.Geocoder({});
  geocoder.getLocation(
    state.searchAddress || reuseForm.value.address,
    function (status: string, result: any) {
      if (status === "complete" && result.geocodes.length) {
        let { lng, lat } = result.geocodes[0].location;
        state.AMap.setCenter([lng, lat]);
      } else {
        console.error("根据地址查询位置失败");
      }
    }
  );
};
//重新进入有值需要处理
const handleInitData = (): void => {
  nextTick(() => {
    if (reuseForm.value.address) {
      const { lng, lat } = reuseForm.value.point;
      handleAddMarker(lng, lat);
      state.AMap.setCenter([lng, lat]);
    } else {
      const [lng, lat] = VITE_MAP_CENTER;
      handleAddMarker(lng, lat, true);
    }
  });
};

watch(
  show,
  (n) => {
    if (!n) {
      state.searchAddress = "";
    } else {
      if (reuseForm.value.address) {
        nextTick(() => {
          handleInitData();
        });
      }
    }
  },
  { immediate: true }
);

/**绘制多边形 */

export interface Polygon {
  getExtData: Function;
  setOptions: Function;
}

export interface PolygonEditor {
  on: Function;
  open: Function;
  close: Function;
  setTarget: Function;
  addAdsorbPolygons: Function;
}

export interface EventTarget extends Polygon {
  _opts: {
    path: [];
  };
  remove: Function;
  getPath: Function;
}

export interface MapEvent {
  target: EventTarget;
  originEvent: {
    pageX: string | number;
    pageY: string | number;
  };
  lnglat: {
    KL: number;
    className: string;
    kT: number;
    lat: number;
    lng: number;
    pos: Array<number>;
  };
}

const drawToolInfo = reactive({
  polyEditor: null as PolygonEditor | null, //多边形吸附工具对象
  selectedPolygon: null as EventTarget | null, // 选中的多边形
  drawingState: false, //是否绘制中状态
  editingState: false, //是否编辑中状态
});

//开始绘制
const createPolygon = () => {
  if (drawToolInfo.polyEditor) {
    drawToolInfo.polyEditor.close();
    drawToolInfo.polyEditor.setTarget();
    drawToolInfo.polyEditor.open();
  }
  drawToolInfo.drawingState = true;
  drawToolInfo.editingState = false;
};

const closeEditPolygon = () => {
  drawToolInfo.editingState = false;
  drawToolInfo.drawingState = false;

  closePolygon();
  ElMessage.info("已关闭编辑");
};

//多边形吸附工具停止编辑功能
const closePolygon = () => {
  drawToolInfo.polyEditor?.close();
};

//多边形吸附工具
const polyEditorTool = () => {
  drawToolInfo.polyEditor = new AMap.PolygonEditor(state.AMap) as PolygonEditor;

  drawToolInfo.polyEditor.on("add", (data: MapEvent) => {
    data.target.remove();
    if (drawToolInfo.drawingState) {
      const polygonOptions = {
        path: data.target?._opts?.path ? [...data.target._opts.path] : [],
        fillColor: "#d2ebff", // 多边形填充颜色
        fillOpacity: 0.8,
        strokeColor: "#409eff", // 线条颜色
      };
      const polygon = createPolygonGraphic(
        polygonOptions,
        true,
        {},
        selectPolygon,
        editPolygon
      );

      drawToolInfo.polyEditor?.addAdsorbPolygons(polygon);
      drawToolInfo.polyEditor?.close();
      state.gLayGroups.addOverlay(polygon);
      drawToolInfo.selectedPolygon = polygon;
    }
  });
  drawToolInfo.polyEditor.on("end", (data: MapEvent) => {
    if (
      (drawToolInfo.drawingState || drawToolInfo.editingState) &&
      data?.target?.getPath()?.length === 0
    ) {
      state.gLayGroups?.removeOverlay(data.target);
      drawToolInfo.drawingState = false;

      state.gLayGroups?.setOptions({
        fillOpacity: 0.8,
        fillColor: "#D2EBFF",
      });
      state.selectedPolygon = null;
    }
  });
};

// 清空选中多边形
const clearSelectPolygon = () => {
  drawToolInfo.selectedPolygon?.setOptions({
    fillOpacity: 1,
    fillColor: "#ff6569",
    strokeOpacity: 0,
  });

  drawToolInfo.selectedPolygon = null;
};

// 选择多边形
const selectPolygon = (e: MapEvent) => {
  if (drawToolInfo.drawingState && !drawToolInfo.editingState) {
    return;
  }

  // 恢复旧多边形颜色
  drawToolInfo.selectedPolygon?.setOptions({
    fillOpacity: 1,
    fillColor: "#ff6569",
    strokeOpacity: 0,
  });

  // 切换编辑图形
  if (drawToolInfo.editingState) {
    drawToolInfo.polyEditor?.setTarget(e.target);
    drawToolInfo.polyEditor?.open();
  }

  state.gLayGroups.setOptions({
    fillOpacity: 0.1,
    fillColor: "#e38b4f",
  });
  drawToolInfo.selectedPolygon = e.target;
  drawToolInfo.selectedPolygon?.setOptions({
    fillOpacity: 0.8,
    fillColor: "#d2ebff",
    strokeColor: "#409eff",
    strokeOpacity: 1,
  });
};

// 编辑多边形
const editPolygon = () => {
  if (drawToolInfo.editingState) {
    closeEditPolygon();
    return;
  }
  drawToolInfo.drawingState = true;
  drawToolInfo.editingState = true;
  drawToolInfo.polyEditor?.setTarget(drawToolInfo.selectedPolygon);
  drawToolInfo.polyEditor?.open();
};

const enterDraw = () => {
  clearSelectPolygon();
  drawToolInfo.drawingState = true;
  createPolygon();

  ElMessage.warning("你已进入绘画模式");
};

const closeDraw = () => {
  drawToolInfo.drawingState = false;
  drawToolInfo.polyEditor?.close();
  state.gLayGroups?.removeOverlay(drawToolInfo.selectedPolygon);
};

const exitDraw = () => {
  closeDraw();
};

const saveDraw = async () => {
  if (!drawToolInfo.selectedPolygon) {
    ElMessage.warning("请先绘制多边形");
  }

  const path = drawToolInfo.selectedPolygon?._opts.path || [];

  const params = {
    id: "",
    points: path.map((item) => {
      return {
        fieldName: "",
        lng: item[0],
        lat: item[1],
        type: 1,
      };
    }),
  };

  if (!drawToolInfo.editingState) {
    params.id = "";
  }

  const res = {
    code: 0,
  };
  if (res.code === 0) {
    ElMessage.success(drawToolInfo.editingState ? "保存成功" : "绘制成功");
    // closePolygon();
    clearSelectPolygon();
  }

  closeDraw();
};

onMounted(() => {
  handleInitMap();
});

defineExpose({
  state,
  handleGeocoderLocation,
});
</script>

<style lang="less">
#SimpleMap {
  width: 100%;
  min-height: 80vh;

  .point-special {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: @color-important;
    color: @color-important;
    border-radius: 50%;
    animation: ripple 2s infinite;
  }

  /*地图点位 波纹特效 amap-marker*/
  .amap-marker {
    position: relative;
    width: 30px;
    height: 30px;

    img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    .point-special {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: @color-important;
      border-radius: 50%;
      animation: ripple 2s infinite;
    }

    .point-special::before {
      content: "";
      animation: ripple-extend 2s infinite;
      width: 100%;
      height: 100%;
      display: block;
      background: @color-important;
      border-radius: 50%;
    }
  }

  @keyframes ripple {
    0% {
      transform: scale(1);
      opacity: 0.8;
    }
    100% {
      transform: scale(2);
      opacity: 0;
    }
  }

  @keyframes ripple-extend {
    0% {
      transform: scale(1);
      opacity: 0.7;
    }
    100% {
      transform: scale(2.5);
      opacity: 0;
    }
  }
}

.amap-logo {
  display: none;
  opacity: 0 !important;
}

.amap-copyright {
  opacity: 0;
}

.draw-tool {
  position: absolute;
  top: 80px;
  left: 32px;
  width: 45px;
  height: 135px;
  background: rgba(0, 13, 23, 0.7);
  border: 1px solid #dfdfe6;
  border-radius: 4px;
  box-shadow: 0px 1px 10px 0px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px;
  &__btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 14px;
    color: #ffffff;
    text-wrap: nowrap;
    cursor: pointer;
    .el-icon {
      font-size: 20px;
    }
  }
  &__icon {
    width: 30px;
    height: 30px;
  }
}
</style>
