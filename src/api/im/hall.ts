/**
 * 社交大厅 API — 推荐 + 搜索房间
 * 路由前缀：/im/hall
 */
import { get } from './base'
import type { ImRoom, PageResult } from './types'

export function hallRooms(
  params: {
    categoryId?: string
    keyword?: string
    curPage?: number
    pageSize?: number
  } = {}
) {
  return get<PageResult<ImRoom>>(
    {
      categoryId: params.categoryId || '',
      keyword: params.keyword || '',
      curPage: params.curPage || 1,
      pageSize: params.pageSize || 20
    },
    '/im/hall/rooms'
  )
}

export default { hallRooms }
