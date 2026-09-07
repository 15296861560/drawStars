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

在根目录创建 `.env` 文件（已被 `.gitignore` 忽略，可参考 `.env.example`）：

```env
VITE_SKIP_LOGIN=true
```

为 `true` 时（`src/config/skip-login.ts`）会跳过登录校验并写入本地模拟会话，便于只浏览前端页面。完整接口能力（登录、资料、支付、通知等）仍需配合后端服务。

### 环境变量（Vite）

所有自定义环境变量均在 `env.d.ts` 中声明，Vite 会以 `VITE_` 前缀注入：

| 变量 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `VITE_SKIP_LOGIN` | `string` | — | 设为 `true` 跳过登录，写入本地模拟会话 |
| `VITE_AI_ASSISTANT_MOCK` | `string` | `true` | 设为 `false` 时 AI 助手走真实 API（未实现前回退 Mock） |
| `VITE_POINTS_MOCK` | `string` | `true` | 设为 `false` 时积分模块走真实 API |
| `VITE_TASK_MOCK` | `string` | `true` | 设为 `false` 时任务模块走真实 API |

### 联调后端 API

`vite.config.ts` 配置了以下开发代理：

| 代理前缀 | 目标 | 说明 |
| --- | --- | --- |
| `/api` | `http://127.0.0.1:8011` | 后端 REST 接口（转发时去除 `/api` 前缀） |
| `/uploadImg` | `http://127.0.0.1:8011` | 图片上传接口 |
| `/phoneAreaApi` | `https://cx.shouji.360.cn` | 手机号归属地查询（第三方） |
| `/im/ws` | `ws://127.0.0.1:8041` | IM WebSocket 网关 |

请确保对应后端已启动，或将 `target` 改为你的服务地址。

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

```text
drawStars-Vue3/
├── .github/workflows/         # CI/CD（Docker 构建、Gitee 同步）
├── prd/                       # 产品需求文档
├── scripts/                   # 辅助脚本
├── public/                    # 静态资源（favicon 等）
├── pnpm-lock.yaml             # pnpm 锁文件
├── pnpm-workspace.yaml        # workspace 配置（单包）
├── package.json
├── Dockerfile                 # 多阶段构建（Node 构建 + Nginx 运行）
├── nginx.conf.template        # Nginx 配置模板（反向代理 + SPA）
├── src/
│   ├── main.ts                # 应用入口
│   ├── App.vue
│   ├── plugins/               # 插件注册（路由、Pinia、Element Plus、ECharts、Leaflet 等）
│   ├── router/
│   │   ├── index.ts           # 路由主文件
│   │   └── homePages/         # 各业务模块路由（按文件自动合并）
│   ├── views/                 # 页面视图
│   ├── components/            # 公共与业务组件
│   ├── stores/                # Pinia 状态（用户、布局、权限、IM、积分等）
│   ├── api/                   # TypeScript API 层（IM、问卷、任务、积分、AI 助手）
│   ├── assets/js/             # JS API、axios、Mock、SQLite 等
│   ├── utils/                 # 工具函数、自定义指令、Hooks、IM 协议
│   ├── lang/                  # i18n 语言包（zh / en）
│   └── config/                # 布局默认值、跳过登录等配置
├── vite.config.ts
├── tailwind.config.js
├── env.d.ts                   # 环境变量类型声明
└── .env                       # 环境变量（gitignore，可参考 .env.example）
```

路径别名：`@` → `src/`（见 `vite.config.ts`）。

## 功能模块概览

| 模块 | 路由前缀 | 说明 |
| --- | --- | --- |
| 首页 | `/home/homepage` | 项目门户，聚合各模块入口 |
| 案例·演示 | `/home/case` | 烟花、爱心、星空等动画效果 |
| 案例·游戏 | `/home/case/games` | 2048、五子棋（含 AI 与在线对战） |
| 数据 | `/home/data` | axios、Mock.js、WebSocket、SQLite、MySQL 示例 |
| ECharts | `/home/myEcharts` | 柱状图、折线图、饼图、仪表盘、极坐标、地图等 |
| IM 即时通信 | `/home/im` | 聊天、通讯录、大厅、房间，基于 WebSocket |
| 实验室 | `/home/lab` | 自定义指令、Promise、Vue 响应式、Webpack 示例 |
| 日志 | `/home/logs` | API 日志、业务日志、操作日志、性能监控 |
| 后台管理 | `/home/manage` | 用户 / 角色 / 菜单 / 通知 / 日志 / 任务 / 积分 / IM / App 管理 |
| 多媒体 | `/home/multimedia` | 视频（Video.js）、摄像头、图片裁剪 |
| 问卷系统 | `/survey` | 问卷编辑、发布、填写、统计、题库管理 |
| 任务体系 | `/home/task` | 任务大厅、我的任务、成就 |
| 个人中心 | `/home/profile` | 基本信息绑定、密码、凭证、积分、通知设置 |
| 工具 | `/home/tools` | Agora 音视频、Lodash、信息分析、支付、翻译、压缩等 |
| 资源 | `/home/resource` | 模块配置、Web 框架展示 |
| 特效 | `/home/special` | 动画、拖拽、过渡、打字效果 |
| 组件 | `/home/myComponents` | 公共组件示例 |

> 路由按模块文件自动合并，见 `src/router/homePages/*.ts`；新增模块只需在该目录下新增文件即可。

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

## Docker 部署

项目提供 `Dockerfile`（多阶段构建）与 `nginx.conf.template`，构建后以 Nginx 托管静态资源并反向代理后端 API。

### 快速构建与运行

```bash
# 构建镜像
docker build -t drawstars-web .

# 运行容器（API_UPSTREAM 指向后端服务地址）
docker run -d -p 80:80 -e API_UPSTREAM=api:8010 drawstars-web
```

### Nginx 代理说明

`nginx.conf.template` 在容器启动时通过环境变量 `API_UPSTREAM` 动态配置后端地址，将 `/api/`、`/uploadImg/` 转发到后端服务（去除前缀），其余路径回退到 `index.html`（SPA history 模式）。

### 环境变量（Docker）

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `API_UPSTREAM` | `api:8010` | 后端服务地址（`host:port`），Nginx 反向代理目标 |

## CI/CD

项目通过 GitHub Actions 自动化构建与同步（`.github/workflows/`）。

### Docker 镜像构建（`docker-deploy.yml`）

- **触发**：推送 `master` / `develop` / `vue3` 分支（忽略 `*.md`、`prd/**`），或手动触发
- **平台**：`linux/amd64` + `linux/arm64` 原生构建
- **产物**：多架构镜像推送到 GHCR（`ghcr.io/<owner>/drawstars-web`），标签包含 `latest`、commit SHA、分支名
- **缓存**：使用 GitHub Actions Cache 加速构建

### Gitee 镜像同步（`sync-gitee.yml`）

- **触发**：push / 创建/删除分支 / 每天 UTC 01:00 兜底同步
- **行为**：将 GitHub 仓库镜像同步到 Gitee
- **所需 Secrets**：`GITEE_PRIVATE_KEY`（SSH 私钥）、`GITEE_TOKEN`（Gitee 私人令牌）

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
