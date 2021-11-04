const express = require('express');
const router = express.Router();
const fs = require("fs");
const path = require("path");

// 获取初始模板信息
router.get('/practice/getContent', function (req, res) {
  res.status(200).json({
    "status": true,
    "data": "content"
  });
});

module.exports = router;
