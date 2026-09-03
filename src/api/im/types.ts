/**
 * IM 聊天体系 — 公共类型定义
 * 与后端 src/nest/modules/im/im.constants.ts / im.types.ts 对齐
 */

/** 会话类型 */
export enum ConvType {
  C2C = 'C2C',
  GROUP = 'GROUP',
  ROOM = 'ROOM'
}

/** 消息类型 */
export enum MsgType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  SYSTEM = 'SYSTEM',
  CUSTOM = 'CUSTOM'
}

/** 消息状态 */
export enum MsgStatus {
  SENDING = 'SENDING',
  NORMAL = 'NORMAL',
  RECALLED = 'RECALLED',
  DELETED = 'DELETED'
}

/** 用户资料 IM 状态 */
export enum ProfileStatus {
  ACTIVE = 'ACTIVE',
  MUTED = 'MUTED',
  BANNED = 'BANNED'
}

/** 房间状态 */
export enum RoomStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  BANNED = 'BANNED'
}

/** 举报状态 */
export enum ReportStatus {
  PENDING = 'PENDING',
  HANDLED = 'HANDLED',
  REJECTED = 'REJECTED'
}

/** WS 下行事件名 */
export enum WsEvent {
  MESSAGE = 'MESSAGE',
  RECALL = 'RECALL',
  READ = 'READ',
  MEMBER_JOIN = 'MEMBER_JOIN',
  MEMBER_LEAVE = 'MEMBER_LEAVE',
  KICK = 'KICK',
  MUTE = 'MUTE',
  ROOM_UPDATE = 'ROOM_UPDATE',
  GROUP_UPDATE = 'GROUP_UPDATE',
  PROFILE_UPDATE = 'PROFILE_UPDATE',
  JOIN_REQUEST = 'JOIN_REQUEST',
  IM_TAB_TAKEOVER = 'IM_TAB_TAKEOVER',
  WS_DEGRADED = 'WS_DEGRADED',
  ACK = 'ACK',
  PONG = 'PONG'
}

/** WS 连接状态 */
export enum WsState {
  IDLE = 'IDLE',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  RECONNECTING = 'RECONNECTING',
  DISCONNECTED = 'DISCONNECTED'
}

/** 发送目标（按会话类型定位会话） */
export interface SendTarget {
  convType: ConvType
  bizId: string
}

/** 发消息 DTO（对齐后端 SendMessageDto） */
export interface SendMessagePayload {
  clientMsgId: string
  msgType: MsgType
  content: Record<string, unknown>
  /** 已有会话时直接传 conversationId */
  conversationId?: string
  /** 没有会话 id 时按目标 upsert 会话 */
  target?: SendTarget
  atUserIds?: string[]
  atAll?: boolean
}

/** 发消息返回 */
export interface SendResult {
  conversationId: string
  msgId: string
  seq: number
  serverTime: string
  status: string
}

/** 消息体 */
export interface ImMessage {
  id?: string
  msgId: string
  clientMsgId?: string
  conversationId: string
  senderId: string
  msgType: MsgType
  content: Record<string, unknown>
  seq: number
  status: MsgStatus
  serverTime: string
  atUserIds?: string[]
  atAll?: boolean
}

/** 会话列表项 */
export interface ImConversation {
  id: string
  convType: ConvType
  bizId: string
  pairKey?: string
  lastMsgId?: string
  lastMsgTime?: string
  maxSeq?: number
  status?: string
  /** 当前用户的会话态 */
  unreadCount?: number
  mentionUnread?: number
  isPinned?: boolean
  isMuted?: boolean
  lastReadSeq?: number
  draft?: string
  title?: string
  avatar?: string
}

/** 用户资料 */
export interface ImUserProfile {
  userId: string
  nick: string
  avatar?: string
  signature?: string
  gender?: string
  tags?: string[]
  allowStrangerMsg?: boolean
  showOnline?: boolean
  status?: ProfileStatus
  extra?: Record<string, unknown>
  /** 基础身份字段是否可在本页编辑（false 时仅只读展示，引导去个人中心） */
  baseEditable?: boolean
}

/** 好友关系 */
export interface ImFriendship {
  id: string
  userId: string
  friendId: string
  status: string
  remark?: string
  createdAt?: string
  updatedAt?: string
  /** 关联资料 */
  profile?: ImUserProfile
}

/** 黑名单 */
export interface ImBlacklistItem {
  id: string
  userId: string
  targetId: string
  createdAt?: string
  profile?: ImUserProfile
}

/** 房间 */
export interface ImRoom {
  id: string
  roomId: string
  title: string
  notice?: string
  categoryId?: string
  tags?: string[]
  coverUrl?: string
  joinMode?: string
  speakMode?: string
  anonymousSpeak?: boolean
  maxMembers?: number
  status?: RoomStatus
  ownerId?: string
  official?: boolean
  manualWeight?: number
  onlineCount?: number
  createdAt?: string
}

/** 群组 */
export interface ImGroup {
  id: string
  groupId: string
  title: string
  notice?: string
  groupType?: string
  joinMode?: string
  maxMembers?: number
  ownerId?: string
  status?: string
  createdAt?: string
}

/** 入群/入房申请 */
export interface ImJoinRequest {
  id: string
  targetType: string
  targetId: string
  applicantId: string
  status: string
  remark?: string
  handledBy?: string
  createdAt?: string
  updatedAt?: string
}

/** 分页返回结构 */
export interface PageResult<T> {
  total: number
  list: T[]
  curPage: number
  pageSize: number
  hasMore?: boolean
}

/** 统一接口返回 */
export interface ApiResult<T = unknown> {
  status: boolean
  msg: string
  data: T
}
