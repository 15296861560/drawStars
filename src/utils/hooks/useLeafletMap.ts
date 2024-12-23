import "leaflet/dist/leaflet.css";
import "leaflet.wmts";
import '@geoman-io/leaflet-geoman-free'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'
import L from "leaflet";
import axios from "axios";

const TK_KEY = "";

/**
 * 创建单个多边形
 * @param PolygonOptions 多边形样式
 * @param IsOnClick 是否可点击
 * @param ExtData 设置自定义属性
 * @param callback 点击后回调
 * @param latlngs
 */
export const createPolygonGraphic = (
  PolygonOptions?: object,
  IsOnClick?: boolean,
  ExtData?: object,
  callback?: Function,
  latlngs?: any,
) => {
  const baseOption = {
    fillColor: "#e38b4f", // 多边形填充颜色
    fillOpacity: 0.1,
    weight: 1, // 线条宽度，默认为 1
    color: "#ff0000", // 线条颜色
    opacity: 1,
  };
  const option = {
    ...baseOption,
    ...PolygonOptions,
  };
  const polygon = L.polygon(latlngs, option);

  if (ExtData) {
    polygon.setStyle(ExtData);
  }
  if (IsOnClick) {
    polygon.on("click", (ev: any) => {
      callback!(ev);
    });
  }
  return polygon;
};

/**
 * 经纬度格式处理
 * @param coordinatesString 经纬度数据集合 作用单个绘制数据
 */
export const handleScopesToAMap = (coordinatesString: String) => {
  const pathList = [
    ...(coordinatesString &&
      coordinatesString.split(";").map((lnglatStr: any) => {
        return lnglatStr.split(",").reverse();
      })),
  ];
  return [...pathList];
};

/**
 * 图层刷新绘制渲染
 * @param map 地图源
 * @param layer 图层对象
 * @param isFitView 是否自适应可视地图
 */
export const refreshLayer = (map: any, layer: any, isFitView?: Boolean) => {
  layer && map.removeLayer(layer);
  layer = L.layerGroup([]);
  map.addLayer(layer);
  isFitView && map.fitBounds();
  return layer;
};

export const mapInit = (mapDomId = "map", zoom = 11) => {
  // 初始化地图容器
  const map = L.map(mapDomId, {
    // 坐标系
    // crs: CRS_4490,
    crs: L.CRS.EPSG4326,
    zoomControl: false,
  }).setView([31.95263, 118.8399], zoom);

  const VEC_C =
    "http://t1.tianditu.gov.cn/vec_c/wmts?layer=vec&style=default&tilematrixset=c&Service=WMTS&Request=GetTile&Version=1.0.0&Format=tiles&TileMatrix={z}&TileCol={x}&TileRow={y}&tk=";
  const CVA_C =
    "http://t1.tianditu.gov.cn/cva_c/wmts?layer=cva&style=default&tilematrixset=c&Service=WMTS&Request=GetTile&Version=1.0.0&Format=tiles&TileMatrix={z}&TileCol={x}&TileRow={y}&tk=";

  L.tileLayer(VEC_C + TK_KEY, {
    maxZoom: 17,
    minZoom: 2,
    zoomOffset: 1,
  }).addTo(map);

  L.tileLayer(CVA_C + TK_KEY, {
    maxZoom: 17,
    minZoom: 2,
    zoomOffset: 1,
  }).addTo(map);

  return map;
};

export const createPolygonEditor = (map) => {
  const polyEditor = {
    points: [] as Array<any>,
    poly: null,
    close: () => {
      if (polyEditor.poly) {
        map.removeLayer(polyEditor.poly);
      }

      map.off("mousedown", onMouseDown);
      map.off("mousemove", onMove);
      map.off("contextmenu", closeEditPolygonEditor);
    },
    addAdsorbPolygons: () => {
      map.addLayer(polyEditor.poly);
      polyEditor.poly = null;
    },
  };

  const draw = () => {
    if (polyEditor.poly) {
      map.removeLayer(polyEditor.poly);
    }

    polyEditor.poly = L.polygon([...polyEditor.points], {
      color: "#409eff",
      fillColor: "#d2ebff",
      opacity: 0.2,
    }).addTo(map);
  };
  const onMouseDown = (e) => {
    polyEditor.points.push(e.latlng);

    draw();
  };

  const onMove = (e) => {
    if (polyEditor.poly) {
      map.removeLayer(polyEditor.poly);
    }

    polyEditor.poly = L.polygon([...polyEditor.points, e.latlng], {
      color: "#409eff",
      fillColor: "#d2ebff",
      opacity: 0.8,
    }).addTo(map);
  };

  const closeEditPolygonEditor = () => {
    polyEditor.points.splice(-1);
    draw();

    map.off("mousedown", onMouseDown);
    map.off("mousemove", onMove);
    map.off("contextmenu", closeEditPolygonEditor);
  };

  map.on("mousedown", onMouseDown);
  map.on("mousemove", onMove);
  map.on("contextmenu", closeEditPolygonEditor);

  return polyEditor;
};

export const searchPosition = async (keyWord = "", count = 1) => {
  const res = await axios.get(
    `http://api.tianditu.gov.cn/v2/search?postStr={"keyWord":"${keyWord}","queryType":12,"start":0,"count":${count},"specify":"156110108"}&type=query&tk=${TK_KEY}`,
  );

  return res;
};
