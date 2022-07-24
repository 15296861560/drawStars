/*个人资料相关接口*/
import Vue from 'vue';

function queryUserInfo(id) {
  return new Promise((resolve, reject) => {
    let params = {
      id
    };
    Vue.prototype.$axiosGet(params, "/profileApi/queryUserInfo").then((res) => {
      resolve(res)
    }).catch(e => {
      reject(e)
    });
  })
}

function updateUserInfo(userInfo) {
  return new Promise((resolve, reject) => {
    Vue.prototype.$axios(userInfo, "/profileApi/updateUserInfo").then((res) => {
      if (res.status) {
        resolve(res)
      } else {
        reject(res)
      }
    });
  })
}

function changePassword(userInfo) {
  let params = {
    id: userInfo.id,
    password: userInfo.password,
    newPassword: userInfo.newnPassword
  }
  return new Promise((resolve, reject) => {
    Vue.prototype.$axios(params, "/profileApi/updateUserInfo").then((res) => {
      if (res.status) {
        resolve(res)
      } else {
        reject(res)
      }
    });
  })
}

function changePhone(userInfo) {
  let params = {
    id: userInfo.id,
    phone: userInfo.phone,
  }
  return new Promise((resolve, reject) => {
    Vue.prototype.$axios(params, "/profileApi/updateUserInfo").then((res) => {
      if (res.status) {
        resolve(res)
      } else {
        reject(res)
      }
    });
  })
}

export {
  queryUserInfo,
  updateUserInfo,
  changePassword,
  changePhone
};
