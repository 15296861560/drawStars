/*
 * @Description:
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-11-27 01:11:05
 * @LastEditors: lgy
 * @LastEditTime: 2022-12-23 23:59:16
 */
import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const settingInfoStore = defineStore("settingInfo", () => {
  
  const language=ref("zh")
  const getLanguage=computed(()=>language)
  function changeSettingInfo(newVal:string) {
    language.value=newVal;
  }

  return { language, getLanguage,changeSettingInfo }
}, {
  persist: true
});
