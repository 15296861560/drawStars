/**
 * 导出 动态处理 api
 * @desc 动态生成api，同模块下函数名不能重复
 * */

import { excludeAPIFiles } from "./model-files";

// 导出API
export const modelLoader = () => {
  const modelApi = {};

  // 获取文件
  const files = import.meta.glob(
    ["@/assets/js/api/**/*.js", "@/assets/js/api/**/*.ts"],
    { eager: true }
  );

  Object.keys(files)
    .filter((path) => !excludeAPIFiles.includes(path))
    .forEach((path) => {
      const name = path.split("/").at(-2) || "";
      const model = files[path];
      modelApi[name] = model;
    });

  return modelApi;
};
