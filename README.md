# DrawStars

基于 **Vue 3 + Vite + TypeScript** 的前端学习与演示项目，用于沉淀前端相关知识、技巧以及可复用的功能示例。


## 技术栈

- **框架**：Vue 3、Vue Router 4、Pinia（含持久化 `pinia-plugin-persistedstate`）
- **构建**：Vite 3、`vue-tsc` 类型检查；包管理 **pnpm**
- **UI**：Element Plus、`draw-stars-ui`、`@element-plus/icons-vue`
- **样式**：Less、Tailwind CSS
- **图表与地图**：ECharts、Leaflet、百度地图 / 高德地图
- **网络与数据**：axios（含请求缓存）、Mock.js、WebSocket、xlsx
- **多媒体与实时**：Video.js、Agora RTC/RTM
- **其他**：vue-i18n、nprogress、`@vueuse/core`、Sortable.js、lodash

## 环境要求

- **Node.js**：建议 16.x 及以上
- **pnpm**：建议 9.x（与根目录 `pnpm-lock.yaml` 的 lockfile v9 一致）

未安装 pnpm 时，可用 [Corepack](https://pnpm.io/installation#using-corepack)（Node 16.13+ 自带）启用：

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

> 本项目以 **pnpm** 管理依赖，请使用 `pnpm-lock.yaml` 安装，勿混用 `npm install` / `yarn`，以免锁文件不一致。

## 快速开始

```bash
# 安装依赖（依据 pnpm-lock.yaml）
pnpm install

# 启动开发服务（默认端口 8081）
pnpm dev

# 生产构建
pnpm build

# 本地预览构建产物
pnpm preview
```

### pnpm 相关配置

- **`pnpm-lock.yaml`**：依赖锁定文件，提交到仓库，协作与 CI 均应执行 `pnpm install`。
- **`pnpm-workspace.yaml`**：单包仓库，仅声明根目录 `packages: ["."]`。
- **`package.json` → `pnpm.overrides`**：统一 `@intlify/*` 版本，避免 `vue-i18n` 与 Vite 插件之间的 peer 冲突。

### 本地预览（无需后端）

根目录 `.env` 中可设置：

```env
VITE_SKIP_LOGIN=true
```

为 `true` 时（`src/config/skip-login.ts`）会跳过登录校验并写入本地模拟会话，便于只浏览前端页面。完整接口能力（登录、资料、支付、通知等）仍需配合后端服务。

### 联调后端 API

`vite.config.ts` 将 `/api`、`/uploadImg` 代理到 `http://127.0.0.1:8011`。请确保对应后端已启动，或将 `target` 改为你的服务地址。

开发环境下 axios 通过 Vite 代理访问接口；生产环境 baseURL 在 `src/assets/js/axios-api/axios-config.js` 中配置（默认指向 `http://127.0.0.1:8010/`）。

## 常用脚本

以下命令均通过 `pnpm <script>` 执行（`pnpm dev` 等价于 `pnpm run dev`）。

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 启动 Vite 开发服务器（`--port 8081`） |
| `pnpm build` | 生产构建 |
| `pnpm release` | 以 production 环境变量构建 |
| `pnpm preview` | 预览构建结果 |
| `pnpm type-check` | Vue/TS 类型检查（`vue-tsc --noEmit`） |
| `pnpm lint` | ESLint 检查 `src` |
| `pnpm lint:fix` / `pnpm fix` | 自动修复 ESLint 问题 |
| `pnpm format` | ESLint 修复 + Prettier 格式化 |
| `pnpm prettier` | Prettier 格式化项目 |
| `pnpm svgtofont` | 将 SVG 转为图标字体 |
| `pnpm update-css` | Tailwind：监听编译 `input.css` → `output.css` |

新增或升级依赖后，请使用 `pnpm add <pkg>` / `pnpm add -D <pkg>`，并提交更新后的 `pnpm-lock.yaml`。

## 目录结构（节选）

```
drawStars-Vue3/
├── pnpm-lock.yaml              # pnpm 锁文件
├── pnpm-workspace.yaml         # workspace 配置（单包）
├── package.json
├── src/
│   ├── main.ts                 # 应用入口
│   ├── App.vue
│   ├── plugins/                # 插件注册（路由、Pinia、Element Plus、ECharts、Leaflet 等）
│   ├── router/
│   │   ├── index.ts            # 路由主文件
│   │   └── homePages/          # 各业务模块路由（按文件自动合并）
│   ├── views/                  # 页面视图
│   ├── components/             # 公共与业务组件
│   ├── stores/                 # Pinia 状态（用户、布局、API 信息等）
│   ├── assets/js/              # API、axios、Mock、SQLite 等
│   ├── utils/                  # 工具函数、自定义指令、Hooks
│   ├── lang/                   # i18n 语言包（zh / en）
│   └── config/                 # 布局默认值、跳过登录等配置
├── vite.config.ts
├── tailwind.config.js
└── .env                        # 环境变量（如 VITE_SKIP_LOGIN）
```

路径别名：`@` → `src/`（见 `vite.config.ts`）。

## 自定义指令

在 `src/utils/directives/`（TypeScript）中注册，包含：`v-copy`、`v-longpress`、`v-debounce`、`v-throttle`、`v-emoji`、`v-lazyload`、`v-waterMarker`、`v-draggable`、`v-click-outside`、`v-trim`、`v-focus`、`v-permission`、`v-loading`。实验室「指令」页（`src/views/lab/directive.vue`）提供对应示例。

## 提交信息规范

| 类型 | 说明 |
| --- | --- |
| `feat` | 新功能、新模块 |
| `fix` | 修复 bug |
| `docs` | 仅文档变更 |
| `style` | 代码格式（不影响逻辑） |
| `refactor` | 重构 |
| `perf` | 性能优化 |
| `test` | 测试相关 |
| `chore` | 构建、工具链、依赖等 |
| `add` | 小组件、小功能、示例等 |

## Windows 进程守护（NSSM，可选）

部署到 Windows 服务时，可使用 [NSSM](https://nssm.cc/commands)：

```bash
nssm install <servicename>
nssm start <servicename>
nssm stop <servicename>
nssm restart <servicename>
nssm edit <servicename>
nssm set <服务名称> AppDirectory <路径>
```

## 参考链接

### 核心环境

- [Vue](https://cn.vuejs.org/)
- [Pinia](https://pinia.vuejs.org/)
- [Vue Router](https://router.vuejs.org/zh/)
- [Vite](https://cn.vitejs.dev/)
- [Element Plus](https://element-plus.org/zh-CN/)
- [axios](https://axios-http.com/)
- [Less](http://lesscss.cn/)
- [Tailwind CSS](https://www.tailwindcss.cn/docs)

### 项目相关库

- [ECharts](https://echarts.apache.org/zh/index.html)
- [Vue I18n](https://vue-i18n.intlify.dev/)
- [Leaflet](https://leafletjs.com/)
- [Mock.js](http://mockjs.com/)
- [lodash](https://www.lodashjs.com/)
- [sqlite](https://www.sqlite.net.cn/)（浏览器端 SQLite 实践）
- [Agora](https://www.agora.io/cn/)
- [SortableJS](https://github.com/SortableJS/Sortable)
- [nprogress](https://github.com/rstacruz/nprogress)
- [NSSM](https://nssm.cc/commands)

### 其他

- [pnpm](https://pnpm.io/zh/)
- [webpack](https://www.webpackjs.com/)（实验室中有打包示例）
