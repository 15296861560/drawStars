const express = require('express')

const server = express()
// 我的基础路由文件.
const mysqlApi = require('./mysql-api.js')
const testApi = require('./test-api.js')

// json 解析 
server.use(express.json());
server.use(express.urlencoded({extended: false}));

//设置跨域访问
server.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    next();
});
// 暴露公共资源
server.use(express.static('public'))
server.use('/mysqlApi',mysqlApi)
server.use('/testApi',testApi)
server.listen(8010)

console.log('server run port 8010')
