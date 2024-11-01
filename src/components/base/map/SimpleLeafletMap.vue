<script setup lang="ts">
/**
 * 简易地图 组件
 * */
import { nextTick, onMounted, reactive, ref, toRefs, watch } from "vue";
import type { AnyObject } from "@/types/global";
import { mapInit, searchPosition } from "@/utils/hooks/useLeafletMap";

/**
 * @params search 是否可搜索
 * @params disabled 是否不可点击
 * */
const props = defineProps<{
  show: any;
  search?: boolean;
  range?: boolean;
  disabled?: boolean;
  reuseForm: AnyObject;
}>();

const emit = defineEmits<{
  (e: "handle-items", value: AnyObject): void;
}>();

const { show, search, disabled, reuseForm } = toRefs(props);

const simpleMapRef = ref();

const state = reactive<AnyObject>({
  leafletMap: null,
  marker: null,
  lnglat: {},
  searchAddress: "",
  searchMarker: null,
});

const value = ref([0, 0]);
const marks = reactive({
  0: {
    style: {
      color: "#1989FA",
    },
    label: "0",
  },
  50: {
    style: {
      color: "#1989FA",
    },
    label: "50",
  },
  100: {
    style: {
      color: "#1989FA",
    },
    label: "100",
  },
});

const handleSave = (): void => {
  emit("handle-items", state.lnglat);
};

const handleInitMap = (): void => {
  nextTick(() => {
    state.leafletMap = mapInit("SimpleMap", 18);
    //注册点击事件
    if (!disabled.value) {
      handleMapClick();
    }

    handleInitData();
  });
};

const handleMapClick = (): void => {
  state.leafletMap.on("click", (ev: any) => {
    handleAddMarker(ev.latlng);
    handleSave();
  });
};

//生成具体的事件点位图标
const handleAddMarker = (point): void => {
  if (state.marker) {
    state.leafletMap.removeLayer(state.marker);
    state.marker = null;
  }

  const pointIcon = L.divIcon({
    className: "m-point-location-icon",
    iconSize: [32, 32],
  });

  state.marker = L.marker(point, {
    icon: pointIcon,
  });

  state.leafletMap.addLayer(state.marker);
  state.leafletMap.setView(point);

  state.lnglat = { point, ...point };
};

//根据坐标获取中文名
const handleGeocoderAddress = (lng: number, lat: number): void => {
  let geocoder = new leafletMap.Geocoder({
    radius: 1000,
  });
  geocoder.getAddress([lng, lat], function (status: string, result: any) {
    if (status === "complete" && result?.regeocode) {
      state.lnglat["eventAddress"] = result?.regeocode?.formattedAddress ?? "";
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
//根据中文名获取坐标（含 搜索点位icon）
const handleGeocoderLocation = async (): void => {
  const res = await searchPosition(state.searchAddress);

  if (res.status === 200) {
    const lonlat = res.data?.pois?.[0]?.lonlat || res.data?.area?.lonlat || "";
    const latLng = lonlat.split(",").reverse();

    const center = L.latLng(latLng[0], latLng[1]);

    state.lnglat = center;

    handleAddMarker(center);
  } else {
    console.error("根据地址查询位置失败");
  }
};

const VITE_MAP_CENTER = [31.95263, 118.8399];
//重新进入有值需要处理
const handleInitData = (): void => {
  nextTick(() => {
    if (reuseForm.value.eventAddress) {
      handleAddMarker(reuseForm.value.point);
    } else {
      const [lng, lat] = VITE_MAP_CENTER;
      handleAddMarker(VITE_MAP_CENTER);
    }
  });
};

watch(
  show,
  (n) => {
    if (!n) {
      state.searchAddress = "";
      //需要清除历史搜索的点位
      if (state.searchMarker) {
        state.searchMarker.setMap(null);
        state.searchMarker = null;
      }
    } else {
      if (reuseForm.value.eventAddress) {
        nextTick(() => {
          handleInitData();
        });
      }
    }
  },
  { immediate: true },
);

defineExpose({
  state,
  value,
  handleGeocoderLocation,
});

onMounted(() => {
  handleInitMap();
});
</script>

<template>
  <div class="flex flex-col h-full simple-map-components">
    <slot name="search">
      <el-row v-show="search" :gutter="20" class="flex-center">
        <el-col :span="12" class="mb-4">
          <el-input
            v-model="state.searchAddress"
            placeholder="请输入搜索地址"
          />
        </el-col>
        <el-col :span="12">
          <el-button type="primary" @click="handleGeocoderLocation"
            >搜索</el-button
          >
        </el-col>
      </el-row>
    </slot>
    <slot name="range">
      <el-row v-show="range" :gutter="20" class="items-center flex-center">
        <el-col :span="12" class="mb-4">
          <el-slider v-model="value" :marks="marks" />
        </el-col>
        <el-col :span="12">
          <span>公里</span>
        </el-col>
      </el-row>
    </slot>
    <div id="SimpleMap" ref="simpleMapRef" class="flex-1" />
  </div>
</template>
