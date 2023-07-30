/*
 * @Description:
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-11-27 01:11:05
 * @LastEditors: lgy
 * @LastEditTime: 2023-07-31 00:42:04
 */
import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const errorLogStore = defineStore(
  "errorLog",
  () => {
    const errorLogs = ref([]);
    const getErrorLogs = computed(() => errorLogs.value);
    function addErrorLog(errorLog: never) {
      errorLogs.value.push(errorLog);
    }
    function clearErrorLog() {
      errorLogs.value.splice(0);
    }

    return { getErrorLogs, addErrorLog, clearErrorLog };
  }
);
