/**
 * 获取 assets\img 静态资源
 * @param url
 */
export const getAssetsImgFile = (url: string) => {
  return new URL(`@/assets/img/${url}`, import.meta.url).href
}
