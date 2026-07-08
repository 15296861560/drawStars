import { readFileSync, writeFileSync } from 'fs'
import dayjs from 'dayjs'

/**
 *
 * 版本号管理文件
 * @param {string} mode 运行时环境
 *
 * */
export const CREATE_VERSION = (mode) => {
  //是否是生产环境
  const IS_PROD = mode === 'production'
  //获取JSON
  const PACKAGE_JSON = require('./package.json')
  //定义版本号
  let VERSION = PACKAGE_JSON.version

  if (IS_PROD) {
    // 读取 package.json 文件
    const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));

    // 解析当前的版本号
    const [major, minor, patch] = packageJson.version.split('.').map(Number);

    // 更新版本号，这里假设每次构建都更新补丁号
    const newVersion = `${major}.${minor}.${patch + 1}`;

    // 更新 package.json 中的版本号
    packageJson.version = newVersion;

    // 将更新后的 package.json 写回文件
    writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));

    VERSION = newVersion
    console.log(`版本号已更新为：${newVersion}`);
  }

  return VERSION
}

/**
 * 版本号打包时间
 * */
export const CREATE_BUILD_TIME = () => dayjs(new Date().getTime()).format('YYYY-MM-DD HH:mm:ss')


