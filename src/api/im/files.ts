/**
 * 文件 API — 图片上传预签名
 * 路由前缀：/im/files
 */
import { post } from './base'

export interface PresignResult {
  objectKey: string
  url: string
  uploadPath: string
}

export function presign(mime: string, size: number, ext: string) {
  return post<PresignResult>({ mime, size, ext }, '/im/files/presign')
}

export default { presign }
