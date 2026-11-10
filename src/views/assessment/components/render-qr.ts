/**
 * 本地二维码渲染封装（PRD 4.6.3：禁用外链二维码服务）
 * 依赖项目已安装的 qrcode 包，返回 dataURL 供 <img> 展示或海报 Canvas 绘制。
 */
import QRCode from 'qrcode'

export interface RenderQrOptions {
  size?: number
  dark?: string
  light?: string
}

export async function renderQrDataUrl(
  text: string,
  options: RenderQrOptions = {}
): Promise<string> {
  const { size = 220, dark = '#191636', light = '#f5f0e4' } = options
  try {
    return await QRCode.toDataURL(text, {
      width: size,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark, light }
    })
  } catch (_e) {
    // 生成失败时静默返回空串，调用方回退 FakeQr 占位
    return ''
  }
}
