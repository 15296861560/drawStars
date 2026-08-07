/*
 * @Author: “lgy lgy-lgy@qq.com
 * @Date: 2024-06-16 13:46:02
 * @LastEditors: “lgy lgy-lgy@qq.com
 * @LastEditTime: 2024-06-16 13:56:26
 * @FilePath: \drawStars-Vue3\src\utils\commom\importAndExport.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import * as XLSX from 'xlsx'

const importFile = f => {
  const promise = new Promise((resolve, reject) => {
    let reader = new FileReader()

    let binary = ''

    let wb //读取完成的数据

    let outdata

    reader.onload = function (_e) {
      let bytes = new Uint8Array(reader.result as ArrayBuffer)

      let length = bytes.byteLength

      for (let i = 0; i < length; i++) {
        binary += String.fromCharCode(bytes[i])
      }

      wb = XLSX.read(binary, {
        type: 'binary'
      })

      // outdata就是excel导入的数据
      outdata = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]) // excel 数据再处理

      resolve(outdata)
    }
    try {
      reader.readAsArrayBuffer(f)
    } catch (e) {
      reject(e)
    }
  })

  return promise
}

const exportFile = (tableTdData = [], fileName = '导出文件') => {
  let sheet = XLSX.utils.json_to_sheet(tableTdData)
  openDownloadDialog(sheet2blob(sheet, 'sheet'), `${fileName}.xlsx`)
}

const openDownloadDialog = (url, saveName) => {
  if (typeof url == 'object' && url instanceof Blob) {
    url = URL.createObjectURL(url) // 创建blob地址
  }
  let aLink = document.createElement('a')
  aLink.href = url
  aLink.download = saveName || '默认文件名.xlsx' // HTML5新增的属性，指定保存文件名，可以不要后缀，注意，file:///模式下不会生效
  let event
  if (window.MouseEvent) event = new MouseEvent('click')
  else {
    event = document.createEvent('MouseEvents')
    event.initMouseEvent(
      'click',
      true,
      false,
      window,
      0,
      0,
      0,
      0,
      0,
      false,
      false,
      false,
      false,
      0,
      null
    )
  }
  aLink.dispatchEvent(event)
}
const sheet2blob = (sheet, sheetName) => {
  sheetName = sheetName || '默认名'
  const workbook = {
    SheetNames: [sheetName],
    Sheets: {}
  }
  workbook.Sheets[sheetName] = sheet
  // 生成excel的配置项
  const wopts: XLSX.WritingOptions = {
    bookType: 'xlsx', // 要生成的文件类型
    bookSST: false, // 是否生成Shared String Table，官方解释是，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
    type: 'binary'
  }
  const wbout = XLSX.write(workbook, wopts)
  const blob = new Blob([sToBuffer(wbout)], {
    type: 'application/octet-stream'
  })
  return blob
}

// 字符串转ArrayBuffer
const sToBuffer = (s: string) => {
  let buf = new ArrayBuffer(s.length)
  let view = new Uint8Array(buf)
  for (let i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xff
  return buf
}

export { importFile, exportFile }
