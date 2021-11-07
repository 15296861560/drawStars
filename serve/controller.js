const express = require('express');
const router = express.Router();
const fs = require("fs");
const path = require("path");

// 获取初始模板信息
router.post('/practice/getContent', function (req, res) {
  let practice=path.join(__dirname,"static","practice.html");
  let content = fs.readFileSync(practice, "utf-8");
  
  res.status(200).json({
    "status": true,
    "data": content
  });
});

module.exports = router;
