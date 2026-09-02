/*
 * @Description: 根据当前路由解析菜单应高亮的 index
 */
/**
 * 优先精确匹配；未命中时取最长「按路径段」前缀匹配，
 * 保证跳转子页/详情页（如 /home/a/b 命中 /home/a）时菜单仍有选中态。
 */
export function resolveActiveMenuIndex(
  path: string,
  candidates: string[]
): string {
  if (!path) return path
  const list = (candidates || []).filter(Boolean)
  if (list.includes(path)) return path
  const segments = path.split('/')
  for (let i = segments.length - 1; i >= 1; i--) {
    const prefix = segments.slice(0, i).join('/')
    if (prefix && list.includes(prefix)) return prefix
  }
  return path
}
