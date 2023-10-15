let DateFormet = {};

// 时分秒
DateFormet.FormetHMS = function (et) {
  let newDate = new Date(et);
  let h = newDate.getHours();
  let m = newDate.getMinutes();
  m = (m < 10) ? `0${m}` : m;
  let s = newDate.getSeconds();
  s = (s < 10) ? `0${s}` : s;
  let hms = `${h}:${m}:${s}`;
  return hms;
};
// 时分
DateFormet.FormetHM = function (et) {
  let newDate = new Date(et);
  let h = newDate.getHours();
  let m = newDate.getMinutes();
  m = (m < 10) ? `0${m}` : m;
  let hm = `${h}:${m}`;
  return hm;
};
// 年月日
DateFormet.FormetYMD = function (et) {
  let newDate = new Date(et);
  let y = newDate.getFullYear();
  let mon = newDate.getMonth() + 1 >= 10 ? newDate.getMonth() + 1 : `0${newDate.getMonth() + 1}`;
  let d = newDate.getDate() >= 10 ? newDate.getDate() : `0${newDate.getDate()}`;
  let YMonD = `${y}-${mon}-${d}`;
  return YMonD;
};
// 年月日时分秒
DateFormet.FormetYMDHMS = function (et) {
  let newDate = new Date(et);
  let y = newDate.getFullYear();
  let mon = newDate.getMonth() + 1;
  let d = newDate.getDate();
  let YMonD = newDate.toLocaleDateString();
  let h = newDate.getHours();
  h = (h < 10) ? `0${h}` : h;
  let m = newDate.getMinutes();
  m = (m < 10) ? `0${m}` : m;
  let s = newDate.getSeconds();
  s = (s < 10) ? `0${s}` : s;
  let YMonDhms = `${y}/${mon}/${d} ${h}:${m}:${s}`;
  return YMonDhms;
};

DateFormet.FormetMDHMS = function (et) {
  if (et == null || et == '') {
    return '';
  }
  let newDate = new Date(et);
  let y = newDate.getFullYear();
  let mon = newDate.getMonth() + 1;
  let d = newDate.getDate();
  let YMonD = newDate.toLocaleDateString();
  let h = newDate.getHours();
  h = (h < 10) ? `0${h}` : h;
  let m = newDate.getMinutes();
  m = (m < 10) ? `0${m}` : m;
  let s = newDate.getSeconds();
  s = (s < 10) ? `0${s}` : s;
  let MonDhms = `${mon}/${d} ${h}:${m}:${s}`;
  return MonDhms;
};

// 年月日时分
DateFormet.FormetYMDHM = function (et) {
  let newDate = new Date(et);
  let y = newDate.getFullYear();
  let mon = newDate.getMonth() + 1;
  let d = newDate.getDate();
  // let YMonD = newDate.toLocaleDateString();
  let h = newDate.getHours();
  h = (h < 10) ? `0${h}` : h;
  let m = newDate.getMinutes();
  m = (m < 10) ? `0${m}` : m;
  let YMonDhms = `${y}/${mon}/${d} ${h}:${m}`;
  return YMonDhms;
};

DateFormet.getWeekDay = function (et) {
  let newDate = new Date(et);
  let day = newDate.getDay();
  let weekday = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  return weekday[day];
};

DateFormet.FormetMDY = function (et) {
  let newDate = new Date(et);
  let y = newDate.getFullYear();
  let mon = newDate.getMonth() + 1 >= 10 ? newDate.getMonth() + 1 : `0${newDate.getMonth() + 1}`;
  let d = newDate.getDate() >= 10 ? newDate.getDate() : `0${newDate.getDate()}`;
  let YMonD = `${mon}/${d}/${y}`;
  return YMonD;
},
/**
         * 对Date的扩展，将 Date 转化为指定格式的String
         * 月(M)、日(d)、12小时(h)、24小时(H)、分(m)、秒(s)、周(E)、季度(q) 可以用 1-2 个占位符
         * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
         * eg:
         * (new Date()).pattern("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
         * (new Date()).pattern("yyyy-MM-dd E HH:mm:ss") ==> 2009-03-10 二 20:09:04
         * (new Date()).pattern("yyyy-MM-dd EE hh:mm:ss") ==> 2009-03-10 周二 08:09:04
         * (new Date()).pattern("yyyy-MM-dd EEE hh:mm:ss") ==> 2009-03-10 星期二 08:09:04
         * (new Date()).pattern("yyyy-M-d h:m:s.S") ==> 2006-7-2 8:9:4.18
         */
DateFormet.pattern = function (dt, fmt) {
  if (dt == null || dt == undefined) {
    return;
  }
  let date = new Date(dt);
  let o = {
    'M+': date.getMonth() + 1, // 月份
    'd+': date.getDate(), // 日
    'h+': date.getHours() % 12 == 0 ? 12 : date.getHours() % 12, // 小时
    'H+': date.getHours(), // 小时
    'm+': date.getMinutes(), // 分
    's+': date.getSeconds(), // 秒
    'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
    'S': date.getMilliseconds() // 毫秒
  };
  let week = {
    '0': '\u65e5',
    '1': '\u4e00',
    '2': '\u4e8c',
    '3': '\u4e09',
    '4': '\u56db',
    '5': '\u4e94',
    '6': '\u516d'
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  if (/(E+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? '\u661f\u671f' : '\u5468') : '') + week[date.getDay() + '']);
  }
  for (let k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
    }
  }
  return fmt;
};



export default DateFormet;