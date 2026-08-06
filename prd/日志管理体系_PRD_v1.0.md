# 日志管理体系 — 产品需求设计文档（PRD）

> **项目**: drawStars (Vue3)  
> **版本**: v1.0  
> **日期**: 2026-08-06  
> **状态**: 初稿（基于现有前后端日志代码整理）  
> **关联规范**: `需求文档输出规范.md`

---

## 一、需求背景与目标

### 1.1 背景

drawStars 作为多业务管理平台，需要可追溯的运行与操作记录，支撑排障、审计与运营分析：

- 登录成败追溯与异常登录识别
- 管理端写操作审计（增删改等）
- 接口调用链路与慢请求性能排查
- 业务行为埋点（页面浏览/点击/业务事件）预留
- 管理中心统计概览与侧边栏「日志管理」日常查询

实现上采用**单表多类型**模型（`log.log_type`），由全局 `LoggingInterceptor` 自动采集 API/操作/性能日志，业务日志通过 `/logApi/track` 上报。

### 1.2 设计目标

| 目标 | 说明 |
|------|------|
| **可追溯** | 关键请求与写操作留痕，支持按人/IP/时间/状态筛选 |
| **低侵入** | 默认拦截器自动记账，业务方无需处处手写 |
| **可分类** | 登录/操作/业务/接口/性能分视图查询，语义清晰 |
| **可脱敏** | 密码、Token 等敏感字段入库前掩码 |
| **可运维** | 支持单条/批量删除、导出、统计概览；异步缓冲写库降压 |

### 1.3 不在本期范围

- 日志归档冷热分层、按天分表、对象存储归档（无自动 TTL）
- 完整 SIEM / 告警规则引擎（慢请求仅入库，不做实时告警推送）
- 细粒度日志权限码（如 `system:log:delete`）；本期依赖登录 + 菜单可见性
- 前端 Vue 运行时错误面板（`error-log` Store）持久化到服务端日志表
- 访问分析（Umami/analytics）与网站配置的深度产品化（同菜单位置，独立子系统，见 4.8）

---

## 二、用户角色

| 角色 | 说明 | 核心诉求 |
|------|------|----------|
| **平台管理员 / 运维** | 通过管理中心或侧边栏日志菜单访问 | 查登录/操作异常、删无效日志、看统计 |
| **开发排查人员** | 查看接口与性能日志 | 定位慢接口、失败请求、参数与耗时 |
| **普通业务用户** | 一般不直接使用日志模块 | 其行为被自动记录（登录、写操作） |
| **前端埋点调用方** | 调用 `track` 上报 | 上报 pageview/click/event（能力已具备，业务接入待完善） |

> 当前日志路由**无** `meta.permission` / `v-permission`；RBAC 种子通过菜单节点控制入口可见性。  
> 目标态（v1.1+）建议补充 `system:log:list` / `system:log:delete` / `system:log:export`。

---

## 三、功能模块总览

```
日志管理
├── 1. 日志采集
│   ├── 全局 HTTP 拦截（API / 操作 / 性能）
│   ├── 业务埋点 track
│   ├── 后端模块手动写操作日志
│   └── 缓冲批量落库
├── 2. 日志分类查询
│   ├── 登录日志（operate + loginOnly）
│   ├── 操作日志
│   ├── 业务日志
│   ├── 接口日志
│   └── 性能日志
├── 3. 日志运维
│   ├── 详情查看
│   ├── 单条 / 批量删除
│   └── 导出（前端勾选 / 接口导出）
├── 4. 数据统计
│   ├── 今日登录 / 操作 / 异常指标
│   └── 趋势与分布图
├── 5. 双入口页面
│   ├── 管理中心 Tab（含登录、统计）
│   └── 侧边栏日志管理（含 API、性能、访问分析）
└── 6. 关联能力（独立子系统）
    ├── 访问分析 / 网站配置（analytics）
    └── 前端错误面板（内存，非 log 表）
```

---

## 四、各模块详细设计

### 4.1 日志采集

#### 4.1.1 全局拦截器规则

`LoggingInterceptor` 对每个 HTTP 请求（非跳过路径）记录：

| 条件 | 写入 logType | 说明 |
|------|--------------|------|
| 任意未跳过请求 | `api` | 接口日志 |
| 方法 ∈ POST / PUT / PATCH / DELETE | `operate` | 操作日志（写操作） |
| 耗时 ≥ **300ms** | `performance` | 性能日志（额外一条） |

**跳过路径（防递归）**：URL 包含 `/logApi/` 或 `/analyticsApi/collect`。

#### 4.1.2 操作类型推断（OP_TYPE）

| 值 | 含义 | 推断依据（摘要） |
|----|------|------------------|
| insert | 新增 | create 等路径关键词 / POST 语义 |
| update | 更新 | update / PUT / PATCH |
| delete | 删除 | delete |
| select | 查询 | query / list / GET 相关（手动或路径） |
| login | 登录 | login 路径 |
| logout | 登出 | logout 路径 |
| other | 其他 | 无法归类的 POST 等 |

#### 4.1.3 请求内容记录与脱敏

入库 content（JSON）典型字段：

| 字段 | 说明 |
|------|------|
| username / uid | 操作者展示名 / 用户 ID |
| method / operation / path | HTTP 方法、操作类型、路径（无 query） |
| ip / params | 客户端 IP；`{ query, body }` |
| duration / status / statusCode / msg | 耗时、成功失败、状态码、消息 |
| errorMsg | 异常信息（失败时） |

**脱敏**：body 键名匹配 `/password|pwd|token|secret/i` → `"***"`；业务层创建用户等场景强制 `password: "***"`。

**展示名解析**：Token/auth.uid → 查用户表 `name` → `accountAlias` → `phone`；缓存 TTL **5 分钟**。读取列表时若 username 仍为数字 uid，再批量 enrichment。

#### 4.1.4 缓冲落库

| 参数 | 值 | 说明 |
|------|-----|------|
| MAX_LOG | 100 | 条数达阈值立即刷盘 |
| SAVE_LOG_TIME | 60s | 定时刷盘 |

字段截断：logType 32、hostname/originalUrl 255；content 为 JSON 字符串。

#### 4.1.5 业务埋点 track

| 项 | 说明 |
|----|------|
| 接口 | `POST /api/logApi/track`（`@Public()`） |
| type ∈ pageview/click/event | 记为 `business` |
| 默认 module | `frontend` |
| 内容 | title、path、operator/username、extra 等 |

> 前端 `logApi.track` 已封装，**当前 Vue 业务页尚未普遍接入**；v1.1 建议在关键页面挂载埋点。

#### 4.1.6 其他写入源

| 来源 | logType | 说明 |
|------|---------|------|
| userService.addOperateLog | operate | 后端语义化操作（method 可空） |
| Redis 客户端 | redis | 内部类型，**无独立查询页** |
| 出站 axios 失败 | operate | hostname 标记为 request 类 |

---

### 4.2 日志分类与查询

#### 4.2.1 类型总览

| UI 分类 | logType | 产生方式 |
|---------|---------|----------|
| 登录日志 | `operate` + `loginOnly` | 内容/URL 含 login/logout/登录/登出 |
| 操作日志 | `operate` | 拦截器写方法 + 手动 operate |
| 业务日志 | `business` | track 上报 |
| 接口日志 | `api` | 拦截器全量（未跳过） |
| 性能日志 | `performance` | 耗时 ≥ 300ms |
| （内部） | `redis` | Redis，无 UI |

> **重要**：登录日志**不是**独立 logType，而是操作日志的筛选视图。操作日志页默认包含登录/登出记录（可用 operation 筛选排除）。

#### 4.2.2 通用查询能力

| 参数 | 说明 |
|------|------|
| curPage / pageSize | 分页；pageSize 默认 10，最大 **100** |
| startTime / endTime / timeRange | 时间范围；仅日期的 end 扩到当日结束 |
| username / operator / ip / status | 操作者、IP、成功/失败 |
| operation / module / type / method / url / keyword | 各页专用筛选 |

#### 4.2.3 各视图筛选与列

**登录日志**

| 筛选项 | 列 |
|--------|-----|
| 用户、IP、状态 success/fail、时间 | 用户、IP、归属地、浏览器、OS、状态、消息、时间 |

**操作日志**

| 筛选项 | 列 |
|--------|-----|
| 用户、operation、状态、时间 | 用户、操作类型标签、method、URL、params、IP、状态、消息、时间 |

**业务日志**

| 筛选项 | 列 |
|--------|-----|
| module、type、操作人、时间 | 模块、类型、标题、内容、操作人、时间 |

**接口日志 / 性能日志**

| 筛选项 | 列 |
|--------|-----|
| method、url、状态、时间 | method、URL、params、状态、耗时、IP/用户（接口）、标题（性能）、时间 |

> 接口/性能页本期以**列表查询**为主；删除/导出以管理中心登录/操作/业务页为主（见 4.3）。

---

### 4.3 日志运维

| 功能 | 说明 |
|------|------|
| 详情 | 查看单条完整 content / raw |
| 单条删除 | `deleteLog?id=` |
| 批量删除 | `batchDeleteLogs?ids=`（逗号分隔）；未选提示「请选择要删除的日志」 |
| 前端导出 | 勾选行客户端 `exportFile` 导出 |
| 接口导出 | `exportLogs`：按类型拉取，默认 operate，最多 **1000** 条（接口现为 Public，v1.1 应收紧鉴权） |

**无自动保留策略**：不按天清理；仅人工删除。v1.1 建议增加「保留 N 天」定时任务。

---

### 4.4 数据统计（管理中心）

| 指标/图表 | 说明 |
|-----------|------|
| 今日登录 / 今日操作 | 卡片指标（实现上部分指标基于当日 operate 总量，与「登录」命名存在口径偏差，v1.1 应对齐 loginOnly） |
| 异常登录 / 异常操作 | 失败类统计 |
| 登录趋势 | 折线图 |
| 操作分布 | 饼图等 |

数据来源：`GET /logApi/getLogStatistics`。

---

### 4.5 双入口与信息架构

#### 4.5.1 管理中心入口

路径前缀：`/home/manageHomePage/logs`

| Tab | 路径 | 能力 |
|-----|------|------|
| 登录日志 | `.../login` | 查询/详情/删/导出 |
| 操作日志 | `.../operation` | 同上 |
| 业务日志 | `.../business` | 同上 |
| 数据统计 | `.../statistics` | 概览图表 |

#### 4.5.2 侧边栏「日志管理」入口

路径前缀：`/home/logs`

| 菜单 | 路径 | 说明 |
|------|------|------|
| 操作日志 | `/home/logs/operation` | 复用 manage 操作页组件 |
| 业务日志 | `/home/logs/business` | 复用 manage 业务页组件 |
| 接口日志 | `/home/logs/api` | 列表查询 |
| 性能日志 | `/home/logs/performance` | 列表查询 |
| 访问分析 | `/home/logs/traffic` | analytics，非 log 表 |
| 网站配置 | `/home/logs/website` | analytics 配置 |

#### 4.5.3 已知结构问题（目标态对齐）

| 问题 | 建议（v1.1） |
|------|--------------|
| 登录/统计仅在管理中心 | 侧边栏补齐或统一单一入口 |
| `views/logs/operationLog.vue`、`businessLog.vue` 未挂路由 | 删除死代码或明确废弃 |
| 统计「登录」口径偏宽 | 改为 loginOnly 计数 |
| 无日志专用权限码 | 补齐 list/delete/export |
| export/track 过于开放 | 去掉不必要的 `@Public` 或加签名/鉴权 |

---

### 4.6 性能日志细则

| 项 | 规则 |
|----|------|
| 阈值 | `PERF_THRESHOLD_MS = 300` |
| 正常慢请求 | content.type=`slow`，title≈「慢接口」 |
| 慢且异常 | type=`slow_error`，title≈「慢接口异常」 |
| 与 API 关系 | 性能日志**额外**写入，不替代 api/operate |

---

### 4.7 前端错误面板（非本期核心）

| 项 | 说明 |
|----|------|
| 位置 | `stores/error-log.ts` + 导航角标组件 |
| 数据 | `App.vue` errorHandler 内存堆积 |
| 与 log 表 | **不互通**；文档保留边界说明，避免与服务端日志混淆 |

---

### 4.8 访问分析（菜单共存，独立需求）

网站配置 / 访问分析基于 `analyticsApi` 与独立表，**不写入 `log` 表**。本期 PRD 仅约定：菜单位于日志管理下，详细需求可另立《访问分析 PRD》；不阻塞日志表能力验收。

---

## 五、核心数据模型

### 5.1 实体关系

```
┌──────────────────┐         写入          ┌──────────────┐
│ LoggingInterceptor│─────────────────────→│              │
│ track / 手动写日志 │─────────────────────→│   log 表      │
└──────────────────┘                       │  (单表多类型)  │
                                           └───────┬──────┘
┌──────────────────┐         查询/删除      │
│ 日志管理前端页面   │←────────────────────┘
└──────────────────┘
```

### 5.2 表结构 (log)

| 字段 | 列名 | 类型 | 说明 |
|------|------|------|------|
| logId | log_id | bigint PK | 自增主键 |
| logType | log_type | varchar(32) | api / operate / business / performance / redis |
| content | content | text | JSON 字符串，业务字段都在此 |
| hostname | hostname | varchar(255) | 主机或来源标记 |
| originalUrl | originalUrl | varchar(255) | 请求 URL |
| createTime | createTime | bigint | 毫秒时间戳 |

> 本期 schema 除主键外无额外索引；大数据量下 v1.1 建议为 `log_type + createTime` 建组合索引。

### 5.3 content 约定（按类型）

**operate / api 共性：**

```json
{
  "username": "张三",
  "uid": "1",
  "method": "POST",
  "operation": "login",
  "path": "/api/xxx",
  "ip": "1.2.3.4",
  "params": { "query": {}, "body": { "password": "***" } },
  "duration": 120,
  "status": "success",
  "statusCode": 200,
  "msg": "ok"
}
```

**business（track）：**

```json
{
  "type": "pageview",
  "module": "frontend",
  "title": "打开首页",
  "path": "/home/homepage",
  "operator": "张三",
  "status": "success",
  "extra": {}
}
```

**performance：** 在共性基础上增加 `title`、`type`（slow / slow_error）、`threshold`。

---

## 六、页面结构

### 6.1 路由规划

```
/home/manageHomePage/logs                 ← 管理中心日志（Tab 容器）
/home/manageHomePage/logs/login           ← 登录日志
/home/manageHomePage/logs/operation       ← 操作日志
/home/manageHomePage/logs/business        ← 业务日志
/home/manageHomePage/logs/statistics      ← 数据统计

/home/logs/operation                      ← 侧边栏操作日志
/home/logs/business                       ← 侧边栏业务日志
/home/logs/api                            ← 接口日志
/home/logs/performance                    ← 性能日志
/home/logs/traffic                        ← 访问分析（analytics）
/home/logs/website                        ← 网站配置（analytics）
```

### 6.2 关键页面说明

#### 列表页通用布局

```
┌─────────────────────────────────────────────┐
│ 筛选栏：用户/IP/状态/时间/类型…    [查询][重置] │
├─────────────────────────────────────────────┤
│ 工具栏：[批量删除] [导出]                      │
├─────────────────────────────────────────────┤
│ 表格（多选）… 操作列：详情 | 删除               │
├─────────────────────────────────────────────┤
│ 分页                                         │
└─────────────────────────────────────────────┘
```

#### 统计页

- 顶部 KPI 卡片
- 中部趋势折线 + 操作类型分布

---

## 七、接口概要

> 前缀 `/api`；前端封装于 `logApi.js`。

### 7.1 查询

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/logApi/queryLoginLogs` | GET | 登录日志（operate + loginOnly） |
| `/api/logApi/queryOperationLogs` | GET | 操作日志 |
| `/api/logApi/queryBusinessLogs` | GET | 业务日志 |
| `/api/logApi/queryApiLogs` | GET | 接口日志 |
| `/api/logApi/queryPerformanceLogs` | GET | 性能日志 |
| `/api/logApi/getLogStatistics` | GET | 统计概览 |

### 7.2 运维与上报

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/logApi/deleteLog` | GET | 按 id 删除 |
| `/api/logApi/batchDeleteLogs` | GET | 批量删除 `ids=1,2,3` |
| `/api/logApi/exportLogs` | GET | 导出查询（最多 1000）；现 Public，待收紧 |
| `/api/logApi/track` | POST | 前端埋点；Public |

**响应约定**：`{ status, msg, data }`；列表 data 含 list/total 等分页结构（与现服务一致）。

---

## 八、非功能性需求

| 维度 | 要求 |
|------|------|
| **性能** | 列表查询 < 1s（单类型近 7 天、十万级内）；写入走缓冲，不阻塞主请求响应 |
| **存储** | 字段截断防撑爆；content 避免记录超大 body（超限策略 v1.1 可截断/丢弃） |
| **安全** | 敏感字段脱敏；删除/导出应鉴权（目标态）；track 防刷（限流 v1.1） |
| **可用性** | 写日志失败不影响主业务成功返回 |
| **隐私** | IP、账号仅授权人员可查；导出文件按内控管理 |
| **兼容性** | 管理端跟随主站浏览器矩阵 |

---

## 九、扩展性设计

### 9.1 新日志类型

1. 在 `LOG_TYPE` 增加枚举值  
2. 写入方调用 `Log.addLog` / `writeLog`  
3. 增加 `queryXxxLogs` 与前端列表页  
4. （可选）统计接口纳入新类型指标  

### 9.2 采集扩展

| 扩展点 | 说明 |
|--------|------|
| 拦截器 | 调整 OPERATE_METHODS、PERF 阈值、SKIP 前缀 |
| 手动埋点 | 业务 Service 调 `addOperateLog` / `writeLog` |
| 前端 track | 路由切换、按钮点击统一 SDK 封装 |

### 9.3 与现有系统集成

| 集成对象 | 方式 |
|----------|------|
| HTTP 层 | 全局 LoggingInterceptor |
| 用户体系 | uid → 展示名 |
| RBAC 菜单 | 日志入口菜单可见性 |
| 管理中心 | Tab 容器 `logManage/index.vue` |
| 侧边栏/顶栏 | `logs.ts` 路由 + 菜单配置 |
| Analytics | 同菜单共存，数据隔离 |

---

## 十、版本规划

| 版本 | 范围 | 预计周期 |
|------|------|----------|
| **v1.0** | 拦截采集 API/操作/性能；登录/操作/业务查询删导；统计页；双入口；track 接口；脱敏与缓冲写 | 已落地（对照现码） |
| **v1.1** | 权限码 `system:log:*`；收紧 export/track；统计登录口径修正；入口统一；索引与保留天数清理；前端关键页接入 track；删除死代码 | 2～3 周 |
| **v1.2** | 慢请求/失败登录告警通知；按模块审计报表；导出异步任务 | 2 周 |
| **v1.3** | 冷热归档、按月分表或外部日志仓 | 3 周 |
| **v2.0** | 全链路 traceId、与 APM 打通 | 4 周 |

---

## 附录 A：术语表

| 术语 | 说明 |
|------|------|
| logType | 日志大类：api / operate / business / performance / redis |
| 登录日志 | operate 子集，loginOnly 关键字过滤 |
| 操作日志 | 写操作及手动 operate 记录 |
| 业务日志 | 前端/业务埋点行为记录 |
| 接口日志 | 每个（未跳过）HTTP 请求的调用记录 |
| 性能日志 | 超过阈值的慢请求记录 |
| OP_TYPE | 操作语义类型 insert/update/delete/select/login/logout/other |
| loginOnly | 查询参数，用于从 operate 中筛登录相关 |
| track | 公开埋点上报接口 |
| 缓冲落库 | 内存攒批后定时/定量写入数据库 |

## 附录 B：代码与库表索引

| 层级 | 路径 |
|------|------|
| 前端 API | `drawStars-Vue3/src/assets/js/api/logController/logApi.js` |
| 管理端页面 | `src/views/manage/logManage/*` |
| 侧边栏页面 | `src/views/logs/{apiLog,performanceLog,websiteConfig,trafficStats}.vue` |
| 路由 | `src/router/homePages/logs.ts`、`manage.ts`（logs 段） |
| 拦截器 | `drawStars-serve-node/src/nest/common/interceptors/logging.interceptor.ts` |
| 缓冲写入 | `src/public/provider/log.ts` |
| 操作类型 | `src/public/provider/log-operation.ts` |
| 控制器/服务 | `src/nest/modules/logs/logs.controller.ts`、`logs.service.ts` |
| 前端错误面板 | `src/stores/error-log.ts`（非 log 表） |

## 附录 C：采集时序

```
HTTP 请求进入
  → 是否 SKIP？是 → 不写日志
  → 计时执行业务
  → 写 api 日志
  → 若为写方法 → 写 operate 日志
  → 若耗时 ≥ 300ms → 写 performance 日志
  → 进入内存缓冲 → 满 100 条或 60s → 批量 INSERT log 表

前端埋点
  → POST /logApi/track → logType=business → 同上缓冲
```
