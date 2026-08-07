export default {
  exampleList: [
    {
      explain: '4到16位（字母，数字，下划线，减号）:',
      regExp: '^[a-zA-Z0-9_-]{4,16}$',
      sample: 'user_01'
    },
    {
      explain: '密码强度：最少6位，含大小写、数字与特殊字符:',
      regExp:
        '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*? ])[A-Za-z\\d!@#$%^&*? ]{6,}$',
      sample: 'Aa1234!'
    },
    {
      explain: '正整数:',
      regExp: '^\\d+$',
      sample: '12345'
    },
    {
      explain: '负整数:',
      regExp: '^-\\d+$',
      sample: '-88'
    },
    {
      explain: '整数（含正负）:',
      regExp: '^-?\\d+$',
      sample: '-12'
    },
    {
      explain: '正数（含小数）:',
      regExp: '^(?:[1-9]\\d*|0)(?:\\.\\d+)?$',
      sample: '3.14'
    },
    {
      explain: '数字（含正负与小数）:',
      regExp: '^-?(?:\\d+)(?:\\.\\d+)?$',
      sample: '-0.5'
    },
    {
      explain: 'Email:',
      regExp: '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$',
      sample: 'demo@example.com'
    },
    {
      explain: '手机号码（大陆主流号段）:',
      regExp:
        '^1(?:3\\d|4[5-9]|5[0-35-9]|6[2567]|7[0-8]|8\\d|9[0-35-9])\\d{8}$',
      sample: '13800138000'
    },
    {
      explain: '身份证号（18位）:',
      regExp:
        '^[1-9]\\d{5}(18|19|20)\\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\\d{3}[0-9Xx]$',
      sample: '110101199003074918'
    },
    {
      explain: 'IPv4:',
      regExp:
        '^(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)\\.){3}(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)$',
      sample: '192.168.0.1'
    },
    {
      explain: 'URL（http/https）:',
      regExp: '^https?:\\/\\/(?:[\\w-]+\\.)+[\\w-]+(?:\\/[\\w-./?%&=]*)?$',
      sample: 'https://example.com/path?x=1'
    },
    {
      explain: '十六进制颜色:',
      regExp: '^#(?:[a-fA-F0-9]{6}|[a-fA-F0-9]{3})$',
      sample: '#3a7bfd'
    },
    {
      explain: '日期 YYYY-MM-DD（简单）:',
      regExp: '^\\d{4}-\\d{2}-\\d{2}$',
      sample: '2026-08-08'
    },
    {
      explain: '包含中文:',
      regExp: '[\\u4E00-\\u9FA5]',
      sample: 'Hello世界'
    },
    {
      explain: '仅中文、字母或数字:',
      regExp: '^[\\u4E00-\\u9FA5A-Za-z0-9]+$',
      sample: '工具A1'
    },
    {
      explain: '中国大陆车牌（普通）:',
      regExp:
        '^[\\u4eac\\u6d25\\u6caa\\u6e1d\\u5180\\u8c6b\\u4e91\\u8fbd\\u9ed1\\u6e58\\u7696\\u9c81\\u65b0\\u82cf\\u6d59\\u8d63\\u9102\\u6842\\u7518\\u664b\\u8499\\u9655\\u5409\\u95fd\\u8d35\\u7ca4\\u9752\\u85cf\\u5ddd\\u5b81\\u743c][A-Z][A-HJ-NP-Z0-9]{4}[A-HJ-NP-Z0-9\\u6302\\u5b66\\u8b66\\u6e2f\\u6fb3]$',
      sample: '浙A12345'
    }
  ]
}
