const secretKey = ''

const script = document.createElement('script')
script.setAttribute('defer', '')
script.setAttribute(
  'src',
  `https://webapi.amap.com/maps?v=2.0&key=${secretKey}&plugin=AMap.PolygonEditor,AMap.Geocoder,AMap.convertFrom,AMap.MouseTool`
)
document.body.appendChild(script)
