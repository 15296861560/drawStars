/**
 * 时间格式化，默认 yyyy-MM-dd HH:mm:ss
 * @param {Date|string|number|null|undefined} date
 * @param {string} [format]
 */
function formatDate(date, format) {
  if (date === null || date === undefined || date === '') {
    return ''
  }
  let newDate
  if (date instanceof Date) {
    newDate = date
  } else if (typeof date === 'number') {
    // 10 位按秒，13 位按毫秒
    newDate = new Date(date < 1e12 ? date * 1000 : date)
  } else {
    newDate = new Date(date)
  }
  if (Number.isNaN(newDate.getTime())) {
    return String(date)
  }
  const map = {
    y: newDate.getFullYear(),
    M: newDate.getMonth() + 1,
    d: newDate.getDate(),
    H: newDate.getHours(),
    m: newDate.getMinutes(),
    s: newDate.getSeconds()
  }
  for (const i in map) {
    if (Object.prototype.hasOwnProperty.call(map, i)) {
      if (map[i] < 10) {
        map[i] = '0' + map[i]
      }
    }
  }
  format = format || 'yyyy-MM-dd HH:mm:ss'
  const reg = /y+|M+|d+|H+|m+|s+/g
  const regY = /y/
  return format.replace(reg, function (val) {
    let old = val
    if (regY.test(val)) {
      const y = '' + map.y
      const l = 4 - val.length
      old = y.substr(l)
    } else {
      const key = val.substr(0, 1)
      old = map[key]
    }
    return old
  })
}
export default formatDate
