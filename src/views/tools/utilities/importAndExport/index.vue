<template>
  <div>
    <div class="importAndExport">
      <div class="action-row">
        <input type="file" @input="importFile" ref="file" hidden />

        <el-button type="primary" size="small" @click="selectFile">{{
          $t("btn.import")
        }}</el-button>
        <el-button type="primary" size="small" @click="exportFile">{{
          $t("btn.export")
        }}</el-button>
        <el-button type="primary" size="small" @click="getTemplate">{{
          $t("btn.getTemplate")
        }}</el-button>
        <el-button type="primary" size="small" @click="printPage">{{
          $t("btn.print")
        }}</el-button>
      </div>

      <div class="showTable" ref="printcontent">
        <div class="table-th bg-gray-white">
          <table width="100%" cellspacing="0" cellpadding="0" align="center">
            <tr>
              <th style="width: 20%">
                {{ tableThData[0] }}
              </th>
              <th style="width: 20%">
                {{ tableThData[1] }}
              </th>
              <th style="width: 20%">
                {{ tableThData[2] }}
              </th>
              <th style="width: 20%">
                {{ tableThData[3] }}
              </th>
              <th style="width: 20%">
                {{ tableThData[4] }}
              </th>
            </tr>
          </table>
        </div>
        <div class="table-body">
          <table width="100%" cellspacing="0" cellpadding="0" align="center">
            <tr v-for="(item, index) in singelTableTdData" :key="index">
              <td style="width: 20%">{{ index + 1 }}</td>
              <td style="width: 20%">{{ item.Name }}</td>
              <td style="width: 20%">{{ item.Code }}</td>
              <td style="width: 20%">{{ item.CreateTime }}</td>
              <td style="width: 20%">{{ item.UpdateTime }}</td>
            </tr>
          </table>
        </div>
      </div>

      <div style="width: 100%; text-align: center">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="totalCount"
          :current-page.sync="currentPage"
          @current-change="handleCurrentChange"
          :page-size="pageSize"
        >
        </el-pagination>
      </div>
    </div>
  </div>
</template>
<script>
import * as XLSX from "xlsx";

export default {
  data() {
    return {
      inputData: {},
      tableThData: ["序号", "名称", "编码", "创建时间", "更新时间"],
      tableTdData: [],
      singelTableTdData: [],
      excel_data: null,
      currentPage: 1,
      pageSize: 14,
      printing: false,
    };
  },
  computed: {
    //总条数
    totalCount() {
      return this.tableTdData.length;
    },
  },
  watch: {
    // 当前页数
    currentPage(newVal) {
      this.singelTableTdData = this.tableTdData.slice(
        (newVal - 1) * this.pageSize,
        newVal * this.pageSize,
      );
    },
  },
  methods: {
    importFile(e) {
      let file = this.$refs.file.files[0];

      this.getFile(file).then((res) => {
        this.tableTdData = res;
        //显示第一页数据
        this.singelTableTdData = this.tableTdData.slice(0, this.pageSize);
      });
    },
    exportFile() {
      let sheet = XLSX.utils.json_to_sheet(this.tableTdData);
      this.openDownloadDialog(this.sheet2blob(sheet, "sheet"), "exportdata.xlsx");
    },
    selectFile() {
      this.$refs.file.click();
    },
    getFile(f) {
      let promise = new Promise((resolve, reject) => {
        let reader = new FileReader();

        let binary = "";

        let wb; //读取完成的数据

        let outdata;

        reader.onload = function (e) {
          let bytes = new Uint8Array(reader.result);

          let length = bytes.byteLength;

          for (let i = 0; i < length; i++) {
            binary += String.fromCharCode(bytes[i]);
          }

          wb = XLSX.read(binary, {
            type: "binary",
          });

          // outdata就是excel导入的数据
          outdata = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]); // excel 数据再处理

          resolve(outdata);
        };
        try {
          reader.readAsArrayBuffer(f);
        } catch (e) {
          reject(e);
        }
      });

      return promise;
    },

    openDownloadDialog(url, saveName) {
      if (typeof url == "object" && url instanceof Blob) {
        url = URL.createObjectURL(url); // 创建blob地址
      }
      let aLink = document.createElement("a");
      aLink.href = url;
      aLink.download = saveName || "默认文件名.xlsx"; // HTML5新增的属性，指定保存文件名，可以不要后缀，注意，file:///模式下不会生效
      let event;
      if (window.MouseEvent) event = new MouseEvent("click");
      else {
        event = document.createEvent("MouseEvents");
        event.initMouseEvent(
          "click",
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
          null,
        );
      }
      aLink.dispatchEvent(event);
    },
    sheet2blob(sheet, sheetName) {
      sheetName = sheetName || "默认名";
      let workbook = {
        SheetNames: [sheetName],
        Sheets: {},
      };
      workbook.Sheets[sheetName] = sheet;
      // 生成excel的配置项
      let wopts = {
        bookType: "xlsx", // 要生成的文件类型
        bookSST: false, // 是否生成Shared String Table，官方解释是，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
        type: "binary",
      };
      let wbout = XLSX.write(workbook, wopts);
      let blob = new Blob([this.sToBuffer(wbout)], { type: "application/octet-stream" });
      return blob;
    },
    // 字符串转ArrayBuffer

    sToBuffer(s) {
      let buf = new ArrayBuffer(s.length);
      let view = new Uint8Array(buf);
      for (let i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
      return buf;
    },

    printPage() {
      var el = this.$refs.printcontent;
      let iframe = document.createElement("IFRAME");
      var doc = null;
      iframe.setAttribute("id", "print-iframe");
      //设置样式，可视区域不可见
      iframe.setAttribute(
        "style",
        "position:absolute;width:0px;height:0px;left:-100vw;top:-100vh;",
      );
      document.body.appendChild(iframe);
      doc = iframe.contentWindow.document;
      //写入打印内容
      doc.write("<div>" + el.innerHTML + "</div>");
      doc.close();
      iframe.contentWindow.focus();
      //调用打印功能
      iframe.contentWindow.print();
      document.body.removeChild(iframe);
      //调用打印功能
      // window.print();
    },
    handleCurrentChange(currentPage) {},
    getTemplate() {
      window.location.href = "/static/导入模板.xlsx";
    },
  },
  created() {},
};
</script>
<style lang="less" scoped>
.importAndExport {
  display: flex;
  border: 2px solid #f0f0f0;
  border-radius: 5px;
  padding: 1vw;
  flex-direction: column;
  justify-content: space-between;
  .action-row {
    display: flex;
    margin-bottom: 2vh;
    .mr-2vw {
      margin-right: 2vw;
    }
  }
}

.showTable {
  border: 2px solid #f0f0f0;
  border-radius: 5px;
  .table-th {
    border-radius: 5px 5px 0px 0px;
    th {
      color: #666666;
      padding: 0.5vh 0;
      font-weight: bold;
    }
  }

  .table-body {
    height: 50vh;
    overflow: hidden;
    td {
      // color: #00f8ff;
      padding: 0.05rem 0;
      border: 1px solid #f0f0f0;
      text-align: center;
      word-break: break-all;
      overflow: hidden;
      height: 4vh;
      line-height: 4vh;
    }
  }
}
</style>
