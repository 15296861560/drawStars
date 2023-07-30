<template>
  <div v-if="errorLogs.length">
    <el-badge :value="errorLogs.length" @click.native="showErrorLog">
      <el-button type="danger">
        <span class="drawstars-icon-bug fontsize-16"></span>
      </el-button>
    </el-badge>

    <el-dialog v-model="dialogTableVisible" append-to-body title="异常捕获" width="70%">
      <el-table :data="errorLogs">
        <el-table-column label="报错路由">
          <template #default="scope">
            <a :href="scope.row.url" target="_blank">
              <el-tag type="success">{{ scope.row.url }}</el-tag>
            </a>
          </template>
        </el-table-column>
        <el-table-column label="错误信息">
          <template #default="scope">
            <el-tag type="danger">
              {{ scope.row.err?.message }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="错误详情" width="120">
          <template #default="scope">
            <el-popover placement="top" width="500" trigger="hover">
              <template #default>
                <div style="color: red">
                  {{ scope.row.err?.stack }}
                </div>
              </template>
              <template #reference>
                <el-button>查看</el-button>
              </template>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="380">
          <template #default="scope">
            <a
              v-for="(item, index) in searchList"
              :key="index"
              :href="item.url + scope.row.err?.message"
              target="_blank"
            >
              <el-button class="ml10" type="primary">
                <el-icon class="mr4">
                  <Search />
                </el-icon>
                {{ item.title }}
              </el-button>
            </a>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogTableVisible = false">取 消</el-button>
          <el-button type="danger" @click="clearAll">
            <el-icon class="mr4">
              <Delete />
            </el-icon>
            暂不显示
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { errorLogStore } from "@/stores/error-log";
const errorLog = errorLogStore();

const dialogTableVisible = ref(false);

const errorLogs = computed(() => {
  return errorLog.getErrorLogs;
});

const showErrorLog = () => {
  dialogTableVisible.value = true;
};
function clearAll() {
  dialogTableVisible.value = false;
  errorLog.clearErrorLog();
}

const searchList = reactive([
  {
    title: "百度搜索",
    url: "https://www.baidu.com/baidu?wd=",
  },
  {
    title: "谷歌搜索",
    url: "https://www.google.com/search?q=",
  },
  {
    title: "Bing搜索",
    url: "https://cn.bing.com/search?q=",
  },
]);
</script>
