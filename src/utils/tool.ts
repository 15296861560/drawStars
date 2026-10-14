/**
 * 获取 assets\img 静态资源
 * @param url
 */
export const getAssetsImgFile = (url: string) => {
  return new URL(`@/assets/img/${url}`, import.meta.url).href
}

/**
 * 计算文件 sha256（Web Crypto，需安全上下文 https/localhost）
 * @param file 原始文件
 * @returns 'sha256:<hex>'，失败返回空字符串
 */
export const getFileSha256 = async (file: File): Promise<string> => {
  if (!file || typeof crypto === 'undefined' || !crypto.subtle) return ''
  try {
    const buf = await file.arrayBuffer()
    const digest = await crypto.subtle.digest('SHA-256', buf)
    const hex = Array.from(new Uint8Array(digest))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    return `sha256:${hex}`
  } catch (e) {
    console.error('计算 sha256 失败：', e)
    return ''
  }
}

/**
 * SemVer 版本号 patch 位自动 +1：'1.2.3' -> '1.2.4'（忽略 prerelease/build 后缀）
 * 非法版本号返回空字符串
 */
export const bumpPatchVersion = (version?: string): string => {
  const m = String(version || '').match(/^(\d+)\.(\d+)\.(\d+)/)
  if (!m) return ''
  return `${m[1]}.${m[2]}.${Number(m[3]) + 1}`
}
