const fs = require('fs');
const path = require('path');

// 先在运行环境安装对应依赖包
// yarn add @babel/parser
// yarn add @babel/traverse
// yarn add @babel/core
// yarn add @babel/preset-env

const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const babel = require('@babel/core');

function getModuleInfo(file) {
  // 读取⽂件
  const body = fs.readFileSync(file, 'utf-8');
  // 转化AST语法树
  const ast = parser.parse(body, {
    sourceType: 'module', // 表示要解析的是ES模块
  });
  console.log('ast:', ast);
  // 依赖收集
  const deps = {};
  traverse(ast, {
    // visitor
    ImportDeclaration({
      node
    }) {
      const dirname = path.dirname(file);
      const abspath = './' + path.join(dirname, node.source.value);
      deps[node.source.value] = abspath;
    },
  });
  // ES6转成ES5
  const {
    code
  } = babel.transformFromAst(ast, null, {
    presets: ['@babel/preset-env'],
  });
  const moduleInfo = {
    file,
    deps,
    code
  };
  return moduleInfo;
}
const info = getModuleInfo('./index.js');
console.log('info:', info);

// 模块解析
function parseModules(file) {
  const entry = getModuleInfo(file);
  const temp = [entry];
  const depsGraph = {};
  getDeps(temp, entry);
  temp.forEach(moduleInfo => {
    depsGraph[moduleInfo.file] = {
      deps: moduleInfo.deps,
      code: moduleInfo.code,
    };
  });
  return depsGraph;
}

// 获取依赖图
function getDeps(temp, {
  deps
}) {
  Object.keys(deps).forEach(key => {
    const child = getModuleInfo(deps[key]);
    temp.push(child);
    getDeps(temp, child);
  });
}
const depsGraph = parseModules('./index.js');
console.log('depsGraph', depsGraph);


// ⽣成bundle⽂件（打包）
function bundle(file) {
  const depsGraph = JSON.stringify(parseModules(file));

  return `(function (graph) {
    function require(file) {
      function absRequire(relPath) {
        return require(graph[file].deps[relPath])
      }
      var exports = {};
      (function (require, exports, code) {
        eval(code)
      })(absRequire, exports, graph[file].code)
      return exports
    }
    require('${file}')
  })(${depsGraph})`;


}
// 不存在dist文件夹则创建一个dist文件夹
const content = bundle('./index.js');
if (!fs.existsSync('./dist')) {
  fs.mkdirSync('./dist');
}
fs.writeFileSync('./dist/bundle.js', content);


