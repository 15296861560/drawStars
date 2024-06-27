<template>
  <div class="g-flex-normal">
    <el-row class="w-full mb40" :gutter="20">
      <el-col :span="16">
        <div class="flex">
          <search-item
            v-for="item in searchItems"
            :key="item.field"
            v-model:field="searchInfo[item.field]"
            :label="item.label"
            :type="item.type"
            :placeholder="item.placeholder"
            :options="item.options"
            clearable
            :class="`w-1/${searchItems.length}`"
          ></search-item>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="flex justify-end">
          <el-button type="primary" @click="query">{{ $t("btn.search") }}</el-button>
          <el-button type="warning" @click="reset">{{ $t("btn.reset") }}</el-button>
        </div>
      </el-col>
    </el-row>

    <div class="card-list">
      <el-card class="web-card" v-for="(item, index) in webFrameAddress" :key="item.id">
        <div class="image-container">
          <img :src="item.icon" class="web-image" :title="item.name" />
        </div>
        <div class="web-card__bottom">
          <span class="web-name">{{ item.name }}</span>
          <div class="bottom">
            <time class="time">{{ item.createTime }}</time>
            <el-button text class="button" @click="open(item)">{{
              item.openWay === "newTab" ? "打开" : "进入"
            }}</el-button>
          </div>
        </div>
      </el-card>
    </div>

    <div class="pagination">
      <el-pagination
        v-model:current-page="pageInfo.curPage"
        v-model:page-size="pageInfo.pageSize"
        background
        layout="total,prev, pager,
    next,jumper"
        :total="pageInfo.total"
        @current-change="pageInfo.curPageChange"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref, reactive, computed, defineAsyncComponent } from "vue";
import { useRouter } from "vue-router";
import { showTips } from "@/utils/message/showTips.js";
import {
  queryWebsite,
  getWebsiteCount,
} from "@/assets/js/api/webAdressController/webAdressApi.js";
import i18n from "@/lang/index.js";

const $t = i18n.global.t;

const SearchItem = defineAsyncComponent(
  () => import("@/components/base/SearchItem/index.vue")
);

interface WebObj {
  address: string;
  id: number;
  icon: string;
  name: string;
  openWay: string;
  open_way: string;
  type: string;
  createTime: string;
  create_time: string;
  updateTime: string;
  update_time: string;
}

const OPEN_WAY = {
  newTab: "newTab",
  curWindow: "curWindow",
  module: "module",
};

const openWayOptions = ref([
  {
    label: "新tab页签打开",
    value: "newTab",
  },
  {
    label: "当前窗口打开",
    value: "curWindow",
  },
  {
    label: "进入模块",
    value: "module",
  },
]);
const typeOptions = ref([
  {
    label: "框架",
    value: "frame",
  },
  {
    label: "工具",
    value: "tool",
  },
  {
    label: "资源",
    value: "resource",
  },
  {
    label: "模块",
    value: "module",
  },
]);

const router = useRouter();

const webFrameAddress = ref<Array<WebObj>>([]);
onMounted(() => {
  query();
});

const searchItems = computed(() => [
  {
    field: "name",
    label: "名称",
    placeholder: $t("placeholder.inputName"),
    type: "input",
  },
  {
    field: "address",
    label: "地址",
    placeholder: $t("placeholder.inputAdress"),
    type: "input",
  },
  {
    field: "type",
    label: "类型",
    placeholder: $t("placeholder.inputType"),
    type: "select",
    options: typeOptions.value,
  },
  {
    field: "open_way",
    label: "打开方式",
    placeholder: $t("placeholder.inputOpenWay"),
    type: "select",
    options: openWayOptions.value,
  },
]);

const pageInfo = reactive({
  curPage: 1,
  pageSize: 20,
  total: 100,
  curPageChange: query,
});

const searchInfo = reactive({
  name: "",
  type: "",
  icon: "",
  address: "",
  open_way: "",
});

async function getTotal(params) {
  const result = await getWebsiteCount(params);
  if (result.status) {
    pageInfo.total = result.data[0]?.["COUNT(*)"] || 0;
  } else {
    showTips("error", result.msg);
  }
}

async function query() {
  const params = {
    curPage: pageInfo.curPage,
    pageSize: pageInfo.pageSize,
    ...searchInfo,
  };

  getTotal(params);

  const result = await queryWebsite(params);
  const DEFAULT_IMG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150' viewBox='0 0 200 150'%3E%3Crect fill='%23cccccc' width='200' height='150'%3E%3C/rect%3E%3Ctext fill='%23000000' font-family='Verdana' font-size='20' dy='0.35em' x='50%25' y='50%25' text-anchor='middle'%3E无图片%3C/text%3E%3C/svg%3E`;
  if (result.status) {
    webFrameAddress.value = result.data.map((item: WebObj) => {
      item.createTime = new Date(item.create_time).toLocaleString();
      item.updateTime = new Date(item.update_time).toLocaleString();
      item.openWay = item.open_way;
      if (!item.icon) {
        item.icon = DEFAULT_IMG;
      }
      return item;
    });
  } else {
    showTips("error", result.msg);
  }
}

const reset = () => {
  Object.keys(searchInfo).forEach((key) => {
    searchInfo[key] = "";
  });
  query();
};

function open(openObj: WebObj) {
  switch (openObj.openWay) {
    case OPEN_WAY.newTab:
      window.open(openObj.address);
      break;
    case OPEN_WAY.curWindow:
      window.location.href = openObj.address;
      break;
    case OPEN_WAY.module:
      const { address, name, type } = openObj;
      router.push({ name: "模块", query: { address, name, type } });
      break;
    default:
      break;
  }
}
</script>
<style scoped lang="less">
.web-card {
  width: 12.5rem /* 200/16 */;
  margin: 0.625rem /* 10/16 */;
  .image-container {
    width: 100%;
    display: flex;
    align-items: center;
    height: 7.5rem /* 120/16 */;
    max-height: 7.5rem /* 120/16 */;
    border-radius: 4px;
    overflow: hidden;
    .web-image {
      width: 100%;
      transition: all ease 0.5s;
      &:hover {
        scale: 1.2;
      }
    }
  }
  .web-card__bottom {
    margin-top: 0.625rem /* 10/16 */;
    .web-name {
      font-size: 1rem /* 16/16 */;
      color: @color-text-normal;
    }

    .time {
      font-size: 0.75rem /* 12/16 */;
      color: @color-text-secondary;
      line-height: 1.5;
      text-align: left;
    }

    .bottom {
      margin-top: 0.75rem /* 12/16 */;
      line-height: 0.75rem /* 12/16 */;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .button {
      min-height: auto;
    }
  }
}

.card-list {
  display: flex;
  flex-wrap: wrap;
  height: 70vh;
  overflow: auto;
}

.pagination {
  position: absolute;
  bottom: 100px;
  display: flex;
  justify-content: flex-end;
  width: 85vw;
}
</style>
