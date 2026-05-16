/**
 * 导出 动态处理 api
 * @desc 动态生成api，同模块下函数名不能重复
 * */

import { excludeAPIFiles } from './model-files'

// 导出API
export const modelLoader = () => {
  const modelApi = {}

  // 获取文件
  // 相对当前目录的 glob，避免在 Windows 下 `@/…/**/*.js` 被错误解析导致 build ENOENT
  const files = import.meta.glob(['./**/*.js', './**/*.ts'], {
    eager: true
  })

  Object.keys(files)
    .filter(path => !excludeAPIFiles.includes(path))
    .forEach(path => {
      const name = path.split('/').at(-2) || ''
      const model = (files[path] as any).default || files[path]
      modelApi[name] = model
    })

  return modelApi
}
