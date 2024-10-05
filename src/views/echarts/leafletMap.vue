<template>
  <div class="flex flex-col h-full simple-map-components">
    <el-row :gutter="20" class="flex-center">
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
  mapInit,
  refreshLayer,
  createPolygonEditor,
  searchPosition,
} from "@/utils/hooks/useLeafletMap.ts";
import { EditPen } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import L from "leaflet";

const emit = defineEmits<{
  (e: "handle-items", value: AnyObject): void;
}>();

const simpleMapRef = ref();

const state = reactive<AnyObject>({
  leafletMap: null,
  mapLoading: false,
  marker: null,
  lnglat: {},
  searchAddress: "",
  gLayGroups: null, // 总图形绘制组
  highlightLayGroups: null, // 高亮绘制组
});

const handleInitMap = (): void => {
  nextTick(() => {
    state.leafletMap = mapInit("SimpleMap", 11);

    state.gLayGroups = refreshLayer(state.leafletMap, state.gLayGroups);
    state.highlightLayGroups = refreshLayer(
      state.leafletMap,
      state.highlightLayGroups,
    );

    state.leafletMap.on("click", (e) => {
      handleAddMarker(e.latlng);
    });
  });
};

/**绘制多边形 */

export interface Polygon {
  getExtData: Function;
  setOptions: Function;
}

export interface PolygonEditor {
  points: Array<any>;
  poly: any;
  close: Function;
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
  drawToolInfo.polyEditor = createPolygonEditor(state.leafletMap);

  drawToolInfo.drawingState = true;
  drawToolInfo.editingState = false;
};

const enterDraw = () => {
  drawToolInfo.drawingState = true;
  createPolygon();

  ElMessage.warning("你已进入绘画模式");
};

const closeDraw = () => {
  drawToolInfo.drawingState = false;
  drawToolInfo.polyEditor?.close();
};

const exitDraw = () => {
  closeDraw();
};

const saveDraw = async () => {
  if (!drawToolInfo.polyEditor?.poly) {
    ElMessage.warning("请先绘制多边形");
  }

  drawToolInfo.polyEditor?.addAdsorbPolygons();

  ElMessage.success(drawToolInfo.editingState ? "保存成功" : "绘制成功");
  closeDraw();
};

const handleAddMarker = (point): void => {
  if (state.marker) {
    state.leafletMap.removeLayer(state.marker);
    state.marker = null;
  }

  const pointIcon = L.divIcon({
    className: "position-icon",
    iconSize: [32, 32],
  });

  state.marker = L.marker(point, {
    icon: pointIcon,
  });

  state.leafletMap.addLayer(state.marker);
  state.leafletMap.setView(point);
};

const handleGeocoderLocation = async () => {
  const res = await searchPosition(state.searchAddress);

  if (res.status === 200) {
    const lonlat = res.data?.pois?.[0]?.lonlat || res.data?.area?.lonlat || "";
    const latLng = lonlat.split(",").reverse();

    const center = L.latLng(latLng[0], latLng[1]);

    handleAddMarker(center);
  } else {
    console.error("根据地址查询位置失败");
  }
};

onMounted(() => {
  handleInitMap();
});

defineExpose({
  state,
});
</script>

<style lang="less">
#SimpleMap {
  width: 100%;
  min-height: 80vh;
  .position-icon {
    width: 32px;
    height: 32px;
    background: url("@/assets/img/map/icon_dot_green.png") no-repeat;
    background-size: 100%;
  }
}

.draw-tool {
  position: absolute;
  z-index: 1111;
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
