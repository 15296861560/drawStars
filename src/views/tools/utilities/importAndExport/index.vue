<template>
  <div class="g-flex-column border-normal utilities-page">
    <div class="importAndExport">
      <div class="m-block m-block--compact">
        <div class="m-block-title m-block-title--compact">
          Excel 导入 / 导出示例
        </div>
        <div class="m-tip">
          支持 .xlsx / .xls /
          .csv。可先「加载示例数据」或「下载模板」，再尝试导入与导出。
        </div>
      </div>

      <div class="action-row">
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          @change="importFile"
          ref="file"
          hidden
        />
        <el-button type="primary" size="small" @click="selectFile">{{
          $t('btn.import')
        }}</el-button>
        <el-button
          type="primary"
          size="small"
          :disabled="!tableTdData.length"
          @click="exportFile"
          >{{ $t('btn.export') }}</el-button
        >
        <el-button type="primary" size="small" @click="loadDemoData">
          加载示例数据
        </el-button>
        <el-button type="primary" size="small" @click="getTemplate">{{
          $t('btn.getTemplate')
        }}</el-button>
        <el-button
          type="primary"
          size="small"
          :disabled="!tableTdData.length"
          @click="printPage"
          >{{ $t('btn.print') }}</el-button
        >
      </div>

      <div class="m-example-panel">
        <div class="m-example-title">核心代码示意</div>
        <pre class="m-code-pre">{{ coreCode }}</pre>
      </div>

      <div class="showTable" ref="printcontent">
        <div class="table-th bg-gray-white">
          <table width="100%" cellspacing="0" cellpadding="0" align="center">
            <tr>
              <th
                v-for="(th, thIndex) in tableThData"
                :key="thIndex"
                style="width: 20%"
              >
                {{ th }}
              </th>
            </tr>
          </table>
        </div>
        <div class="table-body">
          <table
            v-if="singelTableTdData.length"
            width="100%"
            cellspacing="0"
            cellpadding="0"
            align="center"
          >
            <tr v-for="(item, index) in singelTableTdData" :key="index">
              <td style="width: 20%">
                {{ (currentPage - 1) * pageSize + index + 1 }}
              </td>
              <td style="width: 20%">{{ item.Name }}</td>
              <td style="width: 20%">{{ item.Code }}</td>
              <td style="width: 20%">{{ item.CreateTime }}</td>
              <td style="width: 20%">{{ item.UpdateTime }}</td>
            </tr>
          </table>
          <div v-else class="m-empty">
            暂无数据，请导入 Excel 或点击「加载示例数据」
          </div>
        </div>
      </div>

      <div class="pager-wrap">
        <el-pagination
          background
          layout="total, prev, pager, next"
          :total="totalCount"
          v-model:current-page="currentPage"
          @current-change="handleCurrentChange"
          :page-size="pageSize"
        />
      </div>
    </div>
  </div>
</template>
<script>
import * as XLSX from 'xlsx'
import { ElMessage } from 'element-plus'

const ALLOWED_EXT = ['.xlsx', '.xls', '.csv']

function pad2(n) {
  return String(n).padStart(2, '0')
}

function formatDate(date) {
  return (
    date.getFullYear() +
    '-' +
    pad2(date.getMonth() + 1) +
    '-' +
    pad2(date.getDate()) +
    ' ' +
    pad2(date.getHours()) +
    ':' +
    pad2(date.getMinutes()) +
    ':' +
    pad2(date.getSeconds())
  )
}

function createDemoRows() {
  const now = Date.now()
  return Array.from({ length: 28 }, (_, i) => {
    const create = new Date(now - (28 - i) * 86400000)
    const update = new Date(create.getTime() + 3600000)
    return {
      Name: '示例项目-' + (i + 1),
      Code: 'CODE-' + pad2(i + 1),
      CreateTime: formatDate(create),
      UpdateTime: formatDate(update)
    }
  })
}

export default {
  data() {
    return {
      tableThData: ['序号', '名称', '编码', '创建时间', '更新时间'],
      tableTdData: [],
      singelTableTdData: [],
      currentPage: 1,
      pageSize: 14,
      importing: false,
      coreCode:
        '// 导入\n' +
        "const wb = XLSX.read(buffer, { type: 'array' })\n" +
        'const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])\n\n' +
        '// 导出\n' +
        'const sheet = XLSX.utils.json_to_sheet(rows)\n' +
        'const wbOut = XLSX.utils.book_new()\n' +
        "XLSX.utils.book_append_sheet(wbOut, sheet, 'sheet')\n" +
        "XLSX.writeFile(wbOut, 'exportdata.xlsx')"
    }
  },
  computed: {
    totalCount() {
      return this.tableTdData.length
    }
  },
  watch: {
    currentPage(newVal) {
      this.updatePageData(newVal)
    },
    tableTdData() {
      this.updatePageData(this.currentPage)
    }
  },
  methods: {
    updatePageData(page) {
      const start = (page - 1) * this.pageSize
      this.singelTableTdData = this.tableTdData.slice(
        start,
        start + this.pageSize
      )
    },
    selectFile() {
      this.$refs.file.value = ''
      this.$refs.file.click()
    },
    getExt(name) {
      const idx = String(name || '').lastIndexOf('.')
      return idx >= 0 ? name.slice(idx).toLowerCase() : ''
    },
    async importFile() {
      if (this.importing) return
      const file = this.$refs.file.files[0]
      if (!file) return
      const ext = this.getExt(file.name)
      if (!ALLOWED_EXT.includes(ext)) {
        ElMessage.warning('仅支持 ' + ALLOWED_EXT.join(' / ') + ' 文件')
        return
      }
      this.importing = true
      try {
        const rows = await this.getFile(file)
        this.tableTdData = Array.isArray(rows) ? rows : []
        this.currentPage = 1
        this.updatePageData(1)
        ElMessage.success('导入成功，共 ' + this.tableTdData.length + ' 行')
      } catch (e) {
        ElMessage.error('导入失败：' + (e && e.message ? e.message : e))
      } finally {
        this.importing = false
      }
    },
    exportFile() {
      if (!this.tableTdData.length) {
        ElMessage.warning('暂无可导出数据')
        return
      }
      const sheet = XLSX.utils.json_to_sheet(this.tableTdData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, sheet, 'sheet')
      XLSX.writeFile(workbook, 'exportdata.xlsx')
      ElMessage.success('导出成功')
    },
    loadDemoData(showTip = true) {
      this.tableTdData = createDemoRows()
      this.currentPage = 1
      this.updatePageData(1)
      if (showTip) {
        ElMessage.success('已加载示例数据')
      }
    },
    getFile(f) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = function (e) {
          try {
            const data = new Uint8Array(e.target.result)
            const wb = XLSX.read(data, { type: 'array' })
            const sheet = wb.Sheets[wb.SheetNames[0]]
            const outdata = XLSX.utils.sheet_to_json(sheet)
            resolve(outdata)
          } catch (err) {
            reject(err)
          }
        }
        reader.onerror = function () {
          reject(new Error('文件读取失败'))
        }
        reader.readAsArrayBuffer(f)
      })
    },
    printPage() {
      if (!this.tableTdData.length) {
        ElMessage.warning('暂无可打印数据')
        return
      }
      const el = this.$refs.printcontent
      const iframe = document.createElement('iframe')
      iframe.setAttribute('id', 'print-iframe')
      iframe.setAttribute(
        'style',
        'position:absolute;width:0;height:0;left:-100vw;top:-100vh;'
      )
      document.body.appendChild(iframe)
      const doc = iframe.contentWindow.document
      doc.write('<div>' + el.innerHTML + '</div>')
      doc.close()
      iframe.contentWindow.focus()
      iframe.contentWindow.print()
      document.body.removeChild(iframe)
    },
    handleCurrentChange(page) {
      this.updatePageData(page)
    },
    getTemplate() {
      const templateRows = [
        {
          Name: '示例名称',
          Code: 'CODE-01',
          CreateTime: '2026-01-01 10:00:00',
          UpdateTime: '2026-01-02 11:00:00'
        }
      ]
      const sheet = XLSX.utils.json_to_sheet(templateRows)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, sheet, 'template')
      XLSX.writeFile(workbook, '导入模板.xlsx')
      ElMessage.success('模板已下载')
    }
  },
  created() {
    this.loadDemoData(false)
  }
}
</script>
<style lang="less" scoped>
.utilities-page {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  align-items: stretch;
  flex-wrap: nowrap;
  overflow-x: hidden;
}

.importAndExport {
  display: flex;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  border: 2px solid #f0f0f0;
  border-radius: 5px;
  padding: 1vw;
  flex-direction: column;
  justify-content: space-between;
  overflow-x: hidden;

  .m-block--compact {
    width: 100%;
    max-width: 100%;
    padding: 0;
    margin-bottom: 16px;
    box-sizing: border-box;
  }

  .m-block-title--compact {
    margin-bottom: 12px;
  }

  .action-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 2vh;
    max-width: 100%;
  }

  .m-tip {
    color: #666;
    font-size: 13px;
    line-height: 1.6;
    word-break: break-word;
  }

  .m-example-panel {
    width: 100%;
    max-width: 100%;
    margin-bottom: 16px;
    padding: 12px 14px;
    background: #f5f5f5;
    border-radius: 6px;
    box-sizing: border-box;
    overflow: hidden;
  }

  .m-example-title {
    font-size: 14px;
    margin-bottom: 8px;
    color: #333;
  }

  .m-code-pre {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-all;
    overflow-wrap: anywhere;
    color: #c7254e;
    font-family: Consolas, Monaco, monospace;
    font-size: 13px;
    line-height: 1.5;
    max-width: 100%;
  }

  .pager-wrap {
    width: 100%;
    max-width: 100%;
    text-align: center;
    margin-top: 12px;
    overflow-x: hidden;
  }
}

.showTable {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  border: 2px solid #f0f0f0;
  border-radius: 5px;
  overflow-x: hidden;

  table {
    width: 100%;
    table-layout: fixed;
  }

  .table-th {
    border-radius: 5px 5px 0 0;
    th {
      color: #666666;
      padding: 0.5vh 0;
      font-weight: bold;
      word-break: break-all;
    }
  }

  .table-body {
    min-height: 30vh;
    max-height: 50vh;
    overflow-x: hidden;
    overflow-y: auto;
    td {
      padding: 0.05rem 0;
      border: 1px solid #f0f0f0;
      text-align: center;
      word-break: break-all;
      overflow: hidden;
      height: 4vh;
      line-height: 4vh;
    }
  }

  .m-empty {
    padding: 48px 16px;
    text-align: center;
    color: #999;
  }
}
</style>
