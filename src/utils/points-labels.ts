import { PointsSource, PointsType } from '@/types/points'

/** 积分来源中文 */
export const POINTS_SOURCE_LABELS: Record<string, string> = {
  [PointsSource.CHECK_IN]: '签到',
  [PointsSource.PURCHASE]: '消费',
  [PointsSource.INVITE_FRIEND]: '邀请好友',
  [PointsSource.COMPLETE_TASK]: '完成任务',
  [PointsSource.EVENT_REWARD]: '活动奖励',
  [PointsSource.REVIEW]: '评价',
  [PointsSource.SHARE]: '分享',
  [PointsSource.ADMIN_ADJUST]: '管理员调整',
  [PointsSource.OTHER]: '其他'
}

/** 积分类型中文 */
export const POINTS_TYPE_LABELS: Record<string, string> = {
  [PointsType.GENERAL]: '通用积分',
  [PointsType.CONSUMPTION]: '消费积分',
  [PointsType.EVENT]: '活动积分',
  [PointsType.INVITATION]: '邀请积分'
}

export function pointsSourceLabel(value?: string | null) {
  if (!value) return '-'
  return POINTS_SOURCE_LABELS[value] || value
}

export function pointsTypeLabel(value?: string | null) {
  if (!value) return '-'
  return POINTS_TYPE_LABELS[value] || value
}

export const pointsSourceOptions = Object.entries(POINTS_SOURCE_LABELS).map(
  ([value, label]) => ({ label, value })
)

export const pointsTypeOptions = Object.entries(POINTS_TYPE_LABELS).map(
  ([value, label]) => ({ label, value })
)
