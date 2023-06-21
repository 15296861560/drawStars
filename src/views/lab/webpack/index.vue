<!--
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-12-24 14:01:34
 * @LastEditors: lgy
 * @LastEditTime: 2023-06-21 22:41:36
-->
<template>
  <h1>webpack简单示例:控制台查看输出结果</h1>
</template>
<script>
(function (list) {
  function requireFun(file) {
    let exportsObj = {};
    (function (exportsObj, code) {
      eval(code);
    })(exportsObj, list[file]);
    return exportsObj;
  }

  requireFun("index.js");
})({
  "index.js": `var add = requireFun('add.js').default
    var print = requireFun('print.js').default
  console.log(add(1, 2))
  print("lgy")`,
  "add.js": `exportsObj.default = function(a,b){return a + b}`,
  "print.js": `exportsObj.default=function(item){console.log(item)}`,
});
</script>
