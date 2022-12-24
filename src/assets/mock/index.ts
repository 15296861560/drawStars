/*
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-11-24 23:25:06
 * @LastEditors: lgy
 * @LastEditTime: 2022-11-24 23:33:34
 */
// 首先引入Mock
const Mock = require('mockjs')

// 引入所有的mock文件
require('@/mock/api/home')

// 设置拦截ajax请求的相应时间
Mock.setup({
    timeout: '200-600'
});