/**
 * Reverse geocode via AMap JS API (key loaded from app_info through /amapApi/getMapApiKey).
 */
import { ensureAmapReady } from '@/plugins/amap/index.js'

async function reverseGeocodeViaAMap(
  lng: number,
  lat: number
): Promise<string> {
  try {
    await ensureAmapReady()
  } catch (_e) {
    return ''
  }
  const AMap = (window as any).AMap
  if (!AMap?.Geocoder) return ''

  // Browser geolocation is WGS84; AMap expects GCJ-02 in China.
  const convertLngLat = (): Promise<[number, number]> =>
    new Promise(resolve => {
      if (!AMap.convertFrom) {
        resolve([lng, lat])
        return
      }
      AMap.convertFrom([lng, lat], 'gps', (status: string, result: any) => {
        if (status === 'complete' && result?.locations?.[0]) {
          const p = result.locations[0]
          resolve([p.lng, p.lat])
        } else {
          resolve([lng, lat])
        }
      })
    })

  const [gcjLng, gcjLat] = await convertLngLat()

  return new Promise(resolve => {
    try {
      const geocoder = new AMap.Geocoder({ radius: 1000 })
      geocoder.getAddress([gcjLng, gcjLat], (status: string, result: any) => {
        if (status === 'complete' && result?.regeocode?.formattedAddress) {
          resolve(String(result.regeocode.formattedAddress))
        } else {
          resolve('')
        }
      })
    } catch (_e) {
      resolve('')
    }
  })
}

/** Resolve human-readable address from WGS84 lng/lat */
export async function reverseGeocode(
  lng: number,
  lat: number
): Promise<string> {
  if (Number.isNaN(lng) || Number.isNaN(lat)) return ''
  return reverseGeocodeViaAMap(lng, lat)
}
