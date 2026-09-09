# 流程编排系统 — 产品需求设计文档（PRD）

> **项目**: drawStars (Vue3)
> **版本**: v1.0
> **日期**: 2026-09-09
> **状态**: 初稿（按需求文档输出规范重构）
> **关联系统**: RBAC 权限系统、通知系统（WebSocket）、日志管理体系、AI 助手、积分管理体系

---

## 一、需求背景与目标

### 1.1 背景

drawStars 平台已具备用户管理、权限体系、积分系统、AI 助手、任务管理、IM 通讯等模块，各模块间存在大量可编排的自动化场景，但当前缺少一套统一的**流程编排引擎**来串联各能力，存在以下缺口：

- 运营活动（签到→积分发放→消息推送）需要人工串联多个后台，效率低且易出错
- AI 助手能力（多模型对话、文档分析）无法与业务流程联动，仅停留在独立面板
- 数据采集→处理→入库的自动化 pipeline 缺少可视化配置工具
- 缺少统一的触发器机制（定时/Webhook/事件），各模块各自实现，重复建设

流程编排系统旨在提供一套**可视化拖拽编排 + 执行引擎 + 监控告警**的一体化平台，实现复杂业务流程的零代码/低代码编排与自动化执行。

### 1.2 设计目标

| 目标           | 说明                                                   |
| -------------- | ------------------------------------------------------ |
| **零代码编排** | 拖拽式可视化画布编辑器，无需编程即可编排多节点流程     |
| **AI-First**   | 深度集成 AI Agent 节点，支持多模型切换与系统提示词配置 |
| **可观测**     | 实时日志流、执行详情、性能剖析、告警规则，全链路可追踪 |
| **可复用**     | 组件市场、模板克隆、子流程复用，降低编排成本           |
| **可扩展**     | 插件化节点类型注册表，新增节点类型不改核心流程         |
| **高可用**     | 执行引擎支持并发、重试、超时、熔断，保障流程可靠执行   |

### 1.3 不在本期范围

- 流程市场交易（用户间买卖流程模板）
- 多人协作编辑（同一流程多人实时协同）
- 流程版本分支管理（Git 式分支合并）
- 移动端编排（仅支持 PC 端画布编辑，移动端仅查看执行状态）
- 自定义脚本节点运行沙箱（Transform 节点仅支持有限表达式）

---

## 二、用户角色

| 角色             | 说明                                          | 核心诉求                                |
| ---------------- | --------------------------------------------- | --------------------------------------- |
| **流程编排者**   | 在画布上设计、编辑、发布工作流                | 拖拽式编排、快速预览测试、模板复用      |
| **AI 开发者**    | 编排多 Agent 协作任务（客服、翻译、代码审查） | 多模型切换、提示词管理、输入输出 Schema |
| **自动化工程师** | 构建数据采集→处理→入库 pipeline               | 工具链丰富、参数映射灵活、错误处理完善  |
| **业务运营**     | 配置营销自动化、消息推送、数据报表            | 定时触发、条件分支、输出通知            |
| **平台管理员**   | 管理流程模板、组件市场、权限分配              | 权限管控、审计日志、全局监控            |
| **流程查看者**   | 只读查看流程执行状态和历史（仅监控）          | 执行历史、日志查看、告警通知            |

> 角色与现有 RBAC 权限体系集成，通过菜单权限 `system:workflow:list`、`system:workflow:design`、`system:workflow:publish` 等控制可见性。

---

## 三、功能模块总览

```text
流程编排系统
├── 1. 流程管理（生命周期）
│   ├── 创建流程（空白/模板/克隆）
│   ├── 编辑流程（可视化画布 + 撤销重做）
│   ├── 删除流程（软删除 + 回收站恢复）
│   ├── 复制流程（一键克隆）
│   ├── 版本管理（保存版本 + 回滚）
│   └── 流程发布（草稿→已发布→已下线）
├── 2. 触发器 Trigger
│   ├── 定时触发（Cron 表达式）
│   ├── Webhook 触发（HTTP 请求）
│   ├── 手动触发（一键执行）
│   ├── 事件触发（队列/订阅）
│   └── 条件触发（上游条件满足）
├── 3. 步骤节点 Step
│   ├── Agent 节点（AI 模型 + 提示词 + Schema）
│   ├── Tool 节点（工具市场 / 自定义 API）
│   ├── Condition 节点（条件分支）
│   ├── Transform 节点（数据映射/转换）
│   ├── Loop 节点（循环迭代）(v1.1+)
│   ├── Sub-workflow 节点（子流程调用）(v1.1+)
│   └── Output 节点（消息/邮件/Webhook/回调）
├── 4. 执行引擎
│   ├── 串行/并行执行
│   ├── 异步执行（回调等待）
│   ├── 错误处理（跳过/重试/终止）
│   ├── 超时控制（全局 + 单节点）
│   └── 执行队列与并发控制
├── 5. 执行监控
│   ├── 实时日志流（WebSocket 推送）
│   ├── 执行详情（输入/输出/耗时/状态）
│   ├── 性能剖析（节点耗时火焰图）
│   ├── 告警规则（错误次数/超时次数）
│   └── 执行历史（最近 1000 条，支持筛选）
├── 6. 组件市场
│   ├── 官方工具库（内置 17+ 工具）
│   ├── 自定义工具（OpenAPI/Swagger 定义）
│   ├── 模板市场（官方 + 社区）
│   └── 一键安装（模板→自动创建流程）
├── 7. 数据统计
│   ├── 执行概览 Dashboard
│   ├── 流程维度分析
│   └── 节点维度分析
└── 8. 系统管理
    ├── 节点类型注册表
    ├── 触发器类型注册表
    ├── 操作日志/审计
    └── 告警规则配置
```

---

## 四、各模块详细设计

### 4.1 流程管理（生命周期）

#### 4.1.1 流程基础信息

| 字段     | 说明                                                 | 必填           |
| -------- | ---------------------------------------------------- | -------------- |
| 流程编号 | 系统自动生成：`WF` + 日期(YYYYMMDD) + 当日序号；唯一 | 否（系统生成） |
| 流程名称 | 最多 128 字符                                        | 是             |
| 流程描述 | 富文本描述，支持图文                                 | 否             |
| 流程图标 | 上传/图标库选择                                      | 否             |
| 所属分类 | 从流程分类树中选择                                   | 是             |
| 标签     | 自定义标签，便于筛选                                 | 否             |

#### 4.1.2 流程生命周期

```text
草稿 ──→ 待审核 ──→ 已发布 ──→ 已暂停 ──→ 已发布（恢复）
  │         │          │                      │
  │         │          └──→ 已下线 ←──────────┘
  │         │
  │         └──→ 已驳回 ──→ 草稿（修改重提）
  │
  └──→ 已删除（软删除，回收站可恢复）
```

| 状态   | 编码        | 说明                         | 可执行操作                     |
| ------ | ----------- | ---------------------------- | ------------------------------ |
| 草稿   | `DRAFT`     | 编辑中，不可触发执行         | 编辑、测试运行、提交审核、删除 |
| 待审核 | `PENDING`   | 等待管理员审批               | 审核通过、驳回                 |
| 已发布 | `PUBLISHED` | 触发器激活，可自动执行       | 暂停、下线、查看执行数据       |
| 已驳回 | `REJECTED`  | 审核未通过                   | 编辑重提、删除                 |
| 已暂停 | `PAUSED`    | 暂停触发，已运行实例不受影响 | 恢复、下线                     |
| 已下线 | `OFFLINE`   | 不可触发，历史数据保留       | 查看数据、复制、删除           |

#### 4.1.3 版本管理

| 功能     | 说明                                          | 优先级 |
| -------- | --------------------------------------------- | ------ |
| 自动版本 | 每次保存生成新版本快照                        | P0     |
| 版本对比 | 对比两个版本的节点差异（v1.1+）               | P2     |
| 版本回滚 | 回滚到历史版本（生成新版本，不覆盖）（v1.1+） | P2     |
| 测试运行 | 在草稿态执行流程，不写入正式历史              | P0     |

#### 4.1.4 画布编辑器

| 功能      | 说明                                  | 优先级 |
| --------- | ------------------------------------- | ------ |
| 节点拖拽  | 从节点面板拖拽到画布                  | P0     |
| 节点连线  | 拖拽端口连接节点，表示执行依赖        | P0     |
| 节点配置  | 点击节点弹出配置面板                  | P0     |
| 撤销/重做 | Ctrl+Z / Ctrl+Y，支持 50 步           | P0     |
| 画布缩放  | 鼠标滚轮缩放，支持 25%-400%           | P0     |
| 自动布局  | 一键整理节点位置                      | P1     |
| 小地图    | 右下角缩略导航                        | P1     |
| 复制粘贴  | 节点 + 连线批量复制                   | P1     |
| 快捷键    | Delete 删除、Ctrl+D 复制、Ctrl+S 保存 | P0     |

---

### 4.2 触发器 Trigger

> 触发器是流程的启动条件。每个流程有且仅有一个触发器节点，位于画布起点。

#### 4.2.1 触发器类型

| 触发类型 | 编码        | 描述                   | 配置参数                                               | 优先级 |
| -------- | ----------- | ---------------------- | ------------------------------------------------------ | ------ |
| 定时触发 | `CRON`      | Cron 表达式定时执行    | `cron`(表达式), `timezone`(时区)                       | P0     |
| Webhook  | `WEBHOOK`   | 接收外部 HTTP 请求触发 | `path`(唯一路径), `method`(GET/POST), `auth`(认证方式) | P0     |
| 手动触发 | `MANUAL`    | 用户在界面上一键执行   | 无                                                     | P0     |
| 事件触发 | `EVENT`     | 监听内部/外部事件队列  | `event_type`, `queue_url`                              | P1     |
| 条件触发 | `CONDITION` | 上游条件满足时自动触发 | `condition_expr`                                       | P2     |

#### 4.2.2 Webhook 触发器配置

```json
{
  "triggerType": "WEBHOOK",
  "config": {
    "path": "/webhook/order-created",
    "method": "POST",
    "authType": "HMAC",
    "authSecret": "{{secret_ref}}",
    "rateLimit": { "maxPerMinute": 100 }
  },
  "outputSchema": {
    "type": "object",
    "properties": {
      "headers": { "type": "object" },
      "body": { "type": "object" },
      "query": { "type": "object" }
    }
  }
}
```

**业务规则：**

- Webhook path 全局唯一，系统自动生成默认路径，可自定义
- 认证方式支持：无认证 / Bearer Token / HMAC 签名校验
- 触发后 3 秒内返回 200 响应，异步执行流程
- 请求体大小限制 1MB

---

### 4.3 步骤节点 Step

#### 4.3.1 Agent 节点

> AI Agent 节点是核心节点，调用大语言模型完成智能任务。

| 配置项       | 说明                                                                                         | 必填            |
| ------------ | -------------------------------------------------------------------------------------------- | --------------- |
| 模型选择     | GPT-4o / GPT-3.5 / 其他 OpenAI 兼容模型（v1.0）；Claude / Gemini / LLaMA / 本地模型（v1.1+） | 是              |
| 系统提示词   | 支持变量插值 `{{input.name}}`、`{{step1.output.value}}`                                      | 是              |
| 用户消息模板 | 可选，支持变量插值                                                                           | 否              |
| 输入 Schema  | 定义期望的输入格式（JSON Schema）                                                            | 是              |
| 输出 Schema  | 定义输出的数据结构（JSON Schema）                                                            | 是              |
| 温度参数     | 0.0-2.0，控制随机性                                                                          | 否（默认 0.7）  |
| 最大 Token   | 输出长度上限                                                                                 | 否（默认 2048） |
| 重试策略     | 次数(默认3)、间隔(默认5s)、熔断条件                                                          | 否              |
| 超时设置     | 单次调用超时，默认 60s                                                                       | 否              |

**变量插值语法：**

| 变量               | 说明             | 示例                  |
| ------------------ | ---------------- | --------------------- |
| `{{trigger.body}}` | 触发器输入数据   | Webhook 请求体        |
| `{{step1.output}}` | 上游节点输出     | Agent 返回结果        |
| `{{input.field}}`  | 当前节点输入字段 | `{{input.user_name}}` |
| `{{env.VAR_NAME}}` | 环境变量         | `{{env.API_KEY}}`     |

#### 4.3.2 Tool 节点

> Tool 节点调用外部 API 或预置工具完成特定操作。

| 配置项       | 说明                                    | 必填         |
| ------------ | --------------------------------------- | ------------ |
| 工具来源     | 工具市场选择 / 自定义 API               | 是           |
| API Endpoint | 自定义工具的请求地址                    | 自定义时必填 |
| 请求方法     | GET / POST / PUT / DELETE               | 自定义时必填 |
| 认证方式     | 无 / Bearer Token / API Key / OAuth 2.0 | 否           |
| 请求头       | 自定义 Header，支持变量插值             | 否           |
| 参数映射     | 输入 → 工具参数的映射规则               | 是           |
| 超时设置     | 默认 30s，可配置                        | 否           |
| 重试策略     | 次数、间隔                              | 否           |

**参数映射示例：**

```json
{
  "toolId": "feishu_send_message",
  "paramMapping": {
    "chat_id": "{{trigger.body.chat_id}}",
    "content": "{{step1.output.summary}}",
    "msg_type": "text"
  },
  "timeout": 30,
  "retry": { "count": 2, "interval": 5 }
}
```

**内置工具库（P0）：**

| 工具分类 | 工具名称     | 说明                        |
| -------- | ------------ | --------------------------- |
| 消息通知 | 飞书消息发送 | 发送文本/卡片消息到指定群聊 |
| 消息通知 | 邮件发送     | SMTP 邮件发送               |
| 消息通知 | 钉钉消息     | 钉钉机器人推送              |
| 数据操作 | HTTP 请求    | 通用 HTTP 调用              |
| 数据操作 | 数据库查询   | SQL 查询执行                |
| 数据操作 | Redis 操作   | 缓存读写                    |
| 文件处理 | 文件上传     | 上传到 OSS/本地             |
| 文件处理 | 文件下载     | 下载远程文件                |
| AI 能力  | 文本摘要     | 调用 AI 生成摘要            |
| AI 能力  | 文本翻译     | 多语言翻译                  |
| AI 能力  | 图片识别     | 图片内容识别                |
| AI 能力  | 情感分析     | 文本情感倾向分析            |
| AI 能力  | 关键词提取   | 从文本中提取关键词          |
| AI 能力  | 内容分类     | 文本自动分类                |
| 平台能力 | 积分发放     | 对接积分系统                |
| 平台能力 | 任务创建     | 对接任务系统                |
| 平台能力 | 用户查询     | 查询用户信息                |

#### 4.3.3 Condition 节点

> 条件分支节点，根据表达式结果路由到不同分支。

| 配置项     | 说明                                         | 必填 |
| ---------- | -------------------------------------------- | ---- |
| 条件表达式 | 支持 `{{step1.output.value}} > 100` 等表达式 | 是   |
| 分支数量   | 2-10 个分支                                  | 是   |
| 默认分支   | 无条件匹配时的 fallback 路径                 | 是   |

**条件表达式语法：**

| 操作符                   | 说明        | 示例                                      |
| ------------------------ | ----------- | ----------------------------------------- |
| `==` / `!=`              | 等于/不等于 | `{{step1.output.status}} == 'success'`    |
| `>` / `<` / `>=` / `<=`  | 数值比较    | `{{step1.output.score}} > 80`             |
| `contains`               | 包含        | `{{step1.output.tags}} contains 'urgent'` |
| `in`                     | 属于集合    | `{{step1.output.type}} in ['A','B']`      |
| `&&` / `\|\|`            | 逻辑与/或   | `{{a}} > 0 && {{b}} < 100`                |
| `isEmpty` / `isNotEmpty` | 空值判断    | `{{step1.output.data}} isNotEmpty`        |

**分支配置示例：**

```json
{
  "branches": [
    {
      "name": "高分分支",
      "condition": "{{step1.output.score}} > 80",
      "nextStep": "step_send_reward"
    },
    {
      "name": "中等分支",
      "condition": "{{step1.output.score}} > 60 && {{step1.output.score}} <= 80",
      "nextStep": "step_send_notification"
    },
    {
      "name": "默认分支",
      "condition": "default",
      "nextStep": "step_log_failure"
    }
  ]
}
```

#### 4.3.4 Transform 节点

> 数据转换节点，对上游输出进行映射、过滤、格式转换。

| 功能     | 说明                          | 配置方式            |
| -------- | ----------------------------- | ------------------- |
| 数据映射 | 字段重命名、路径提取          | JSONPath / JMESPath |
| 数据过滤 | 按条件过滤数组                | filter 表达式       |
| 数据转换 | map / flatten / merge / sort  | 内置函数            |
| 脚本转换 | JavaScript 表达式（受限沙箱） | 表达式模式          |

**Transform 配置示例：**

```json
{
  "transformType": "MAPPING",
  "mapping": {
    "user_name": "{{step1.output.name}}",
    "user_email": "{{step1.output.email}}",
    "order_count": "{{step1.output.orders | length}}",
    "total_amount": "{{step1.output.orders | map('amount') | sum}}"
  }
}
```

**内置函数：**

| 函数         | 说明            | 示例                                         |
| ------------ | --------------- | -------------------------------------------- |
| `length`     | 数组/字符串长度 | `` `{{arr \| length}}` ``                    |
| `map`        | 提取数组字段    | `` `{{arr \| map('field')}}` ``              |
| `filter`     | 过滤数组        | `` `{{arr \| filter('age > 18')}}` ``        |
| `sum`        | 求和            | `` `{{arr \| sum}}` ``                       |
| `join`       | 数组转字符串    | `` `{{arr \| join(',')}}` ``                 |
| `dateFormat` | 日期格式化      | `` `{{date \| dateFormat('YYYY-MM-DD')}}` `` |
| `default`    | 默认值          | `` `{{val \| default('N/A')}}` ``            |

#### 4.3.5 Output 节点

> 输出节点，将流程结果发送到外部通道。

| 输出类型     | 编码       | 说明            | 配置参数                           |
| ------------ | ---------- | --------------- | ---------------------------------- |
| 飞书消息     | `FEISHU`   | 发送飞书消息    | `chat_id`, `msg_type`, `content`   |
| 邮件         | `EMAIL`    | 发送邮件        | `to`, `subject`, `body`, `is_html` |
| 钉钉         | `DINGTALK` | 钉钉机器人推送  | `webhook_url`, `message`           |
| Webhook 回调 | `CALLBACK` | 回调指定 URL    | `url`, `method`, `body`            |
| 站内消息     | `NOTIFY`   | WebSocket 推送  | `user_id`, `title`, `content`      |
| 数据存储     | `STORAGE`  | 写入数据库/缓存 | `target`, `data`                   |

**模板渲染：**

```json
{
  "outputType": "FEISHU",
  "template": {
    "msg_type": "interactive",
    "card": {
      "header": { "title": { "tag": "plain_text", "content": "流程执行通知" } },
      "elements": [
        {
          "tag": "div",
          "text": {
            "tag": "lark_md",
            "content": "**流程**: {{workflow_name}}\n**状态**: {{status}}\n**时间**: {{timestamp}}"
          }
        }
      ]
    }
  }
}
```

---

### 4.4 执行引擎

#### 4.4.1 执行模式

| 模式       | 说明                           | 示例           |
| ---------- | ------------------------------ | -------------- |
| 串行执行   | 按节点依赖顺序依次执行         | A → B → C      |
| 并行执行   | 多个分支无依赖时并发执行       | A → [B, C] → D |
| 异步执行   | 节点标记异步，引擎等待外部回调 | 人工审批节点   |
| 子流程调用 | 调用另一个已发布流程 (v1.1+)   | 复用公共流程   |

#### 4.4.2 错误处理策略

| 策略     | 编码           | 说明                   | 配置                           |
| -------- | -------------- | ---------------------- | ------------------------------ |
| 重试     | `RETRY`        | 按策略重试 N 次        | `count`, `interval`, `backoff` |
| 跳过     | `SKIP`         | 跳过失败节点，继续后续 | 记录错误，使用默认值           |
| 终止     | `ABORT`        | 终止整个流程执行       | 通知创建者                     |
| 转入分支 | `ERROR_BRANCH` | 走错误处理分支         | 指定 fallback 节点             |

**重试退避策略：**

| 退避方式 | 说明         | 示例         |
| -------- | ------------ | ------------ |
| 固定间隔 | 每次间隔相同 | 5s, 5s, 5s   |
| 线性退避 | 间隔线性增长 | 5s, 10s, 15s |
| 指数退避 | 间隔指数增长 | 5s, 10s, 20s |

> **幂等性说明**：Tool 节点重试调用外部 API 可能产生重复副作用（如重复发积分、重复发消息）。Tool 节点配置支持可选的 `idempotencyKey` 字段（由 `executionId + nodeId + retryCount` 自动生成），传递给支持幂等的外部 API；不支持幂等的外部 API 由工具方自行保证幂等性。

#### 4.4.3 超时控制

| 层级           | 默认值 | 可配置 | 说明             |
| -------------- | ------ | ------ | ---------------- |
| 单节点超时     | 60s    | 是     | 单个节点执行超时 |
| 全局流程超时   | 30min  | 是     | 整个流程执行超时 |
| Agent 节点超时 | 120s   | 是     | LLM 调用超时     |
| Tool 节点超时  | 30s    | 是     | API 调用超时     |

#### 4.4.4 执行队列

| 配置项         | 说明                      | 默认值 |
| -------------- | ------------------------- | ------ |
| 最大并发实例数 | 同时运行的流程实例上限    | 100    |
| 队列等待超时   | 排队超时自动取消          | 300s   |
| 优先级         | 手动触发 > Webhook > 定时 | —      |
| 执行资源隔离   | 每个流程独立沙箱上下文    | —      |

> **队列持久化**：执行队列持久化到数据库（`workflow_execution` 表 `status=PENDING`），服务重启后自动恢复未完成的实例，满足 RTO ≤ 30min 的可用性要求。

#### 4.4.5 执行状态

```text
PENDING ──→ RUNNING ──→ SUCCEEDED
               │
               ├──→ FAILED
               ├──→ TIMEOUT
               ├──→ CANCELLED
               └──→ PAUSED ──→ RUNNING（回调恢复）
```

| 状态   | 编码        | 说明                 |
| ------ | ----------- | -------------------- |
| 等待中 | `PENDING`   | 已入队，等待执行     |
| 运行中 | `RUNNING`   | 正在执行             |
| 已成功 | `SUCCEEDED` | 所有节点执行成功     |
| 已失败 | `FAILED`    | 节点失败且策略为终止 |
| 已超时 | `TIMEOUT`   | 全局或节点超时       |
| 已取消 | `CANCELLED` | 用户手动取消         |
| 已暂停 | `PAUSED`    | 等待异步回调         |

---

### 4.5 执行监控

#### 4.5.1 实时日志

| 功能     | 说明                                                                                                | 优先级 |
| -------- | --------------------------------------------------------------------------------------------------- | ------ |
| 日志流   | 每个节点输出实时日志，通过 `wsServer`（端口 8020/8021）WebSocket 推送，新建 `workflow:log` 命名空间 | P0     |
| 日志级别 | INFO / WARN / ERROR / DEBUG                                                                         | P0     |
| 节点详情 | 输入/输出/耗时/状态                                                                                 | P0     |
| 日志搜索 | 按关键词/级别/节点搜索                                                                              | P1     |
| 日志导出 | 导出单次执行完整日志                                                                                | P2     |

#### 4.5.2 执行详情视图

| 区域         | 说明                                        |
| ------------ | ------------------------------------------- |
| 流程拓扑     | 画布视图，节点实时高亮当前执行位置          |
| 节点列表面板 | 按执行顺序展示每个节点的状态/耗时/输入/输出 |
| 变量上下文   | 当前执行上下文中所有变量值快照              |
| 错误堆栈     | 失败节点展示完整错误信息                    |

#### 4.5.3 性能剖析

| 指标     | 说明                       |
| -------- | -------------------------- |
| 总耗时   | 流程从开始到结束的总时间   |
| 节点耗时 | 每个节点的执行时间         |
| 火焰图   | 节点耗时可视化瀑布图       |
| 等待时间 | 并行分支中各分支的等待时间 |
| 重试次数 | 每个节点的重试统计         |

#### 4.5.4 告警规则

| 规则类型   | 触发条件                       | 通知方式        |
| ---------- | ------------------------------ | --------------- |
| 错误次数   | 单流程 N 分钟内失败次数 ≥ 阈值 | 飞书 + 站内消息 |
| 超时次数   | 单流程 N 分钟内超时次数 ≥ 阈值 | 飞书 + 站内消息 |
| 执行频率   | 执行频率异常波动               | 站内消息        |
| 节点错误率 | 单节点错误率 ≥ 阈值            | 站内消息        |
| 队列积压   | 等待队列长度 ≥ 阈值            | 飞书 + 站内消息 |

#### 4.5.5 执行历史

| 功能     | 说明                              | 优先级 |
| -------- | --------------------------------- | ------ |
| 历史列表 | 最近 1000 条执行记录              | P0     |
| 筛选     | 按流程/状态/时间范围/触发方式筛选 | P0     |
| 详情查看 | 点击查看单次执行完整详情          | P0     |
| 重新执行 | 基于历史输入重新执行              | P1     |
| 对比分析 | 对比两次执行的差异（v1.1+）       | P2     |

---

### 4.6 组件市场

#### 4.6.1 官方工具库

| 功能     | 说明                                   | 优先级 |
| -------- | -------------------------------------- | ------ |
| 内置工具 | 预置 17+ 常用工具（消息/数据/AI/平台） | P0     |
| 工具分类 | 按分类浏览工具                         | P0     |
| 工具搜索 | 按名称/标签搜索                        | P1     |
| 工具详情 | 查看工具参数说明、使用示例             | P0     |

#### 4.6.2 自定义工具

| 功能         | 说明                                | 优先级 |
| ------------ | ----------------------------------- | ------ |
| OpenAPI 导入 | 上传 OpenAPI/Swagger JSON/YAML 定义 | P1     |
| 手动配置     | 手动填写 API endpoint + 参数        | P0     |
| 认证管理     | 配置 API Key / Bearer Token / OAuth | P0     |
| 工具测试     | 在工具管理页面测试调用              | P1     |
| 工具版本     | 工具定义版本管理                    | P2     |

#### 4.6.3 模板市场

| 功能     | 说明                            | 优先级 |
| -------- | ------------------------------- | ------ |
| 官方模板 | 平台提供的标准流程模板          | P0     |
| 社区模板 | 用户分享的流程模板              | P2     |
| 模板分类 | 按场景分类（营销/运维/AI/数据） | P0     |
| 一键安装 | 模板 → 自动创建流程，可编辑     | P0     |
| 模板预览 | 查看模板画布和配置              | P1     |
| 模板评分 | 用户评分 + 使用次数排行         | P2     |

---

### 4.7 数据统计

#### 4.7.1 执行概览 Dashboard

| 指标         | 说明                       | 计算方式                                             |
| ------------ | -------------------------- | ---------------------------------------------------- |
| 今日执行总数 | 今日触发的流程实例数       | `COUNT(execution WHERE DATE(created_at)=TODAY)`      |
| 今日成功率   | 今日成功执行的比例         | `SUCCEEDED / TOTAL`                                  |
| 平均执行耗时 | 今日所有成功执行的平均耗时 | `AVG(duration WHERE status=SUCCEEDED)`               |
| 活跃流程数   | 今日有执行记录的流程数     | `COUNT(DISTINCT workflow_id)`                        |
| 失败次数     | 今日失败+超时的实例数      | `COUNT(execution WHERE status IN [FAILED, TIMEOUT])` |
| 队列积压     | 当前等待中的实例数         | `COUNT(execution WHERE status=PENDING)`              |

**趋势图表：**

| 图表         | 说明                     | 交互           |
| ------------ | ------------------------ | -------------- |
| 执行趋势     | 按日/周的执行量折线图    | 时间范围选择   |
| 成功率趋势   | 按日的成功率折线图       | 叠加失败量对比 |
| 触发方式分布 | 各触发方式占比饼图       | 点击扇区筛选   |
| 耗时分布     | 执行耗时分桶柱状图       | 识别慢流程     |
| 流程排行榜   | TOP10 执行次数最多的流程 | 点击跳转详情   |

#### 4.7.2 流程维度分析

| 指标         | 说明                 |
| ------------ | -------------------- |
| 总执行次数   | 该流程历史执行总次数 |
| 成功率       | 成功执行 / 总执行    |
| 平均耗时     | 该流程平均执行时间   |
| 节点错误率   | 各节点的错误率排名   |
| 触发来源分布 | 各触发方式的执行占比 |
| 每日执行趋势 | 该流程每日执行量变化 |

#### 4.7.3 节点维度分析

| 指标              | 说明                   |
| ----------------- | ---------------------- |
| 节点执行次数      | 该类型节点累计执行次数 |
| 节点平均耗时      | 该类型节点平均执行时间 |
| 节点错误率        | 该类型节点的错误率     |
| 节点错误 Top 原因 | 错误原因分类统计       |

---

### 4.8 系统管理

#### 4.8.1 节点类型注册表

新增节点类型只需在注册表中注册，无需修改核心引擎：

```typescript
// workflow-node.registry.ts
export const NODE_TYPES = {
  AGENT: {
    label: 'AI Agent',
    icon: 'robot',
    component: AgentNodeConfig,
    executor: AgentExecutor
  },
  TOOL: {
    label: '工具调用',
    icon: 'tool',
    component: ToolNodeConfig,
    executor: ToolExecutor
  },
  CONDITION: {
    label: '条件分支',
    icon: 'branch',
    component: ConditionNodeConfig,
    executor: ConditionExecutor
  },
  TRANSFORM: {
    label: '数据转换',
    icon: 'transform',
    component: TransformNodeConfig,
    executor: TransformExecutor
  },
  OUTPUT: {
    label: '输出',
    icon: 'output',
    component: OutputNodeConfig,
    executor: OutputExecutor
  }
  // 新增节点类型只需在此注册
}
```

#### 4.8.2 触发器类型注册表

```typescript
// workflow-trigger.registry.ts
export const TRIGGER_TYPES = {
  CRON: {
    label: '定时触发',
    component: CronTriggerConfig,
    handler: CronTriggerHandler
  },
  WEBHOOK: {
    label: 'Webhook',
    component: WebhookTriggerConfig,
    handler: WebhookTriggerHandler
  },
  MANUAL: {
    label: '手动触发',
    component: ManualTriggerConfig,
    handler: ManualTriggerHandler
  },
  EVENT: {
    label: '事件触发',
    component: EventTriggerConfig,
    handler: EventTriggerHandler
  }
  // 新增触发器类型只需在此注册
}
```

#### 4.8.3 操作日志

| 操作      | 记录内容                   |
| --------- | -------------------------- |
| 创建流程  | 操作人、时间、流程基础信息 |
| 编辑流程  | 操作人、时间、变更字段     |
| 发布流程  | 操作人、时间、版本号       |
| 暂停/下线 | 操作人、时间               |
| 手动执行  | 操作人、时间、输入参数     |
| 取消执行  | 操作人、时间、执行实例 ID  |
| 删除流程  | 操作人、时间（软删除）     |
| 组件安装  | 操作人、时间、组件信息     |

---

## 五、核心数据模型

### 5.1 ER 关系图

```text
workflow_category (流程分类)
    │
    └── 1:N ──→ workflow (流程定义)
                    │
                    ├── 1:N ──→ workflow_version (版本快照)
                    │
                    └── 1:N ──→ workflow_execution (执行实例)
                                    │
                                    └── 1:N ──→ execution_step_log (节点执行日志)

workflow_template (流程模板) ← 独立，用于模板市场

workflow_tool (工具定义) ← 独立，用于组件市场

workflow_alert_rule (告警规则) ← 关联 workflow_id（NULL=全局规则）

workflow_audit_log (审计日志) ← 关联 workflow_id + user_id
```

> **说明**：触发器配置和节点定义不单独建表，而是以 JSON 结构存储在 `workflow.graph_data` 字段中（详见 5.3 节）。`graph_data` 包含完整的节点拓扑（触发器节点 + 步骤节点 + 连线），支持版本快照和回滚。

### 5.2 Prisma Model 定义

> 后端使用 **Prisma 6 + MySQL**，遵循项目 `prisma/schema.prisma` 约定：Model 名 PascalCase，字段名 camelCase，通过 `@map` / `@@map` 映射到 `snake_case` 表名和列名。新表时间字段统一用 `DateTime`，主键用 `BigInt @id @default(autoincrement())` + `@db.UnsignedBigInt`。

```prisma
// ============================================
// 流程编排系统 - Prisma Model 定义
// 追加至 prisma/schema.prisma
// ============================================

/// 流程分类表
model WorkflowCategory {
  id          BigInt   @id @default(autoincrement()) @db.UnsignedBigInt
  name        String   @map("name") @db.VarChar(64)
  code        String   @map("code") @db.VarChar(32)
  icon        String?  @map("icon") @db.VarChar(128)
  description String?  @map("description") @db.VarChar(255)
  sortOrder   Int      @default(0) @map("sort_order")
  enabled     Boolean  @default(true) @map("enabled") @db.TinyInt
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @default(now()) @updatedAt @map("updated_at")
  workflows   Workflow[]

  @@unique([code], map: "uk_code")
  @@map("workflow_category")
}

/// 流程定义表
model Workflow {
  id             BigInt   @id @default(autoincrement()) @db.UnsignedBigInt
  workflowNo     String   @map("workflow_no") @db.VarChar(32)
  name           String   @map("name") @db.VarChar(128)
  description    String?  @map("description") @db.Text
  icon           String?  @map("icon") @db.VarChar(128)
  categoryId     BigInt   @map("category_id") @db.UnsignedBigInt
  tags           Json?    @map("tags")
  status         String   @default("DRAFT") @map("status") @db.VarChar(16) // DRAFT/PENDING/PUBLISHED/REJECTED/PAUSED/OFFLINE
  currentVersion Int      @default(0) @map("current_version")
  graphData      Json     @map("graph_data") // 画布图数据（节点+连线拓扑，含触发器配置）
  globalConfig   Json?    @map("global_config") // 全局配置（超时/并发等）
  creatorId      BigInt   @map("creator_id") @db.UnsignedBigInt
  auditorId      BigInt?  @map("auditor_id") @db.UnsignedBigInt
  auditedAt      DateTime? @map("audited_at")
  auditRemark    String?  @map("audit_remark") @db.VarChar(255)
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @default(now()) @updatedAt @map("updated_at")
  deletedAt      DateTime? @map("deleted_at") // 软删除

  category       WorkflowCategory @relation(fields: [categoryId], references: [id])
  versions       WorkflowVersion[]
  executions     WorkflowExecution[]
  alertRules     WorkflowAlertRule[]

  @@unique([workflowNo], map: "uk_workflow_no")
  @@index([categoryId], map: "idx_category")
  @@index([status], map: "idx_status")
  @@index([creatorId], map: "idx_creator")
  @@index([deletedAt], map: "idx_deleted")
  @@map("workflow")
}

/// 流程版本表
model WorkflowVersion {
  id           BigInt   @id @default(autoincrement()) @db.UnsignedBigInt
  workflowId   BigInt   @map("workflow_id") @db.UnsignedBigInt
  version      Int      @map("version")
  graphData    Json     @map("graph_data")
  globalConfig Json?    @map("global_config")
  changeNote   String?  @map("change_note") @db.VarChar(255)
  createdBy    BigInt   @map("created_by") @db.UnsignedBigInt
  createdAt    DateTime @default(now()) @map("created_at")

  workflow     Workflow @relation(fields: [workflowId], references: [id], onDelete: Cascade)

  @@unique([workflowId, version], map: "uk_workflow_version")
  @@index([workflowId], map: "idx_workflow")
  @@map("workflow_version")
}

/// 流程执行实例表
model WorkflowExecution {
  id              BigInt   @id @default(autoincrement()) @db.UnsignedBigInt
  executionNo     String   @map("execution_no") @db.VarChar(32)
  workflowId      BigInt   @map("workflow_id") @db.UnsignedBigInt
  workflowVersion Int      @map("workflow_version")
  status          String   @default("PENDING") @map("status") @db.VarChar(16) // PENDING/RUNNING/SUCCEEDED/FAILED/TIMEOUT/CANCELLED/PAUSED
  triggerType     String   @map("trigger_type") @db.VarChar(16) // CRON/WEBHOOK/MANUAL/EVENT
  triggerData     Json?    @map("trigger_data")
  context         Json?    @map("context") // 执行上下文（所有变量快照）
  result          Json?    @map("result")
  errorMessage    String?  @map("error_message") @db.Text
  errorNodeId     String?  @map("error_node_id") @db.VarChar(64)
  durationMs      Int?     @map("duration_ms")
  startedAt       DateTime? @map("started_at")
  finishedAt      DateTime? @map("finished_at")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @default(now()) @updatedAt @map("updated_at")

  workflow        Workflow @relation(fields: [workflowId], references: [id])
  stepLogs        ExecutionStepLog[]

  @@unique([executionNo], map: "uk_execution_no")
  @@index([workflowId], map: "idx_workflow")
  @@index([status], map: "idx_status")
  @@index([triggerType], map: "idx_trigger")
  @@index([createdAt], map: "idx_created")
  @@map("workflow_execution")
}

/// 节点执行日志表
model ExecutionStepLog {
  id           BigInt   @id @default(autoincrement()) @db.UnsignedBigInt
  executionId  BigInt   @map("execution_id") @db.UnsignedBigInt
  nodeId       String   @map("node_id") @db.VarChar(64)
  nodeType     String   @map("node_type") @db.VarChar(32) // AGENT/TOOL/CONDITION/TRANSFORM/OUTPUT
  nodeName     String?  @map("node_name") @db.VarChar(128)
  status       String   @map("status") @db.VarChar(16) // PENDING/RUNNING/SUCCEEDED/FAILED/SKIPPED
  inputData    Json?    @map("input_data")
  outputData   Json?    @map("output_data")
  errorMessage String?  @map("error_message") @db.Text
  retryCount   Int      @default(0) @map("retry_count")
  durationMs   Int?     @map("duration_ms")
  startedAt    DateTime? @map("started_at")
  finishedAt   DateTime? @map("finished_at")
  createdAt    DateTime @default(now()) @map("created_at")

  execution    WorkflowExecution @relation(fields: [executionId], references: [id], onDelete: Cascade)

  @@index([executionId], map: "idx_execution")
  @@index([nodeId], map: "idx_node")
  @@index([status], map: "idx_status")
  @@map("execution_step_log")
}

/// 工具定义表
model WorkflowTool {
  id           BigInt   @id @default(autoincrement()) @db.UnsignedBigInt
  name         String   @map("name") @db.VarChar(64)
  code         String   @map("code") @db.VarChar(64)
  category     String   @map("category") @db.VarChar(32)
  description  String?  @map("description") @db.VarChar(255)
  icon         String?  @map("icon") @db.VarChar(128)
  endpoint     String?  @map("endpoint") @db.VarChar(255)
  method       String   @default("GET") @map("method") @db.VarChar(16)
  authConfig   Json?    @map("auth_config")
  paramSchema  Json     @map("param_schema")
  outputSchema Json?    @map("output_schema")
  isBuiltin    Boolean  @default(false) @map("is_builtin") @db.TinyInt
  enabled      Boolean  @default(true) @map("enabled") @db.TinyInt
  creatorId    BigInt?  @map("creator_id") @db.UnsignedBigInt
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @default(now()) @updatedAt @map("updated_at")

  @@unique([code], map: "uk_code")
  @@index([category], map: "idx_category")
  @@index([isBuiltin], map: "idx_builtin")
  @@map("workflow_tool")
}

/// 流程模板表
model WorkflowTemplate {
  id           BigInt   @id @default(autoincrement()) @db.UnsignedBigInt
  name         String   @map("name") @db.VarChar(128)
  description  String?  @map("description") @db.Text
  icon         String?  @map("icon") @db.VarChar(128)
  category     String   @map("category") @db.VarChar(32)
  graphData    Json     @map("graph_data")
  globalConfig Json?    @map("global_config")
  previewImage String?  @map("preview_image") @db.VarChar(255)
  authorId     BigInt?  @map("author_id") @db.UnsignedBigInt
  isOfficial   Boolean  @default(false) @map("is_official") @db.TinyInt
  installCount Int      @default(0) @map("install_count")
  rating       Decimal  @default(0.0) @map("rating") @db.Decimal(3, 1)
  enabled      Boolean  @default(true) @map("enabled") @db.TinyInt
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @default(now()) @updatedAt @map("updated_at")

  @@index([category], map: "idx_category")
  @@index([isOfficial], map: "idx_official")
  @@map("workflow_template")
}

/// 告警规则表
model WorkflowAlertRule {
  id             BigInt   @id @default(autoincrement()) @db.UnsignedBigInt
  workflowId     BigInt?  @map("workflow_id") @db.UnsignedBigInt // NULL=全局规则
  ruleType       String   @map("rule_type") @db.VarChar(32) // ERROR_COUNT/TIMEOUT_COUNT/ERROR_RATE/QUEUE_BACKLOG
  threshold      Int      @map("threshold")
  windowMinutes  Int      @default(5) @map("window_minutes")
  notifyChannels Json     @map("notify_channels") // ["FEISHU","NOTIFY"]
  notifyUsers    Json?    @map("notify_users")
  enabled        Boolean  @default(true) @map("enabled") @db.TinyInt
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @default(now()) @updatedAt @map("updated_at")

  workflow       Workflow? @relation(fields: [workflowId], references: [id], onDelete: Cascade)

  @@index([workflowId], map: "idx_workflow")
  @@index([enabled], map: "idx_enabled")
  @@map("workflow_alert_rule")
}

/// 审计日志表
model WorkflowAuditLog {
  id         BigInt   @id @default(autoincrement()) @db.UnsignedBigInt
  workflowId BigInt?  @map("workflow_id") @db.UnsignedBigInt
  userId     BigInt   @map("user_id") @db.UnsignedBigInt
  action     String   @map("action") @db.VarChar(32) // CREATE/EDIT/PUBLISH/PAUSE/OFFLINE/EXECUTE/CANCEL/DELETE
  detail     Json?    @map("detail")
  ipAddress  String?  @map("ip_address") @db.VarChar(64)
  createdAt  DateTime @default(now()) @map("created_at")

  @@index([workflowId], map: "idx_workflow")
  @@index([userId], map: "idx_user")
  @@index([action], map: "idx_action")
  @@index([createdAt], map: "idx_created")
  @@map("workflow_audit_log")
}
```

> **命名映射说明**：Prisma 字段名使用 camelCase（如 `createdAt`），通过 `@map("created_at")` 映射到数据库 `snake_case` 列名；Model 名使用 PascalCase（如 `WorkflowCategory`），通过 `@@map("workflow_category")` 映射到表名。接口层返回时，`BigInt` 主键由 `serializeBigInt()` 转为 `Number`。

### 5.3 graph_data JSON 结构约定

`workflow.graph_data` 存储画布拓扑，结构如下：

```json
{
  "nodes": [
    {
      "id": "node_1",
      "type": "TRIGGER",
      "name": "Webhook 触发",
      "position": { "x": 100, "y": 200 },
      "config": {
        "triggerType": "WEBHOOK",
        "path": "/webhook/order",
        "method": "POST"
      }
    },
    {
      "id": "node_2",
      "type": "AGENT",
      "name": "内容分析",
      "position": { "x": 350, "y": 200 },
      "config": {
        "model": "gpt-4o",
        "systemPrompt": "你是一个内容分析助手，请分析以下内容：{{trigger.body.content}}",
        "inputSchema": {
          "type": "object",
          "properties": { "content": { "type": "string" } }
        },
        "outputSchema": {
          "type": "object",
          "properties": {
            "summary": { "type": "string" },
            "sentiment": { "type": "string" }
          }
        },
        "temperature": 0.7,
        "maxTokens": 2048,
        "retry": { "count": 3, "interval": 5, "backoff": "exponential" },
        "timeout": 120
      }
    },
    {
      "id": "node_3",
      "type": "OUTPUT",
      "name": "发送通知",
      "position": { "x": 600, "y": 200 },
      "config": {
        "outputType": "FEISHU",
        "chat_id": "oc_xxx",
        "template": {
          "msg_type": "text",
          "content": "分析结果：{{step2.output.summary}}"
        }
      }
    }
  ],
  "edges": [
    { "id": "edge_1", "source": "node_1", "target": "node_2" },
    { "id": "edge_2", "source": "node_2", "target": "node_3" }
  ]
}
```

---

## 六、页面结构

### 6.1 路由规划

> 路由文件遵循项目约定：管理端路由追加到 `src/router/homePages/manage.ts`，用户端路由新建 `src/router/homePages/workflow.ts`。路由 `meta` 包含 `title`（面包屑数组）、`permission`（RBAC 权限码）、`keepAlive`（是否缓存）。

```text
管理端（追加至 manage.ts，父路由 /home/manageHomePage）
└── workflow
    ├── overview          -- 流程概览（统计 Dashboard）     permission: system:workflow:list
    ├── list              -- 流程列表（CRUD + 生命周期管理） permission: system:workflow:list
    ├── designer/:id?     -- 流程编排器（画布编辑）          permission: system:workflow:design
    ├── execution/:id     -- 执行详情（日志 + 拓扑）         permission: system:workflow:list
    ├── history           -- 执行历史列表                    permission: system:workflow:list
    ├── templates         -- 模板市场                        permission: system:workflow:list
    ├── tools             -- 工具管理（工具库 + 自定义工具）  permission: system:workflow:list
    ├── categories        -- 流程分类管理                    permission: system:workflow:operate
    └── alerts            -- 告警规则配置                    permission: system:workflow:operate

用户端（新建 workflow.ts，父路由 /home/workflowHomePage）
└── status                -- 我的流程执行状态（只读查看）     permission: 无（登录即可见）
```

### 6.2 关键页面布局

#### 6.2.1 流程编排器（designer）

> 核心页面，三栏布局。

```text
┌─────────────────────────────────────────────────────────┐
│  顶部工具栏：流程名称 | 保存 | 测试运行 | 发布 | 撤销/重做  │
├──────────┬──────────────────────────────┬───────────────┤
│          │                              │               │
│  左侧    │                              │   右侧        │
│  节点    │        画布区域               │   配置面板    │
│  面板    │     （拖拽编排节点）           │  （节点参数）  │
│          │                              │               │
│  - 触发器 │                              │  - 基础配置   │
│  - Agent │                              │  - 参数映射   │
│  - Tool  │                              │  - 错误处理   │
│  - 条件  │                              │  - 输入输出   │
│  - 转换  │                              │               │
│  - 输出  │                              │               │
│          │                              │               │
├──────────┴──────────────────────────────┴───────────────┤
│  底部状态栏：节点数 | 连线数 | 最后保存时间 | 缩放比例       │
└─────────────────────────────────────────────────────────┘
```

#### 6.2.2 执行详情（execution）

```text
┌─────────────────────────────────────────────────────────┐
│  执行编号 | 流程名称 | 状态标签 | 耗时 | 触发方式          │
├──────────────────────────────┬──────────────────────────┤
│                              │                          │
│      画布拓扑视图              │    节点执行日志           │
│   （节点实时高亮状态）          │   （按执行顺序排列）       │
│                              │                          │
│   绿=成功  红=失败            │   Node 1: ✅ 200ms       │
│   黄=运行  灰=等待            │     输入: {...}          │
│                              │     输出: {...}          │
│                              │                          │
│                              │   Node 2: 🔴 5s          │
│                              │     Error: API timeout   │
│                              │                          │
├──────────────────────────────┴──────────────────────────┤
│  底部 Tab：日志流 | 变量上下文 | 性能剖析 | 错误详情        │
└─────────────────────────────────────────────────────────┘
```

#### 6.2.3 流程概览（overview）

| 区域         | 说明                                         |
| ------------ | -------------------------------------------- |
| 顶部指标卡片 | 今日执行数/成功率/平均耗时/失败次数/队列积压 |
| 趋势图表区   | 执行趋势折线图 + 成功率趋势 + 触发方式分布   |
| 流程排行     | TOP10 执行次数/失败次数排行                  |
| 告警面板     | 最近触发的告警列表                           |

#### 6.2.4 空态与权限提示

| 场景       | 展示                               |
| ---------- | ---------------------------------- |
| 无流程     | 引导创建流程或浏览模板市场         |
| 无执行历史 | 引导手动触发一次测试运行           |
| 无权限     | "您没有流程管理权限，请联系管理员" |
| 回收站为空 | "回收站中没有已删除的流程"         |

---

## 七、接口概要

> **路径约定**：后端通过 Express 中间件全局剥离 `/api` 前缀（`/api/xxx` → `/xxx`），下表路径均为 Controller 注册路径（不含 `/api`）。前端 axios `baseURL` 设为空字符串，`/api` 前缀由 `apiInfoStore`（Pinia store，持久化到 sessionStorage，默认值 `/api`）在运行时拼接，生产环境由 Nginx 反代 `/api` → 后端。
>
> **响应格式**：统一 `{ status: boolean, msg: string, data: any }`，由后端 `ResponseInterceptor` 自动包装；SSE 流式接口标记 `@RawResponse()` 跳过包装。特殊错误场景可附加 `code: string` 字段标识错误码。
>
> **认证**：全局 `AuthGuard` 守卫，公开接口用 `@Public()` 装饰器标记；权限校验用 `@RequirePermissions('code')` 装饰器。
>
> **Mock 切换**：前端通过 `VITE_WORKFLOW_MOCK` 环境变量控制（`'false'` 时走真实 API，默认 Mock），与积分/任务/AI 助手模块的 `VITE_*_MOCK` 机制一致。

### 7.1 流程管理接口

| 接口                                 | 方法   | 说明                            | 权限                      |
| ------------------------------------ | ------ | ------------------------------- | ------------------------- |
| `workflows`                          | GET    | 流程列表（分类/状态/搜索/分页） | `system:workflow:list`    |
| `workflows`                          | POST   | 创建流程                        | `system:workflow:create`  |
| `workflows/:id`                      | GET    | 流程详情（含画布数据）          | `system:workflow:list`    |
| `workflows/:id`                      | PUT    | 更新流程（自动生成版本）        | `system:workflow:design`  |
| `workflows/:id`                      | DELETE | 删除流程（软删除）              | `system:workflow:delete`  |
| `workflows/:id/copy`                 | POST   | 克隆流程                        | `system:workflow:create`  |
| `workflows/:id/publish`              | POST   | 提交发布审核                    | `system:workflow:publish` |
| `workflows/:id/audit`                | POST   | 审核流程                        | `system:workflow:audit`   |
| `workflows/:id/pause`                | POST   | 暂停流程                        | `system:workflow:publish` |
| `workflows/:id/resume`               | POST   | 恢复流程                        | `system:workflow:publish` |
| `workflows/:id/offline`              | POST   | 下线流程                        | `system:workflow:publish` |
| `workflows/:id/restore`              | POST   | 从回收站恢复                    | `system:workflow:delete`  |
| `workflows/:id/versions`             | GET    | 版本列表                        | `system:workflow:list`    |
| `workflows/:id/versions/:v/rollback` | POST   | 回滚到指定版本                  | `system:workflow:design`  |

### 7.2 流程执行接口

| 接口                             | 方法     | 说明                   | 权限                      |
| -------------------------------- | -------- | ---------------------- | ------------------------- |
| `workflows/:id/execute`          | POST     | 手动触发执行           | `system:workflow:execute` |
| `workflows/:id/test`             | POST     | 测试运行（草稿态）     | `system:workflow:design`  |
| `workflow-executions`            | GET      | 执行历史列表           | `system:workflow:list`    |
| `workflow-executions/:id`        | GET      | 执行详情（含节点日志） | `system:workflow:list`    |
| `workflow-executions/:id/cancel` | POST     | 取消执行               | `system:workflow:execute` |
| `workflow-executions/:id/logs`   | GET      | 节点执行日志           | `system:workflow:list`    |
| `workflow-executions/:id/rerun`  | POST     | 重新执行               | `system:workflow:execute` |
| `webhook/:path`                  | POST/GET | Webhook 触发入口       | `@Public()`（HMAC 校验）  |

### 7.3 组件市场接口

| 接口                             | 方法   | 说明              | 权限                      |
| -------------------------------- | ------ | ----------------- | ------------------------- |
| `workflow-tools`                 | GET    | 工具列表          | `system:workflow:list`    |
| `workflow-tools`                 | POST   | 创建自定义工具    | `system:workflow:operate` |
| `workflow-tools/:id`             | PUT    | 更新工具          | `system:workflow:operate` |
| `workflow-tools/:id`             | DELETE | 删除工具          | `system:workflow:operate` |
| `workflow-tools/import`          | POST   | 导入 OpenAPI 定义 | `system:workflow:operate` |
| `workflow-tools/:id/test`        | POST   | 测试工具调用      | `system:workflow:operate` |
| `workflow-templates`             | GET    | 模板列表          | `system:workflow:list`    |
| `workflow-templates/:id`         | GET    | 模板详情          | `system:workflow:list`    |
| `workflow-templates/:id/install` | POST   | 一键安装模板      | `system:workflow:create`  |
| `workflow-templates`             | POST   | 发布模板          | `system:workflow:operate` |

### 7.4 统计与告警接口

| 接口                            | 方法                | 说明         | 权限                      |
| ------------------------------- | ------------------- | ------------ | ------------------------- |
| `workflows/statistics/overview` | GET                 | 统计概览     | `system:workflow:list`    |
| `workflows/statistics/trend`    | GET                 | 执行趋势     | `system:workflow:list`    |
| `workflows/statistics/:id`      | GET                 | 单流程分析   | `system:workflow:list`    |
| `workflows/statistics/export`   | POST                | 数据导出     | `system:workflow:list`    |
| `workflow-alerts`               | GET/POST/PUT/DELETE | 告警规则管理 | `system:workflow:operate` |

### 7.5 分类管理接口

| 接口                  | 方法                | 说明          | 权限                      |
| --------------------- | ------------------- | ------------- | ------------------------- |
| `workflow-categories` | GET/POST/PUT/DELETE | 流程分类 CRUD | `system:workflow:operate` |

### 7.6 接口响应示例

```typescript
// GET workflows 响应
// 注：BigInt 主键经 serializeBigInt() 转为 Number 返回
{
  "status": true,
  "msg": "ok",
  "data": {
    "list": [
      {
        "id": 1,
        "workflowNo": "WF20260909001",
        "name": "订单分析流程",
        "description": "接收订单 Webhook，AI 分析后推送飞书通知",
        "category": { "id": 1, "name": "业务自动化", "code": "BIZ" },
        "status": "PUBLISHED",
        "currentVersion": 3,
        "triggerType": "WEBHOOK",
        "tags": ["订单", "AI分析"],
        "creator": { "id": 1, "name": "张三" },
        "lastExecutedAt": "2026-09-09T10:30:00Z",
        "executionCount": 128,
        "successRate": 0.95,
        "createdAt": "2026-09-01T08:00:00Z",
        "updatedAt": "2026-09-08T16:00:00Z"
      }
    ],
    "pagination": { "page": 1, "pageSize": 20, "total": 35 }
  }
}
```

---

## 八、非功能性需求

### 8.1 性能指标

| 指标            | 目标    | 说明                     |
| --------------- | ------- | ------------------------ |
| 画布加载        | < 2s    | 100 节点规模，含画布渲染 |
| 节点拖拽响应    | < 100ms | 拖拽/缩放操作            |
| 流程冷启动      | < 500ms | 从触发到首个节点开始     |
| API 响应（p99） | ≤ 500ms | 管理端接口               |
| 画布操作帧率    | ≥ 30fps | 拖拽/缩放流畅度          |
| 日志推送延迟    | < 1s    | WebSocket 实时推送       |

### 8.2 并发与容量

| 指标             | 目标              |
| ---------------- | ----------------- |
| 并发流程实例     | ≥ 100 个同时运行  |
| 并发节点执行     | ≥ 500 个同时执行  |
| 执行历史保留     | 最近 1000 条/流程 |
| 日志保留         | 30 天             |
| 单流程最大节点数 | 200               |
| Webhook 请求限制 | 100 次/分钟/路径  |

### 8.3 兼容性

| 类型     | 要求                                             |
| -------- | ------------------------------------------------ |
| 浏览器   | Chrome 90+ / Firefox 88+ / Edge 90+ / Safari 14+ |
| 分辨率   | 最低 1280×720，推荐 1920×1080                    |
| 画布交互 | 支持鼠标 + 触控板（不支持移动端触屏编排）        |

### 8.4 安全

| 维度         | 要求                                                             |
| ------------ | ---------------------------------------------------------------- |
| 权限模型     | 基于 `sys_menu` 表 + RBAC 权限码，`super_admin` 绕过所有权限校验 |
| 认证         | JWT + 全局 `AuthGuard` 守卫（与现有体系一致）                    |
| 敏感数据     | API Key / Secret 加密存储（AES-256），运行时内存隔离             |
| Webhook 认证 | HMAC 签名校验 / Bearer Token                                     |
| 审计日志     | 所有操作记录到 `workflow_audit_log` 表                           |
| 脚本沙箱     | Transform 节点表达式在受限沙箱执行，禁用文件/网络 API            |
| 请求体限制   | Webhook 请求体 ≤ 1MB                                             |

### 8.5 可用性

| 指标         | 目标                       |
| ------------ | -------------------------- |
| 系统可用性   | ≥ 99.9%                    |
| 数据持久性   | ≥ 99.999%                  |
| 执行引擎容错 | 节点故障不影响其他流程实例 |
| 灾难恢复     | RTO ≤ 30min，RPO ≤ 5min    |

---

## 九、扩展性设计

### 9.1 可插拔扩展点

| 扩展点     | 机制                           | 新增步骤                                    |
| ---------- | ------------------------------ | ------------------------------------------- |
| 节点类型   | 注册表模式（`NODE_TYPES`）     | 实现 `executor` + `config component` → 注册 |
| 触发器类型 | 注册表模式（`TRIGGER_TYPES`）  | 实现 `handler` + `config component` → 注册  |
| 工具       | 工具定义表 + OpenAPI 导入      | 配置 API endpoint 或导入 Swagger            |
| 输出通道   | 策略模式（`OUTPUT_HANDLERS`）  | 实现 `send` 方法 → 注册                     |
| 告警规则   | 策略模式（`ALERT_RULE_TYPES`） | 实现检测逻辑 → 注册                         |

### 9.2 新增节点类型示例

```typescript
// 1. 实现 Executor
class LoopExecutor implements NodeExecutor {
  async execute(
    context: ExecutionContext,
    config: LoopConfig
  ): Promise<NodeResult> {
    const items = resolveVariable(config.dataSource, context)
    const results = []
    for (const item of items) {
      const result = await this.executeSubFlow(context, config.subFlow, item)
      results.push(result)
    }
    return { status: 'SUCCEEDED', output: { results } }
  }
}

// 2. 实现配置组件
// LoopNodeConfig.vue — 用户配置循环数据源和子流程

// 3. 注册
NODE_TYPES.LOOP = {
  label: '循环迭代',
  icon: 'loop',
  component: LoopNodeConfig,
  executor: LoopExecutor
}
```

### 9.3 与现有系统集成

| 现有模块          | 集成方式       | 说明                                                                                                                                                                 |
| ----------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **RBAC 权限系统** | 权限点注册     | 新增 `system:workflow:*` 权限码，在 `sys_menu` 表注册对应菜单/按钮项，并在 `prisma/seed-rbac.ts` 中为 `admin`、`super_admin` 角色分配默认权限                        |
| **通知系统**      | WebSocket 推送 | 执行告警、流程状态变更通知走现有 `notifyServer`（端口 8030/8031）；实时执行日志推送建议在 `wsServer`（端口 8020/8021）新建 `workflow:log` 命名空间，复用现有连接通道 |
| **日志管理体系**  | 审计日志上报   | 操作日志写入现有 `logApi`，业务日志走独立 `workflow_audit_log`                                                                                                       |
| **AI 助手**       | Agent 节点调用 | 复用现有 AI 助手的 LangChain `ChatOpenAI` 配置（存储在 `app_info` 表）；**v1.0 仅支持 OpenAI 兼容 API**，Claude / Gemini / LLaMA 等多模型切换为 v1.1+ 规划           |
| **积分管理体系**  | Tool 节点调用  | 内置「积分发放」工具，通过 HTTP 调用 `POST /points/operate` 接口（与前端 `pointsApi` 一致），非直接 Service 层调用                                                   |
| **任务管理体系**  | Tool 节点调用  | 内置「任务创建」工具，调用任务系统 API `POST /tasks`                                                                                                                 |
| **IM 通讯**       | Output 节点    | 飞书消息输出节点复用 IM API 发送消息                                                                                                                                 |
| **分析系统**      | 事件上报       | 流程执行事件上报到 analytics 模块                                                                                                                                    |

### 9.4 分析事件上报

| 事件                 | 说明     |
| -------------------- | -------- |
| `workflow_created`   | 创建流程 |
| `workflow_published` | 发布流程 |
| `workflow_executed`  | 执行流程 |
| `workflow_succeeded` | 执行成功 |
| `workflow_failed`    | 执行失败 |
| `workflow_cancelled` | 取消执行 |
| `template_installed` | 安装模板 |

---

## 十、版本规划

| 版本      | 范围                                                           | 预计周期 |
| --------- | -------------------------------------------------------------- | -------- |
| **v0.1**  | MVP — 基础画布 + Agent 节点 + 手动触发 + 执行引擎 + 日志       | Week 4   |
| **v0.2**  | Tool 节点 + Condition 节点 + Transform 节点 + Output 节点      | Week 6   |
| **v0.3**  | Webhook/定时触发 + 执行监控 + 执行历史 + 告警规则              | Week 8   |
| **v1.0**  | 组件市场 + 模板市场 + 权限集成 + 版本管理 + 统计 Dashboard     | Week 12  |
| **v1.1+** | Loop 节点 + Sub-workflow 节点 + 事件触发 + 版本对比 + 社区模板 | Week 16+ |

> **说明**：本文档对应 v1.0 正式版范围，v0.1–v0.3 为内部迭代版本，不在本文档覆盖范围内。

---

## 附录

### A. 术语表

| 术语       | 英文                   | 定义                                     |
| ---------- | ---------------------- | ---------------------------------------- |
| 工作流     | Workflow               | 一个完整的业务流程定义                   |
| 节点       | Node / Step            | 工作流中的原子执行单元                   |
| 触发器     | Trigger                | 工作流的启动条件                         |
| 分支       | Branch                 | 并行或条件执行路径                       |
| 执行实例   | Execution              | 一次流程运行的记录                       |
| 边         | Edge                   | 节点间的连接线，表示执行依赖             |
| 画布       | Canvas                 | 可视化编排区域                           |
| 图数据     | Graph Data             | 画布拓扑结构（节点 + 连线）的 JSON 表示  |
| Schema     | Schema                 | 节点输入/输出的数据结构定义              |
| 变量插值   | Variable Interpolation | 在配置中使用 `{{}}` 引用上下文变量       |
| 执行上下文 | Execution Context      | 流程执行期间所有变量的快照               |
| 组件市场   | Component Market       | 工具和模板的浏览/安装入口                |
| 输出处理器 | Output Handler         | 输出节点的策略模式实现，每种输出通道一个 |
| 幂等键     | Idempotency Key        | Tool 节点重试时防止重复副作用的唯一标识  |

### B. 竞品参考

| 产品              | 可借鉴点                               |
| ----------------- | -------------------------------------- |
| Dify              | AI Agent 编排、多模型管理、提示词模板  |
| n8n               | 节点类型丰富、可视化连线、社区模板生态 |
| Coze              | 插件机制、Bot 发布、知识库集成         |
| Zapier            | 触发器-动作模式、海量工具集成          |
| Make (Integromat) | 复杂路由、迭代器、错误处理可视化       |

### C. 版本记录

| 版本 | 日期       | 变更内容                                                                                           |
| ---- | ---------- | -------------------------------------------------------------------------------------------------- |
| v1.0 | 2026-09-09 | 按需求文档输出规范重构：补充数据模型、接口设计、页面路由、扩展性设计、用户角色对齐、非功能需求量化 |

---

**文档维护人**：产品团队
