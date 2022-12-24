/*
 * @Description:
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-11-27 01:11:05
 * @LastEditors: lgy
 * @LastEditTime: 2022-12-23 23:59:51
 */
import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const apiInfoStore = defineStore("apiInfo", () => {
  
  const url=ref('/api')
  const getURL=computed(()=>url)
  function changeApi(newVal:string) {
    url.value=newVal;
  }

  return { url, getURL,changeApi }
}, {
  persist: {
    storage: sessionStorage
  }});
