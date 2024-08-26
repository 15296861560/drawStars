/**
 * 导出具体的 axios 请求
 * @export findReq 全局获取模块内的api方法
 * */
import { modelLoader } from "./model-loader";

const model = modelLoader();

export const findReq = (name: string, api: string) => model[name][api];
