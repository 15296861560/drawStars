const express = require('express')
// const port = 8010 //发布端口
const port = 8011; //本地测试端口


const server = express()
// 我的基础路由文件.
const mysqlApi = require('./mysql-api.js')
const testApi = require('./test-api.js')
const controller = require('./controller.js')
const agoraApi = require('./agora-api.js')
const translateApi = require('./translate-api.js')
const payApi = require('./pay-api.js')

// json 解析 
server.use(express.json());
server.use(express.urlencoded({
  extended: false
}));

//设置跨域访问
server.all('*', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By", ' 3.2.1')
  next();
});
// 暴露公共资源
server.use(express.static('public'))
server.use('/mysqlApi', mysqlApi)
server.use('/testApi', testApi)
server.use('/controller', controller)
server.use('/agoraApi', agoraApi)
server.use('/translateApi', translateApi)
server.use('/payApi', payApi)


server.listen(port)

console.log(`server run port ${port}`)
