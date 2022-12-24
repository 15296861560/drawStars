/*
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-07-25 00:05:13
 * @LastEditors: lgy
 * @LastEditTime: 2022-12-17 22:26:39
 */
import {
    $axios
} from "@/assets/js/axios-api/axios-config.js";

/**
 * @description: 获取提交信息
 * @param {
 * phone:String,
 * password:String
 * } params
 * @return {*}
 * @author: lgy
 */
function getCommitInfo() {
    return new Promise((resolve, reject) => {
        $axios({}, "/controller/getCommitInfo").then((res) => {
            if (res.status) {
                resolve(res)
            } else {
                reject(res)
            }
        });
    })
}
/**
 * @description: 模板
 * @param {} 
 * @return {*}
 * @author: lgy
 */
function getContent() {
    return new Promise((resolve, reject) => {
        $axios({}, "/controller/practice/getContent").then((res) => {
            resolve(res)
        });
    })
}
/**
 * @description: 压缩代码
 * @param {} 
 * @return {*}
 * @author: lgy
 */
function compressCode(params) {
    return new Promise((resolve, reject) => {
        $axios(params, "/controller/compressCode").then((res) => {
            resolve(res)
        });
    })
}

export {
    getCommitInfo,
    getContent,
    compressCode
};