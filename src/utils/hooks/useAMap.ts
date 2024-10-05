/**
 * 高德地图专用 hooks
 * */
import type { AnyObject } from "@/types/global";

declare global {
  const AMap: any;
}

const VITE_MAP_CENTER = [114.5208633462726, 30.788403946730268]; // 地图统一中心位置

/**
 * 地图初始化参数
 * @param opts 地图初始化参数
 */
export const AMapOptions = (opts?: object) => {
  const baseOption = {
    center: VITE_MAP_CENTER,
    zoom: 12,
  };
  return {
    ...baseOption,
    ...(opts || {}),
  };
};

/**
 * 绘制多边形
 * @param data 坐标集合
 * @param map 地图源
 */
export const addPolygon = (data: AnyObject, map: any) => {
  let pathList: any[] = [];
  data.forEach((p: any) => {
    p.scopes.forEach((c: any) => {
      pathList = c.split(";");
    });
  });
  pathList = pathList.map((item) => {
    const i = item.split(",");
    item = [Number(i[0]), Number(i[1])];
    return item;
  });

  const polygon = new AMap.Polygon({
    path: pathList,
    fillColor: "#09ab93",
    strokeOpacity: 1,
    fillOpacity: 0.4,
    strokeColor: "#2b8cbe",
    strokeWeight: 1,
    strokeStyle: "dashed",
    strokeDasharray: [5, 5],
    bubble: true,
  });
  map.add(polygon);
  polygon.setMap(map);
};

/**
 * 图层刷新绘制渲染
 * @param map 地图源
 * @param layer 图层对象
 * @param isFitView 是否自适应可视地图
 */
export const refreshLayer = (map: any, layer: any, isFitView?: Boolean) => {
  layer && map.remove(layer);
  layer = new AMap.OverlayGroup([]);
  map.add(layer);
  isFitView && map.setFitView();
  return layer;
};

/**
 * 经纬度格式处理
 * @param coordinatesString 经纬度数据集合 作用单个绘制数据
 */
export const handleScopesToAMap = (coordinatesString: String) => {
  const pathList = [
    ...(coordinatesString &&
      coordinatesString.split(";").map((lnglatStr: any) => {
        const lnglat = lnglatStr.split(",");
        return new AMap.LngLat(lnglat[0], lnglat[1]);
      })),
  ];
  return [...pathList];
};

/**
 * 创建单个多边形
 * @param PolygonOptions 多边形样式参数详情见高德官网API
 * @param IsOnClick 是否可点击
 * @param ExtData 设置自定义属性
 * @param callback 点击后回调
 * @param dblClickCallback 双击击后回调
 */
export const createPolygonGraphic = (
  PolygonOptions?: object,
  IsOnClick?: boolean,
  ExtData?: object,
  callback?: Function,
  dblClickCallback?: Function,
) => {
  const baseOption = {
    fillColor: "#e38b4f", // 多边形填充颜色
    fillOpacity: 0.1,
    strokeWeight: 1, // 线条宽度，默认为 1
    strokeColor: "#ff0000", // 线条颜色
    strokeOpacity: 1,
    strokeStyle: "solid",
    zIndex: 10, //高德默认为10
  };
  const option = {
    ...baseOption,
    ...PolygonOptions,
  };
  const polygon = new AMap.Polygon(option);
  if (ExtData) {
    polygon.setExtData(ExtData);
  }
  if (IsOnClick) {
    polygon.on("click", (ev: any) => {
      callback!(ev);
    });
  }
  if (dblClickCallback) {
    polygon.on("dblclick", (ev: any) => {
      dblClickCallback!(ev);
    });
  }
  return polygon;
};

export const symbolData = {
  rkPointSymbol: new AMap.Icon({
    // 图标尺寸
    size: new AMap.Size(28, 33),
    // 图标的取图地址
    image: new URL("@/assets/img/map/icon_point_rk.png", import.meta.url).href,
    // 图标所用图片大小
    imageSize: new AMap.Size(28, 33),
    // 图标取图偏移量
    imageOffset: new AMap.Pixel(0, 0),
  }),
  frPointSymbol: new AMap.Icon({
    // 图标尺寸
    size: new AMap.Size(28, 33),
    // 图标的取图地址
    image: new URL("@/assets/img/map/icon_point_fr.png", import.meta.url).href,
    // 图标所用图片大小
    imageSize: new AMap.Size(28, 33),
    // 图标取图偏移量
    imageOffset: new AMap.Pixel(0, 0),
  }),
  fwPointSymbol: new AMap.Icon({
    // 图标尺寸
    size: new AMap.Size(28, 33),
    // 图标的取图地址
    image: new URL("@/assets/img/map/icon_point_fw.png", import.meta.url).href,
    // 图标所用图片大小
    imageSize: new AMap.Size(28, 33),
    // 图标取图偏移量
    imageOffset: new AMap.Pixel(0, 0),
  }),
  jzwPointSymbol: new AMap.Icon({
    // 图标尺寸
    size: new AMap.Size(28, 33),
    // 图标的取图地址
    image: new URL("@/assets/img/map/icon_point_jzw.png", import.meta.url)
      .href,
    // 图标所用图片大小
    imageSize: new AMap.Size(28, 33),
    // 图标取图偏移量
    imageOffset: new AMap.Pixel(0, 0),
  }),
  wgyPointSymbol: new AMap.Icon({
    // 图标尺寸
    size: new AMap.Size(28, 33),
    // 图标的取图地址
    image: new URL("@/assets/img/map/icon_point_wgy.png", import.meta.url)
      .href,
    // 图标所用图片大小
    imageSize: new AMap.Size(28, 33),
    // 图标取图偏移量
    imageOffset: new AMap.Pixel(0, 0),
  }),
  sjzsPointSymbol: new AMap.Icon({
    // 图标尺寸
    size: new AMap.Size(28, 33),
    // 图标的取图地址
    image: new URL("@/assets/img/map/icon_point_sjzs.png", import.meta.url)
      .href,
    // 图标所用图片大小
    imageSize: new AMap.Size(28, 33),
    // 图标取图偏移量
    imageOffset: new AMap.Pixel(0, 0),
  }),
  ryzsPointSymbol: new AMap.Icon({
    // 图标尺寸
    size: new AMap.Size(28, 33),
    // 图标的取图地址
    image: new URL("@/assets/img/map/icon_point_ryzs.png", import.meta.url)
      .href,
    // 图标所用图片大小
    imageSize: new AMap.Size(28, 33),
    // 图标取图偏移量
    imageOffset: new AMap.Pixel(0, 0),
  }),
  ynsjPointSymbol: new AMap.Icon({
    // 图标尺寸
    size: new AMap.Size(28, 33),
    // 图标的取图地址
    image: new URL("@/assets/img/map/icon_point_ynsj.png", import.meta.url)
      .href,
    // 图标所用图片大小
    imageSize: new AMap.Size(28, 33),
    // 图标取图偏移量
    imageOffset: new AMap.Pixel(0, 0),
  }),
  zdqyPointSymbol: new AMap.Icon({
    // 图标尺寸
    size: new AMap.Size(28, 33),
    // 图标的取图地址
    image: new URL("@/assets/img/map/icon_point_zdqy.png", import.meta.url)
      .href,
    // 图标所用图片大小
    imageSize: new AMap.Size(28, 33),
    // 图标取图偏移量
    imageOffset: new AMap.Pixel(0, 0),
  }),
  dotGreenSymbol: new AMap.Icon({
    // 图标尺寸
    size: new AMap.Size(33, 33),
    // 图标的取图地址
    image: new URL("@/assets/img/map/icon_dot_green.png", import.meta.url)
      .href,
    // 图标所用图片大小
    imageSize: new AMap.Size(33, 33),
    // 图标取图偏移量
    imageOffset: new AMap.Pixel(0, 0),
  }),
  dotRedSymbol: new AMap.Icon({
    // 图标尺寸
    size: new AMap.Size(33, 33),
    // 图标的取图地址
    image: new URL("@/assets/img/map/icon_dot_red.png", import.meta.url).href,
    // 图标所用图片大小
    imageSize: new AMap.Size(33, 33),
    // 图标取图偏移量
    imageOffset: new AMap.Pixel(0, 0),
  }),
  infoWindow: new AMap.InfoWindow({ offset: new AMap.Pixel(0, -25) }),
};

/**
 * 创建点
 * @param map 地图
 * @param layGroups 点存储
 * @param LngLat 坐标
 * @param symbolName icon
 * @param Pixel 偏移量
 * @param data 自定义数据
 * @param infoWindowContent 弹窗信息
 * @param setFitView 弹窗信息
 */
export const useCreateMarker = (
  map: any,
  layGroups: any,
  LngLat: any[],
  symbolName: string,
  Pixel?: any,
  data?: any,
  infoWindowContent?: any,
  setFitView?: boolean,
) => {
  const marker = new AMap.Marker({
    position: LngLat,
    offset: Pixel,
    icon: symbolData[symbolName as keyof typeof symbolData],
    title: "",
  });
  marker.setExtData({ ...data });
  if (infoWindowContent) {
    marker.on("click", () => {
      symbolData.infoWindow.setContent(infoWindowContent);
      symbolData.infoWindow.open(map, LngLat);
      useChangePointIcon(
        map,
        data,
        layGroups,
        "dotGreenSymbol",
        "dotRedSymbol",
      );
    });
  }

  layGroups.addOverlay(marker);
  setFitView && map.setFitView([marker], true, [60, 60, 60, 300]);
};

/**
 * 更换点icon
 * @param map 地图
 * @param row 点数据
 * @param layer 点存储
 * @param symbol 原icon
 * @param activeSymbol 新icon
 */
export const useChangePointIcon = (
  map: any,
  row: any,
  layer: any,
  symbol: string,
  activeSymbol: string,
) => {
  const group = layer.getOverlays();
  if (group.length) {
    for (const item of group) {
      item.setIcon(symbolData[symbol as keyof typeof symbolData]);
      if (row && row.location && item.getExtData().id === row.id) {
        item.setIcon(symbolData[activeSymbol as keyof typeof symbolData]);
        map.setFitView([item], true, [60, 60, 60, 300]);
      }
    }
  }
};
