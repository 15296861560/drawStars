/*
 * @Description:
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-11-27 01:11:05
 * @LastEditors: lgy
 * @LastEditTime: 2022-12-23 23:57:49
 */
import { ref,reactive, computed } from "vue";
import { defineStore } from "pinia";

export const userInfoStore = defineStore("userInfo", () => {
  
 const userInfo=reactive({
    name: "",
    userId: 0
  }) as UserInfo
  const token=ref('')
  const getUserInfo=computed(()=>userInfo)
  const getUserId=computed(()=>userInfo.userId)
  const getUserName=computed(()=>userInfo.name)
  const getToken=computed(()=>token)
  function changeUserInfo(newVal:UserInfo) {
    userInfo.name=newVal.name;
    userInfo.userId=newVal.userId;
  }

  function updateToken(newVal:string) {
    token.value=newVal;
  }

  return { userInfo, token,getUserInfo,getUserId,getUserName ,getToken,updateToken,changeUserInfo}
}, {
  persist: {
    storage: sessionStorage
  }}
);

interface UserInfo{
  name: String,
  userId: number
}