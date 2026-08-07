/** Simple browser fingerprint hash (not cryptographically strong) */
export function getDeviceFingerprint(): string {
  if (typeof navigator === 'undefined') return 'server'
  const parts = [
    navigator.userAgent,
    navigator.language,
    String(screen.width),
    String(screen.height),
    String(screen.colorDepth),
    String(new Date().getTimezoneOffset()),
    String(navigator.hardwareConcurrency || ''),
    String((navigator as any).deviceMemory || '')
  ]
  return simpleHash(parts.join('|'))
}

export function getDeviceInfo() {
  if (typeof navigator === 'undefined') return {}
  const ua = navigator.userAgent
  let deviceType = 'pc'
  if (/Mobile|Android|iPhone/i.test(ua)) deviceType = 'mobile'
  else if (/iPad|Tablet/i.test(ua)) deviceType = 'tablet'
  return {
    userAgent: ua,
    language: navigator.language,
    platform: navigator.platform,
    deviceType,
    screen: `${screen.width}x${screen.height}`
  }
}

function simpleHash(str: string): string {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  }
  return `fp_${(h >>> 0).toString(16)}`
}
