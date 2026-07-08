<script setup lang="ts">
/**
 * 组件: 拾取点位 - 地图
 * */
import {
  onMounted,
  reactive,
  nextTick,
  ref,
  onBeforeUnmount,
  toRefs,
} from "vue";
import type { AnyObject } from "@/types/global";
import { mapInit, refreshLayer } from "@/utils/hooks/useLeafletMap";
import "leaflet/dist/leaflet.css";
import "leaflet.wmts";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";

const props = defineProps<{
  latLngInfo: AnyObject;
}>();
const { latLngInfo } = toRefs(props);

const emit = defineEmits<{
  (e: "set-point-info", value: AnyObject): void;
}>();

const state = reactive<AnyObject>({
  Map: null,
  MapLoading: false,
  gLayGroups: null,
  highlightLayGroups: null,
  latlng: null,
  marker: null,
  rectangleLayer: null,
  shapeType: null,
  polygon: null,
  polyline: null,
  pointInfo: {
    centerPoint: {
      lat: "",
      lng: "",
    },
    point: [],
    type: "",
  },
});

const iconAddr = new URL(
  "@/assets/img/map/icon_dot_green.png",
  import.meta.url,
).href;
const RefMap = ref(null);

const refreshMap = (layerName: string, isFitView?: boolean) => {
  state[layerName] = refreshLayer(state.Map, state[layerName], isFitView);
};

//返回地图源
const getMap = () => state.Map;

// 标点
const drawing = ref(false);
const toggleMarkerMode = () => {
  polylineDrawing.value = false;
  polygonDrawing.value = false;
  drawing.value = !drawing.value;
  if (drawing.value) {
    handleRemoveLayer();
    // 点击地图时的事件处理函数
    state.Map.on("click", function (e: any) {
      // 清除特定的图层
      if (state.marker) {
        state.Map.removeLayer(state.marker);
      }
      // 获取点击位置的经纬度
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;

      // // 创建一个新的标记并添加到地图上
      state.marker = L.marker([lat, lng], {
        icon: L.icon({
          iconUrl: iconAddr,
          iconSize: [24, 24],
          shadowSize: [20, 20],
          iconAnchor: [20, 20],
          shadowAnchor: [4, 62],
          popupAnchor: [-9, -16],
        }),
      }).addTo(state.Map);

      state.pointInfo.centerPoint.lng = lng;
      state.pointInfo.centerPoint.lat = lat;
      state.pointInfo.type = 1;
    });
  } else {
    state.Map.off("click");
  }
};

const disabledEditClick = (event: any) => {
  state.polygon.pm.disable();
  const coordinates = event.target._latlngs;
  state.pointInfo.point = coordinates.flat();
};
const editDblclick = () => {
  if (polygonDrawing.value) {
    state.polygon.pm.enable();
  } else {
    state.polyline.pm.enable();
  }
};

// 处理多边形数据回显
const convertCoordinatesToDesiredFormat = (coordinates: AnyObject) => {
  return coordinates?.map((point: AnyObject) => [point.lat, point.lng]);
};

// 画线
const polylineDrawing = ref(false);
const togglePolylineMode = () => {
  drawing.value = false;
  polygonDrawing.value = false;
  state.Map.off("click");
  polylineDrawing.value = !polylineDrawing.value;
  if (polylineDrawing.value) {
    openDraw("Line");
  } else {
    state.Map.pm.disableDraw("Line");
  }
};

// 画面
const polygonDrawing = ref(false);
const togglePolygonMode = () => {
  drawing.value = false;
  polylineDrawing.value = false;
  state.Map.off("click");
  polygonDrawing.value = !polygonDrawing.value;
  if (polygonDrawing.value) {
    openDraw("Polygon");
  } else {
    state.Map.pm.disableDraw("Polygon");
  }
};

// 开启绘制功能
const openDraw = (type: string) => {
  const { point } = latLngInfo.value;
  mapLoad();

  if (point.length) {
    state.Map.pm.enableGlobalEditMode();
  } else {
    // 启用绘制模式
    state.Map.pm.enableDraw(type, {
      snappable: true,
      snapDistance: 20,
    });
  }
  // 启用绘制模式
  state.Map.pm.enableDraw(type, {
    snappable: true,
    snapDistance: 20,
  });
  // 双击编辑
  state.Map.on("dblclick", editMode);
};

// 开启编辑功能
const editMode = () => {
  if (polygonDrawing.value || polylineDrawing.value) {
    state.Map.pm.enableGlobalEditMode();
  }
};

// 清除所以图层
const handleRemoveLayer = () => {
  if (state.marker) {
    state.Map.removeLayer(state.marker);
    state.marker = null;
    state.pointInfo.centerPoint = { lat: "", lng: "" };
    state.pointInfo.type = "";
  }
  if (state.polyline) {
    state.Map.removeLayer(state.polyline);
    state.polyline = null;
  } else {
    state.Map.pm.disableGlobalRemovalMode();
    const allLayers = state.Map.pm.getGeomanDrawLayers();
    allLayers.forEach((layer: any) => {
      state.Map.removeLayer(layer);
    });
    if (polylineDrawing.value) {
      // 启用绘制模式
      state.Map.pm.enableDraw("Line", {
        snappable: true,
        snapDistance: 20,
      });
    }
  }
  if (state.polygon) {
    state.Map.removeLayer(state.polygon);
    state.polygon = null;
  } else {
    state.Map.pm.disableGlobalRemovalMode();
    const allLayers = state.Map.pm.getGeomanDrawLayers();
    allLayers.forEach((layer: any) => {
      state.Map.removeLayer(layer);
    });
    if (polygonDrawing.value) {
      // 启用绘制模式
      state.Map.pm.enableDraw("Polygon", {
        snappable: true,
        snapDistance: 20,
      });
    }
  }
};

defineExpose({
  refreshMap,
  getMap,
});

// 自定义绘制样式
const customDrawingStyle = () => {
  state.Map.pm.setPathOptions(
    {
      color: "orange", // 线的颜色
      fillColor: "green", // 填充的颜色
      fillOpacity: 0.4, // 填充的透明度
    },
    {
      ignoreShapes: ["Circle"], // 忽略某些图形的更改
    },
  );
};

// 绘制完成的回调
const pmCreate = (event: any) => {
  const layer = event.layer;
  state.shapeType = layer.pm.getShape(); // 获取绘制图形的类型
  let coordinates = [];
  // 根据绘制图形的类型获取坐标集合
  switch (state.shapeType) {
    case "Polygon":
      coordinates = layer.getLatLngs()[0];
      state.pointInfo.point = coordinates;
      state.pointInfo.type = 3;
      break;
    case "Line":
      coordinates = layer.getLatLngs();
      state.pointInfo.point = coordinates;
      state.pointInfo.type = 2;
      state.polygon = null;
      break;
    default:
      break;
  }
};

const mapLoad = () => {
  // 设置语言为中文
  state.Map.pm.setLang("zh");
  customDrawingStyle();
  // 监听绘制完成事件
  state.Map.on("pm:create", pmCreate);
};

// 点位信息回显处理
const handleSetPoint = () => {
  const {
    centerPoint: { lat, lng },
    point,
    type,
  } = latLngInfo.value;

  const latlngs = convertCoordinatesToDesiredFormat(point);
  switch (type) {
    case 1:
      if (lat && lng) {
        // // 创建一个新的标记并添加到地图上
        state.marker = L.marker([lat, lng], {
          icon: L.icon({
            iconUrl: iconAddr,
            iconSize: [30, 30],
            shadowSize: [20, 20],
            iconAnchor: [20, 20],
            shadowAnchor: [4, 62],
            popupAnchor: [-9, -16],
          }),
        }).addTo(state.Map);
        state.Map.setView(state.marker.getLatLng());
        state.pointInfo.centerPoint.lng = lng;
        state.pointInfo.centerPoint.lat = lat;
      }
      break;
    case 2:
      state.pointInfo.point = point;
      state.polyline = L.polyline(latlngs, {
        color: "orange", // 线的颜色
      }).addTo(state.Map);
      // 将地图放大到多边形的位置
      state.Map.fitBounds(state.polyline.getBounds());
      // 双击开启编辑
      state.polyline.on("dblclick", editDblclick);
      // 点击结束编辑
      state.polyline.on("click", disabledEditClick);
      break;
    case 3:
      state.pointInfo.point = point;
      state.polygon = L.polygon(latlngs, {
        color: "orange", // 线的颜色
        fillColor: "green", // 填充的颜色
        fillOpacity: 0.4, // 填充的透明度
      }).addTo(state.Map);
      // 将地图放大到多边形的位置
      state.Map.fitBounds(state.polygon.getBounds());
      // 双击开启编辑
      state.polygon.on("dblclick", editDblclick);
      // 点击结束编辑
      state.polygon.on("click", disabledEditClick);
      break;
    default:
      break;
  }
};

//初始化
const handleInit = (): void => {
  nextTick(() => {
    state.Map = mapInit("Map", 11);
    state.gLayGroups = refreshLayer(state.Map, state.gLayGroups);
    state.highlightLayGroups = refreshLayer(
      state.Map,
      state.highlightLayGroups,
    );
    handleSetPoint();
  });
};

// 保存点位信息
const handleSavePoint = () => {
  if (state.marker) {
    state.pointInfo.type = 1;
  } else {
    state.pointInfo.centerPoint = null;
  }

  if (state.polyline) {
    state.pointInfo.point = state.polyline
      ?.toGeoJSON()
      .geometry.coordinates.map(([lng, lat]: any) => ({ lat, lng }));
    state.pointInfo.type = 2;
  }

  if (state.polygon) {
    state.pointInfo.point = state.polygon
      ?.toGeoJSON()
      .geometry.coordinates[0].map(([lng, lat]: any) => ({ lat, lng }));
    state.pointInfo.type = 3;
  }
  emit("set-point-info", state.pointInfo);
};

onMounted(() => {
  handleInit();
});

onBeforeUnmount(() => {
  state.MapLoading = false;
});
</script>
<template>
  <div v-loading="state.MapLoading" class="flex">
    <div id="Map" ref="RefMap"></div>
    <div class="flex flex-col justify-center w-1/5 p-4 pr-2">
      <h3>地图操作</h3>
      <div class="my-4">
        <el-icon color="#eab308"><Warning /></el-icon>
        <span class="leading-5 text-yellow-500"
          >点击选择需要绘制的图形类型进行绘制，绘制完成鼠标移动至图形上可进行修改编辑，第二次绘制会覆盖第一次绘制的内容。</span
        >
      </div>
      <div>
        <div class="flex items-center cursor-pointer" @click="toggleMarkerMode">
          <el-icon
            size="20"
            class="mr-2"
            :class="drawing ? 'text-blue-500' : ''"
            ><Location
          /></el-icon>
          <span :class="drawing ? 'text-blue-500' : ''">{{
            drawing ? "关闭标点" : "标点"
          }}</span>
        </div>
        <div
          class="flex items-center mt-4 cursor-pointer"
          @click="togglePolylineMode"
        >
          <el-icon
            size="20"
            class="mr-2"
            :class="polylineDrawing ? 'text-blue-500' : ''"
            ><EditPen
          /></el-icon>
          <span :class="polylineDrawing ? 'text-blue-500' : ''">
            {{ polylineDrawing ? "关闭画线" : "画线" }}</span
          >
        </div>
        <div
          class="flex items-center mt-4 cursor-pointer"
          @click="togglePolygonMode"
        >
          <el-icon
            size="20"
            class="mr-2"
            :class="polygonDrawing ? 'text-blue-500' : ''"
            ><Edit
          /></el-icon>
          <span :class="polygonDrawing ? 'text-blue-500' : ''">{{
            polygonDrawing ? "关闭画面" : "画面"
          }}</span>
        </div>
      </div>
      <div class="flex mt-6 text-center">
        <el-button @click="handleRemoveLayer">删除</el-button>
        <el-button type="primary" @click="handleSavePoint">确认</el-button>
      </div>
    </div>
  </div>
</template>
<style lang="less" scoped>
#Map {
  flex: 1;
  height: 45vh;
  z-index: 1;
}
</style>
