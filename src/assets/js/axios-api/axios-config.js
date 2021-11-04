import axios from 'axios'
import Vue from 'vue'

axios.defaults.timeout = 30000
// axios.interceptors.request.use(
//   config => {
//     // console.log('请求拦截器',config)      
//     // config.url = Vue.prototype.$vue.$store.getters.getUrl;
//     return config
//   }
// )
// axios.interceptors.response.use(
//   response => {
//     // console.log('回复拦截器',response)     
//     return response
//   },
//   err => {
//     // console.log('报错拦截器',err)    
//     return Promise.reject(err)
//   }
// )

let showError = function (errorMessage) {
  Vue.prototype.$message({
    type: "error",
    message: errorMessage,
  });
}


Vue.prototype.$axios = function (params, methodUrl) {
  let requestUrl = Vue.prototype.$vue.$store.getters.getUrl;

  let promise = new Promise(function (resolve, reject) {
    let url = requestUrl;
    if (methodUrl) url += methodUrl;
    axios.post(url, params, {
      timeout: params.timeout || 30000
    }).then(res => {
      if (!res.data.status) {
        //统一配置请求成功但接口报错时的提示
        showError(res.data.msg);
      }
      resolve(res.data)
    }).catch(err => {
      let errObj = JSON.parse(JSON.stringify(err));
      if (errObj.response) {
        let status = errObj.response.status;
        switch (status) {
          case 400:
            showError("400(Bad request):请求无效 ");
            break;
          case 404:
            showError("404(Not Found):请求的资源不存在");
            break;
          case 500:
            showError("500(Internal Server Error):内部服务器错误");
            break;
          case 504:
            showError("504(Gateway Time-out):请求超时");
            break;
          default:
            showError(errObj.message);
        }
      } else {
        showError(errObj.message);
      }
      reject(err)
    })
  })
  return promise
}
