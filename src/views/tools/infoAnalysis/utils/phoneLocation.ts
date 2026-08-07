import type { PhoneLocationResult } from '../types'

const PHONE_REG = /^1[3-9]\d{9}$/

/** Common mobile number prefixes -> carrier (local fallback). */
const CARRIER_PREFIX: Record<string, string> = {
  '134': '中国移动',
  '135': '中国移动',
  '136': '中国移动',
  '137': '中国移动',
  '138': '中国移动',
  '139': '中国移动',
  '147': '中国移动',
  '148': '中国移动',
  '150': '中国移动',
  '151': '中国移动',
  '152': '中国移动',
  '157': '中国移动',
  '158': '中国移动',
  '159': '中国移动',
  '172': '中国移动',
  '178': '中国移动',
  '182': '中国移动',
  '183': '中国移动',
  '184': '中国移动',
  '187': '中国移动',
  '188': '中国移动',
  '195': '中国移动',
  '197': '中国移动',
  '198': '中国移动',
  '130': '中国联通',
  '131': '中国联通',
  '132': '中国联通',
  '145': '中国联通',
  '146': '中国联通',
  '155': '中国联通',
  '156': '中国联通',
  '166': '中国联通',
  '167': '中国联通',
  '171': '中国联通',
  '175': '中国联通',
  '176': '中国联通',
  '185': '中国联通',
  '186': '中国联通',
  '196': '中国联通',
  '133': '中国电信',
  '149': '中国电信',
  '153': '中国电信',
  '173': '中国电信',
  '174': '中国电信',
  '177': '中国电信',
  '180': '中国电信',
  '181': '中国电信',
  '189': '中国电信',
  '190': '中国电信',
  '191': '中国电信',
  '193': '中国电信',
  '199': '中国电信',
  '162': '中国电信',
  '165': '中国联通',
  '170': '虚拟运营商'
}

function emptyResult(message: string, phone = ''): PhoneLocationResult {
  return {
    valid: false,
    message,
    phone,
    province: '',
    city: '',
    carrier: '',
    areaCode: '',
    zipCode: '',
    source: 'local'
  }
}

function detectCarrier(phone: string): string {
  return (
    CARRIER_PREFIX[phone.slice(0, 3)] ||
    CARRIER_PREFIX[phone.slice(0, 4)] ||
    '未知运营商'
  )
}

function localFallback(phone: string): PhoneLocationResult {
  return {
    valid: true,
    message: '已根据号段识别运营商（归属地需网络查询）',
    phone,
    province: '未知',
    city: '未知',
    carrier: detectCarrier(phone),
    areaCode: '',
    zipCode: '',
    source: 'local'
  }
}

/**
 * Query phone number attribution.
 * Tries a public API first; falls back to local carrier detection.
 * Later can switch to backend: findReq('infoAnalysisController', 'phoneLocation')
 */
export async function queryPhoneLocation(
  raw: string
): Promise<PhoneLocationResult> {
  const phone = String(raw || '').trim()
  if (!phone) return emptyResult('请输入手机号码')
  if (!PHONE_REG.test(phone)) {
    return emptyResult('手机号码格式不正确', phone)
  }

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 6000)
    const res = await fetch(`/phoneAreaApi/phonearea.php?number=${phone}`, {
      signal: controller.signal
    })
    clearTimeout(timer)
    if (!res.ok) return localFallback(phone)
    const data = await res.json()
    if (data && data.code === 0 && data.data) {
      const d = data.data
      return {
        valid: true,
        message: '查询成功',
        phone,
        province: d.province || '未知',
        city: d.city || '未知',
        carrier: d.sp || detectCarrier(phone),
        areaCode: '',
        zipCode: '',
        source: 'api'
      }
    }
    return localFallback(phone)
  } catch {
    return localFallback(phone)
  }
}
