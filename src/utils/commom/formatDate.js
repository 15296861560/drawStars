// 时间格式化
function formatDate(date, format) {
  let newDate = date || new Date();
  newDate = new Date(date);
  let map = {
    y: newDate.getFullYear(),
    M: newDate.getMonth() + 1,
    d: newDate.getDate(),
    H: newDate.getHours(),
    m: newDate.getMinutes(),
    s: newDate.getSeconds()
  };
  for (let i in map) {
    // 判断一个属性是定义在对象本身而不是继承自原型链
    if (Object.prototype.hasOwnProperty.call(map, i)) {
      if (map[i] < 10) {
        map[i] = '0' + map[i];
      }
    }
  }
  format = format || 'yyyy-MM-dd HH:mm:ss';
  let reg = new RegExp('y+|M+|d+|H+|m+|s+', 'g');
  let regY = new RegExp('y');
  format = format.replace(reg, function (val) {
    let old = val;
    if (regY.test(val)) {
      let y = '' + map.y;
      let l = 4 - val.length;
      old = y.substr(l);
    } else {
      let key = val.substr(0, 1);
      old = map[key];
    }
    return old;
  });
  return format;
}
export default formatDate;
