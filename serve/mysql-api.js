const express = require('express')
const router = express.Router()
const db = require('../src/assets/js/db/mysql/base.js')

// 该路由使用的中间件
/*router.use(function timeLog(req, res, next) {
  console.log('Time: ', new Date());
  next();
});*/

// 登录接口，并且验证密码--查询方法的使用案例
router.post('/login', function (req, res) {
  let name = req.body.name;
  let password = req.body.password;
  let errText = '',
    resultData = '';
  db.selectData('select * from user where name = ' + name, (e, r) => {
    if (e) {
      res.status(200).json({
        "status": false,
        "msg": e,
        "data": []
      });
    }
    if (r.length == 0) {
      errText = "账号不存在";
    } else if (password != r[0].password) {
      errText = "密码错误";
    } else {
      errText = "登录成功";
      resultData = r[0];
    }
    res.status(200).json({
      "status": true,
      "msg": errText,
      "data": resultData
    });
  })
});
// 注册接口 增加的方法使用案例
router.post('/register', (req, res) => {
  let errText = '注册成功',
    resultData = 'sccusee';
  let saveData = {
    "name": req.body.name,
    "password": req.body.password,
    "phone": req.body.phone
  };
  db.insertData('user', saveData, (e, r) => {
    if (e) {
      errText = "注册失败";
      res.status(200).json({
        "status": false,
        "msg": errText,
        "data": e
      });
    }
    res.status(200).json({
      "status": true,
      "msg": errText,
      "data": resultData
    });
  })
})
// 注销接口 删除的方法使用案例
router.post('/cancel', (req, res) => {
  let data = {
    phone: req.body.phone
  }
  db.deleteData('user', data, (e, r) => {
    if (e) {
      return res.status(200).json({
        "status": false,
        "msg": "删除失败",
        "data": e
      });
    }
    res.status(200).json({
      "status": true,
      "msg": "删除成功",
      "data": '删除成功'
    });
  });

})
// 修改密码接口 修改的方法使用案例
router.post('/modify', (req, res) => {
  let _where = {
    phone: req.body.phone
  };
  let _set = {
    password: req.body.pwd
  };

  db.updateData('user', _set, _where, (e, r) => {
    if (e) {
      return res.status(200).json({
        "status": false,
        "msg": e,
        "data": ''
      });
    }
    res.status(200).json({
      "status": true,
      "msg": 'ok',
      "data": 'resultData'
    });
  })
})

router.post('/query', function (req, res) {
  let errText = '查询成功',
    resultData = null;
  db.selectData('select id,name,level,phone from user', (e, r) => {
    if (e) {
      errText = "查询失败"
      res.status(200).json({
        "status": false,
        "msg": errText,
        "data": e
      });
    }
    resultData = r;
    res.status(200).json({
      "status": true,
      "msg": errText,
      "data": resultData
    });
  })
});
module.exports = router;
