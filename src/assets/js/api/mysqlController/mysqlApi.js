/*
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-07-25 00:05:13
 * @LastEditors: lgy
 * @LastEditTime: 2022-12-17 23:09:28
 */
/*mysql数据库操作相关接口*/
import {
    $axios
} from "@/assets/js/axios-api/axios-config.js";

/**
 * @description: 查询
 * @param {} params
 * @return {*}
 * @author: lgy
 */
function query(params) {
    return new Promise((resolve, reject) => {
        $axios(params, "/mysqlApi/query").then((res) => {
            resolve(res)
        });
    })
}

/**
 * @description: 插入
 * @param {} params
 * @return {*}
 * @author: lgy
 */
function register(params) {
    return new Promise((resolve, reject) => {
        $axios(params, "/mysqlApi/register").then((res) => {
            resolve(res)
        });
    })
}

/**
 * @description: 删除
 * @param {} params
 * @return {*}
 * @author: lgy
 */
function cancel(params) {
    return new Promise((resolve, reject) => {
        $axios(params, "/mysqlApi/cancel").then((res) => {
            resolve(res)
        });
    })
}

/**
 * @description: 执行SQL
 * @param {} params
 * @return {*}
 * @author: lgy
 */
function excuteSQL(params) {
    return new Promise((resolve, reject) => {
        $axios(params, "/mysqlApi/sql").then((res) => {
            resolve(res)
        });
    })
}

export {
    query,
    register,
    cancel,
    excuteSQL
};