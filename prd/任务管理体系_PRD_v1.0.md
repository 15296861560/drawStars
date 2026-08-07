# 任务管理体系 — 产品需求设计文档（PRD）

> **项目**: drawStars (Vue3)
> **版本**: v1.0
> **日期**: 2026-08-07
> **状态**: 功能补齐（P0–P9 主路径已落地）
> **关联系统**: 积分管理体系、用户体系、RBAC 权限系统、通知系统（WebSocket）

---

## 一、需求背景与目标

### 1.1 背景

drawStars 平台已具备用户管理、权限体系、积分系统、AI 助手、问卷调研等基础能力，但缺少一套**游戏化的任务驱动机制**来串联各模块、引导用户行为。任务管理模块旨在为平台提供一套**可发布、可分配、可拆解、可追踪、可统计**的任务大厅工具，服务于以下场景：

- 日常活跃激励（签到、分享、浏览）
- 运营活动驱动（限时挑战、节日任务）
- 用户成长引导（新手任务、成就体系）
- 定向任务派发（管理员指派、团队协作）
- 复杂目标拆解（主线任务 → 子任务链）

### 1.2 设计目标

| 目标           | 说明                                                         |
| -------------- | ------------------------------------------------------------ |
| **游戏化体验** | 任务大厅 + 奖励驱动，让玩家/用户有"刷任务"的动力             |
| **灵活发布**   | 运营无需技术背景，通过后台配置即可发布各类任务               |
| **可分配**     | 支持公开任务（大厅领取）和定向分配（指派给特定用户/角色）    |
| **可拆解**     | 支持主任务 → 子任务的树形拆解，追踪每步进度                  |
| **多奖励类型** | 积分、实物、虚拟道具、优惠券、称号/徽章，可组合发放          |
| **数据可观测** | 完整的统计看板 + 数据导出，支撑运营决策                      |
| **消息触达**   | 任务全生命周期通知（接取提醒、即将过期、完成祝贺、奖励到账） |
| **可扩展**     | 任务类型、条件类型、奖励类型均可后续扩展，不改动核心流程     |

### 1.3 不在本期范围

- 任务交易市场（用户间转卖任务）
- 任务协作（多人共同完成同一任务）
- 付费任务 / 悬赏模式
- 任务脚本/自动化执行引擎

---

## 二、用户角色

| 角色                 | 说明                                   | 核心诉求                     |
| -------------------- | -------------------------------------- | ---------------------------- |
| **普通用户（玩家）** | 浏览任务大厅、接取/完成任务、领取奖励  | 简单易懂、奖励明确、成就感   |
| **任务发布者**       | 创建/编辑/发布任务，查看自己任务的数据 | 快速配置、灵活分配、直观分析 |
| **任务审核者**       | 审核需人工确认的提交内容               | 高效审核、批量操作           |
| **平台管理员**       | 管理所有任务、配置规则、查看全局数据   | 管控、审计、全局统计         |

> 角色与现有 RBAC 权限体系集成，通过菜单权限 `system:task:list`、`system:task:operate`、`system:task:audit` 等控制可见性。

---

## 三、功能模块总览

```
任务管理
├── 1. 任务设计（创建/编辑）
│   ├── 基础信息（标题/描述/图标/分类）
│   ├── 条件配置（触发条件/目标次数/组合逻辑）
│   ├── 奖励配置（积分/实物/虚拟物品/组合）
│   ├── 时间配置（生效时段/截止时间/周期）
│   ├── 子任务拆解（树形子任务编排）
│   └── 分配设置（公开/定向指派/角色分配）
├── 2. 任务大厅（用户侧）
│   ├── 任务列表（分类筛选/排序/搜索）
│   ├── 任务详情（条件/奖励/进度展示）
│   ├── 接取/完成任务
│   ├── 我的任务面板（进行中/已完成/已过期）
│   └── 成就墙（长期成就展示）
├── 3. 任务管理（生命周期）
│   ├── 创建/编辑/复制/删除
│   ├── 审核流程（草稿→待审→上线/驳回）
│   ├── 上线/暂停/下线
│   └── 任务分配（定向指派/批量分配）
├── 4. 奖励管理
│   ├── 积分奖励（对接积分系统）
│   ├── 实物奖励（地址收集/发货追踪）
│   ├── 虚拟物品（优惠券/道具/徽章/称号）
│   ├── 奖励模板（常用奖励组合复用）
│   └── 发放记录与物流管理
├── 5. 数据统计与分析
│   ├── 实时统计概览（Dashboard）
│   ├── 任务维度分析（参与率/完成率/放弃率）
│   ├── 用户维度分析（活跃度/积分收益/排行）
│   ├── 奖励维度分析（发放量/兑换率/成本）
│   ├── 趋势分析（日/周/月趋势图）
│   ├── 数据导出
│   └── 自定义报表
├── 6. 提醒与通知
│   ├── 任务推送通知（新任务上线/定向指派）
│   ├── 进度提醒（即将过期/可完成提醒）
│   ├── 完成通知（任务完成/奖励到账）
│   ├── 系统公告（任务维护/规则变更）
│   └── 通知偏好设置
├── 7. 系统管理
│   ├── 任务分类管理
│   ├── 条件类型注册表
│   ├── 奖励类型注册表
│   ├── 任务模板管理
│   └── 操作日志/审计
```

---

## 四、各模块详细设计

### 4.1 任务设计（创建/编辑）

#### 4.1.1 基础信息

| 字段     | 说明                                                                      | 必填           |
| -------- | ------------------------------------------------------------------------- | -------------- |
| 任务编号 | 系统自动生成：类型编码 + 日期(YYYYMMDD) + 当日序号；唯一，创建/复制时生成 | 否（系统生成） |
| 标题     | 任务名称，最多 128 字符                                                   | 是             |
| 描述     | 富文本描述，支持图文                                                      | 否             |
| 图标     | 任务图标（上传/图标库选择）                                               | 否             |
| 分类     | 从任务分类树中选择                                                        | 是             |
| 难度     | 1-简单 2-普通 3-困难 4-地狱                                               | 是             |
| 标签     | 自定义标签，便于筛选                                                      | 否             |

#### 4.1.2 任务类型

| 类型       | 编码          | 说明                       |
| ---------- | ------------- | -------------------------- |
| 每日任务   | `DAILY`       | 每日刷新，每日限完成 N 次  |
| 一次性任务 | `ONCE`        | 终身只能完成一次           |
| 限时任务   | `LIMITED`     | 活动期间有效，过期自动下线 |
| 成就任务   | `ACHIEVEMENT` | 长期目标，可分阶段达成     |
| 自定义任务 | `CUSTOM`      | 运营灵活配置               |

#### 4.1.3 条件配置

**条件类型注册表（可扩展）：**

| 条件类型   | 编码        | 说明           | condition_config 示例                              |
| ---------- | ----------- | -------------- | -------------------------------------------------- |
| 登录       | `LOGIN`     | 每日登录       | `{ "count": 1 }`                                   |
| 签到       | `CHECK_IN`  | 签到打卡       | `{ "streak_days": 7 }`                             |
| 分享       | `SHARE`     | 分享到指定平台 | `{ "platform": ["wechat","weibo"], "count": 3 }`   |
| 消费       | `PURCHASE`  | 消费满指定金额 | `{ "min_amount": 100 }`                            |
| 邀请       | `INVITE`    | 邀请好友注册   | `{ "count": 5, "require_active": true }`           |
| 内容创作   | `CONTENT`   | 发布帖子/评论  | `{ "type": "post", "count": 3, "min_length": 50 }` |
| 完成问卷   | `SURVEY`    | 填写指定问卷   | `{ "survey_id": 123 }`                             |
| 学习课程   | `LEARN`     | 完成指定课程   | `{ "course_id": 456, "progress": 100 }`            |
| 自定义事件 | `CUSTOM`    | 代码扩展的事件 | `{ "event": "custom_event_name" }`                 |
| 组合条件   | `COMPOSITE` | 多条件 AND/OR  | `{ "logic": "AND", "conditions": [...] }`          |

**组合条件示例：**

```json
{
  "logic": "AND",
  "conditions": [
    { "type": "LOGIN", "config": { "count": 1 } },
    { "type": "SHARE", "config": { "platform": ["wechat"], "count": 1 } },
    {
      "logic": "OR",
      "conditions": [
        { "type": "PURCHASE", "config": { "min_amount": 50 } },
        { "type": "CONTENT", "config": { "type": "post", "count": 1 } }
      ]
    }
  ]
}
```

#### 4.1.4 奖励配置

> **核心设计**：奖励支持多类型组合，一个任务可同时发放多种奖励。

**奖励类型注册表：**

| 奖励类型 | 编码       | 说明                 | reward_config 字段                                         |
| -------- | ---------- | -------------------- | ---------------------------------------------------------- |
| 积分     | `POINTS`   | 发放平台积分         | `{ "amount": 100 }`                                        |
| 实物     | `PHYSICAL` | 实物奖品，需收集地址 | `{ "item_name": "xxx", "item_image": "url", "stock": 50 }` |
| 优惠券   | `COUPON`   | 平台优惠券           | `{ "template_id": 1, "count": 2 }`                         |
| 虚拟道具 | `ITEM`     | 平台虚拟道具         | `{ "item_code": "double_exp", "duration_days": 7 }`        |
| 徽章     | `BADGE`    | 成就徽章             | `{ "badge_code": "task_master", "name": "任务达人" }`      |
| 称号     | `TITLE`    | 用户称号             | `{ "title": "任务王者", "style": "gold" }`                 |
| 经验值   | `EXP`      | 用户经验             | `{ "amount": 50 }`                                         |
| 抽奖机会 | `LOTTERY`  | 抽奖次数             | `{ "count": 1, "pool_id": 1 }`                             |

**奖励组合示例：**

```json
{
  "rewards": [
    {
      "type": "POINTS",
      "config": { "amount": 100 },
      "description": "100 积分"
    },
    {
      "type": "BADGE",
      "config": { "badge_code": "daily_hero" },
      "description": "日常英雄徽章"
    },
    {
      "type": "PHYSICAL",
      "config": { "item_name": "限定手办", "stock": 10 },
      "description": "限定手办（前10名）"
    }
  ]
}
```

**实物奖励特殊流程：**

```
任务完成 → 弹出收货地址填写表单
    │
    ▼
用户填写地址 → 保存至 task_reward_claim
    │
    ▼
管理端发货 → 填写物流单号 → 通知用户
    │
    ▼
用户确认收货 → 完成
```

#### 4.1.5 时间配置

| 配置项         | 说明                 | 默认值    |
| -------------- | -------------------- | --------- |
| 生效开始时间   | 任务何时开始可接取   | 立即      |
| 生效结束时间   | 任务何时自动下线     | 不限      |
| 每日可完成次数 | DAILY 类型每日限次   | 1         |
| 总完成次数限制 | 全生命周期限次       | 0（不限） |
| 接取后有效期   | 接取后多久内必须完成 | 不限      |

#### 4.1.6 子任务拆解

> 支持将复杂任务拆解为多个子任务，形成树形结构。子任务可独立配置条件和奖励，主任务在所有子任务完成后自动完成（或手动确认）。

**拆解规则：**

| 规则     | 说明                                     |
| -------- | ---------------------------------------- |
| 层级限制 | 最多 3 级（主任务 → 子任务 → 孙任务）    |
| 完成模式 | 全部完成（AND）/ 任选 N 个完成（N of M） |
| 解锁模式 | 顺序解锁（完成 A 才显示 B）/ 全部并行    |
| 奖励叠加 | 子任务奖励独立发放 + 主任务完成额外奖励  |
| 进度继承 | 主任务进度 = 子任务完成比例              |

**数据结构：**

```json
{
  "id": 1,
  "title": "新手引导",
  "completion_mode": "ALL",
  "unlock_mode": "SEQUENTIAL",
  "children": [
    {
      "id": 11,
      "title": "完善个人资料",
      "condition_type": "CUSTOM",
      "condition_config": { "event": "profile_complete" },
      "reward": {
        "rewards": [{ "type": "POINTS", "config": { "amount": 20 } }]
      },
      "children": []
    },
    {
      "id": 12,
      "title": "发布第一篇内容",
      "condition_type": "CONTENT",
      "condition_config": { "type": "post", "count": 1 },
      "reward": {
        "rewards": [{ "type": "POINTS", "config": { "amount": 30 } }]
      },
      "children": []
    },
    {
      "id": 13,
      "title": "邀请一位好友",
      "condition_type": "INVITE",
      "condition_config": { "count": 1 },
      "reward": {
        "rewards": [{ "type": "POINTS", "config": { "amount": 50 } }]
      },
      "children": []
    }
  ]
}
```

#### 4.1.7 分配设置

| 分配方式 | 编码          | 说明                                     |
| -------- | ------------- | ---------------------------------------- |
| 公开任务 | `PUBLIC`      | 所有用户可在任务大厅看到并接取           |
| 定向指派 | `ASSIGNED`    | 管理员指定用户 ID 列表，仅被指派用户可见 |
| 角色分配 | `ROLE_BASED`  | 指定角色/用户组，该组所有成员可见        |
| 等级限定 | `LEVEL_GATED` | 满足积分等级条件才可见                   |
| 条件解锁 | `CONDITIONAL` | 完成前置任务后才解锁                     |

**定向指派流程：**

```
管理员创建任务 → 选择"定向指派"
    │
    ├── 手动选择用户（搜索/勾选）
    ├── 批量导入（Excel 用户 ID）
    └── 按角色/部门分配
    │
    ▼
系统为每个被指派用户创建 task_instance（status=ASSIGNED）
    │
    ▼
WebSocket 推送通知 → 用户收到"您有新任务"
    │
    ▼
用户在"我的任务"中看到并执行
```

---

### 4.2 任务大厅（用户侧）

#### 4.2.1 任务列表

| 功能     | 说明                                           |
| -------- | ---------------------------------------------- |
| 分类筛选 | 按任务分类 Tab 切换（全部/日常/活动/成就/...） |
| 状态筛选 | 全部/可接取/进行中/待领奖/已完成               |
| 排序     | 推荐（优先级）/ 奖励最高 / 最新 / 即将过期     |
| 搜索     | 按任务标题/描述关键词搜索                      |
| 分页     | 无限滚动或分页加载                             |

#### 4.2.2 任务卡片展示

每张任务卡片展示：

| 元素        | 说明                        |
| ----------- | --------------------------- |
| 图标 + 标题 | 快速识别任务                |
| 分类标签    | 日常/活动/成就等            |
| 难度星级    | 1-4 星                      |
| 奖励预览    | 积分数量 + 其他奖励图标     |
| 进度条      | 已接取任务显示完成进度      |
| 剩余时间    | 限时任务显示倒计时          |
| 操作按钮    | 接取/继续完成/领取奖励      |
| 子任务数    | 有子任务时显示 "3 个子任务" |

#### 4.2.3 我的任务面板

| Tab    | 说明                               |
| ------ | ---------------------------------- |
| 进行中 | 已接取未完成的任务（含子任务进度） |
| 待领奖 | 已完成但未领取奖励的任务           |
| 已完成 | 历史完成记录                       |
| 已指派 | 管理员定向指派的任务               |
| 已过期 | 超时未完成的任务                   |

#### 4.2.4 成就墙

- 展示所有成就任务（已完成/进行中/未解锁）
- 已完成成就展示徽章 + 达成时间
- 进行中成就展示进度条
- 未解锁成就灰色展示，显示解锁条件
- 成就等级体系（青铜→白银→黄金→钻石→王者）

---

### 4.3 任务管理（生命周期）

#### 4.3.1 生命周期

```
草稿 ──→ 待审核 ──→ 已上线 ──→ 已暂停 ──→ 已上线（恢复）
  │         │          │                      │
  │         │          └──→ 已下线 ←──────────┘
  │         │
  │         └──→ 已驳回 ──→ 草稿（修改重提）
  │
  └──→ 已删除（软删除）
```

| 状态   | 编码       | 说明                     | 可执行操作           |
| ------ | ---------- | ------------------------ | -------------------- |
| 草稿   | `DRAFT`    | 编辑中，不可见           | 编辑、提交审核、删除 |
| 待审核 | `PENDING`  | 等待审核者审批           | 审核通过、驳回       |
| 已上线 | `APPROVED` | 用户可见可接取           | 暂停、下线、查看数据 |
| 已驳回 | `REJECTED` | 审核未通过               | 编辑重提、删除       |
| 已暂停 | `PAUSED`   | 暂停接取，已接取不受影响 | 恢复、下线           |
| 已下线 | `OFFLINE`  | 不可接取，已完成不受影响 | 查看数据、复制       |

#### 4.3.2 审核流程

| 配置项       | 说明                                 |
| ------------ | ------------------------------------ |
| 是否需要审核 | 管理员可跳过审核直接上线             |
| 审核人       | 指定审核人或审核角色                 |
| 审核备注     | 驳回时必须填写原因                   |
| 自动审核     | 满足条件（如创建者为管理员）自动通过 |

#### 4.3.3 任务分配操作

| 操作       | 说明                                     |
| ---------- | ---------------------------------------- |
| 定向指派   | 选择用户 → 创建 task_instance → 推送通知 |
| 批量指派   | Excel 导入用户 ID → 批量创建实例         |
| 按角色分配 | 选择角色 → 该角色所有成员收到任务        |
| 撤回指派   | 未接取的指派任务可撤回                   |
| 转派       | 将 A 用户的任务转派给 B（管理端操作）    |

---

### 4.4 奖励管理

#### 4.4.1 积分奖励

直接调用已有积分系统：

```typescript
// 调用 pointsService.operatePoints()
await this.pointsService.operatePoints({
  userId,
  points: rewardConfig.amount,
  source: 'COMPLETE_TASK',
  referenceId: taskId.toString(),
  referenceType: 'TASK',
  description: `完成任务：${task.title}`,
  immediate: true
})
```

#### 4.4.2 实物奖励

| 功能     | 说明                                     |
| -------- | ---------------------------------------- |
| 库存管理 | 设置实物奖品库存，发完即止               |
| 地址收集 | 用户完成后填写收货地址（姓名/电话/地址） |
| 发货管理 | 管理端填写物流公司 + 物流单号            |
| 物流追踪 | 用户端可查看物流状态                     |
| 确认收货 | 用户确认收货，关闭奖励单                 |

#### 4.4.3 虚拟物品奖励

| 物品类型 | 说明                   | 发放方式           |
| -------- | ---------------------- | ------------------ |
| 优惠券   | 平台优惠券             | 调用优惠券系统发放 |
| 虚拟道具 | 经验加倍卡、免广告卡等 | 写入用户道具背包   |
| 徽章     | 成就徽章               | 写入用户徽章墙     |
| 称号     | 用户名旁展示           | 写入用户称号装备   |
| 经验值   | 用户等级经验           | 直接增加经验值     |
| 抽奖机会 | 抽奖次数               | 增加抽奖次数       |

#### 4.4.4 奖励模板

运营可创建常用奖励组合模板，创建任务时一键引用：

```json
{
  "id": 1,
  "name": "日常小奖",
  "rewards": [
    { "type": "POINTS", "config": { "amount": 10 } },
    { "type": "EXP", "config": { "amount": 5 } }
  ]
}
```

#### 4.4.5 奖励发放记录

| 字段          | 说明                                                |
| ------------- | --------------------------------------------------- |
| 用户 ID       | 获奖用户                                            |
| 任务 ID       | 来源任务                                            |
| 奖励类型      | POINTS/PHYSICAL/COUPON/ITEM/BADGE/TITLE/EXP/LOTTERY |
| 奖励内容      | 具体奖励详情                                        |
| 发放状态      | 待领取/已发放/已领取/已发货/已收货                  |
| 领取/发货时间 | 时间戳                                              |
| 物流信息      | 实物奖励的物流单号                                  |

---

### 4.5 数据统计与分析

> 统计分析是任务系统的核心运营支撑。设计原则：**实时指标 + 异步聚合**，核心指标实时计算，复杂报表走定时聚合。

#### 4.5.1 统计概览（Dashboard）

**核心指标卡片：**

| 指标           | 说明                             | 计算方式                                                 |
| -------------- | -------------------------------- | -------------------------------------------------------- |
| 任务总数       | 当前上线任务数                   | `COUNT(task WHERE status=APPROVED)`                      |
| 今日参与人次   | 今日接取任务的去重人数           | `COUNT(DISTINCT user_id) WHERE DATE(accepted_at)=TODAY`  |
| 今日完成人次   | 今日完成任务的去重人数           | `COUNT(DISTINCT user_id) WHERE DATE(completed_at)=TODAY` |
| 整体完成率     | 接取后完成的比例                 | `COMPLETED / ACCEPTED`                                   |
| 奖励发放总量   | 今日发放的积分 + 实物 + 虚拟物品 | 按类型汇总                                               |
| 活跃任务参与率 | 活跃用户中参与任务的比例         | `参与任务用户 / DAU`                                     |

**趋势图表：**

| 图表         | 说明                           | 交互           |
| ------------ | ------------------------------ | -------------- |
| 参与趋势     | 按日/周的接取量折线图          | 时间范围选择   |
| 完成趋势     | 按日/周的完成量折线图          | 叠加参与量对比 |
| 任务类型分布 | 各类型任务占比饼图             | 点击扇区筛选   |
| 奖励发放趋势 | 按日/类型的奖励发放量堆叠图    | 类型切换       |
| 时段分布     | 24 小时 × 7 天的任务完成热力图 | 识别活跃时段   |
| 任务排行榜   | TOP10 参与量/完成量最高的任务  | 点击跳转详情   |

#### 4.5.2 任务维度分析

| 指标           | 说明                       |
| -------------- | -------------------------- |
| 参与人数       | 接取该任务的去重人数       |
| 完成人数       | 完成该任务的去重人数       |
| 完成率         | 完成人数 / 参与人数        |
| 放弃率         | 接取但未完成且已过期的比例 |
| 平均完成时长   | 从接取到完成的平均耗时     |
| 每日参与趋势   | 该任务每日的参与量变化     |
| 子任务进度分布 | 各子任务的完成率对比       |

#### 4.5.3 用户维度分析

| 指标           | 说明                                |
| -------------- | ----------------------------------- |
| 用户任务参与度 | 该用户接取/完成任务数 vs 可用任务数 |
| 积分收益       | 该用户通过任务获得的总积分          |
| 任务完成排行   | 完成任务数排行榜                    |
| 活跃天数       | 有任务完成记录的天数                |
| 偏好分析       | 该用户偏好的任务类型/分类           |

#### 4.5.4 奖励维度分析

| 指标           | 说明                     |
| -------------- | ------------------------ |
| 积分发放总量   | 通过任务发放的积分总量   |
| 实物发放量     | 实物奖品发放数量 vs 库存 |
| 虚拟物品发放量 | 各类虚拟物品发放统计     |
| 奖励领取率     | 已领取 / 可领取          |
| 实物发货率     | 已发货 / 待发货          |
| 奖励成本统计   | 实物成本 + 积分折算成本  |

#### 4.5.5 数据导出

| 格式  | 说明                               |
| ----- | ---------------------------------- |
| Excel | 任务列表 + 统计数据 + 用户明细     |
| CSV   | 同上 CSV 格式                      |
| PDF   | 统计报告（概览 + 图表 + 关键发现） |

**导出选项：**

- 时间范围选择
- 按任务/按用户/按奖励类型筛选
- 大数据量异步生成，完成后通知下载

#### 4.5.6 自定义报表

- 可选择指标 + 维度组合生成自定义视图
- 报表可保存、分享、定时发送
- 支持报表模板复用

---

### 4.6 提醒与通知

> 接入现有 WebSocket 通知系统（`notifyServer.ts`），同时支持站内消息 + 可选的外部推送（邮件/短信）。

#### 4.6.1 通知场景

| 场景         | 触发时机                | 通知对象           | 通知方式                                |
| ------------ | ----------------------- | ------------------ | --------------------------------------- |
| 新任务上线   | 任务状态变为 APPROVED   | 全部用户/指定用户  | WebSocket + 站内消息                    |
| 定向指派     | 管理员指派任务          | 被指派用户         | WebSocket + 站内消息                    |
| 任务即将过期 | 到期前 N 小时（可配置） | 已接取未完成的用户 | WebSocket + 站内消息                    |
| 任务完成     | 用户完成任务            | 用户本人           | WebSocket + 站内消息                    |
| 奖励到账     | 奖励发放成功            | 用户本人           | WebSocket + 站内消息                    |
| 实物待填地址 | 实物奖励待领取          | 用户本人           | WebSocket + 站内消息                    |
| 实物已发货   | 管理员填写物流单号      | 用户本人           | WebSocket + 站内消息                    |
| 审核结果     | 任务审核通过/驳回       | 任务创建者         | WebSocket + 站内消息                    |
| 成就达成     | 成就任务完成            | 用户本人           | WebSocket + 站内消息 + 全站广播（可选） |
| 任务被下线   | 管理员下线任务          | 已接取未完成的用户 | WebSocket + 站内消息                    |

#### 4.6.2 通知内容模板

```typescript
// 通知消息结构（对接现有 notify 系统）
interface TaskNotification {
  type:
    | 'TASK_NEW'
    | 'TASK_ASSIGNED'
    | 'TASK_EXPIRING'
    | 'TASK_COMPLETED'
    | 'REWARD_RECEIVED'
    | 'PHYSICAL_ADDRESS_NEEDED'
    | 'PHYSICAL_SHIPPED'
    | 'TASK_AUDITED'
    | 'ACHIEVEMENT_UNLOCKED'
    | 'TASK_OFFLINE'
  title: string // 通知标题
  content: string // 通知正文
  taskId?: bigint // 关联任务 ID
  actionUrl?: string // 点击跳转链接
  extra?: Record<string, unknown> // 扩展数据
}
```

**模板示例：**

| 场景       | 标题            | 内容                                         |
| ---------- | --------------- | -------------------------------------------- |
| 新任务上线 | 🎯 新任务上线！ | 「{任务标题}」已发布，完成可获得 {奖励描述}  |
| 定向指派   | 📋 您有新任务   | 管理员给您指派了「{任务标题}」，快去完成吧！ |
| 即将过期   | ⏰ 任务即将过期 | 「{任务标题}」将在 {时间} 后过期，抓紧完成！ |
| 任务完成   | 🎉 任务完成！   | 恭喜完成「{任务标题}」，快去领取奖励吧！     |
| 奖励到账   | 💰 奖励已到账   | 「{任务标题}」奖励：{奖励描述} 已发放        |
| 成就达成   | 🏆 成就解锁！   | 恭喜达成成就「{成就名称}」！                 |

#### 4.6.3 通知偏好设置

用户可在个人设置中配置通知偏好：

| 配置项        | 选项                       | 默认值 |
| ------------- | -------------------------- | ------ |
| 新任务通知    | 开/关                      | 开     |
| 定向指派通知  | 开/关                      | 开     |
| 即将过期提醒  | 开/关                      | 开     |
| 完成/奖励通知 | 开/关                      | 开     |
| 提醒时间      | 到期前 1h / 6h / 12h / 24h | 6h     |
| 免打扰时段    | 设置不接收通知的时间段     | 无     |

#### 4.6.4 通知渠道

| 渠道               | 说明                     | 优先级 |
| ------------------ | ------------------------ | ------ |
| WebSocket 实时推送 | 在线用户即时收到         | 高     |
| 站内消息中心       | 离线用户登录后查看       | 中     |
| 邮件通知           | 重要通知（实物发货等）   | 低     |
| 短信通知           | 高价值奖励到账等关键通知 | 低     |

---

### 4.7 系统管理

#### 4.7.1 任务分类管理

| 功能      | 说明                   |
| --------- | ---------------------- |
| 分类 CRUD | 创建/编辑/删除/排序    |
| 分类图标  | 每个分类可设置图标     |
| 分类状态  | 启用/禁用              |
| 分类编码  | 唯一标识，用于前端筛选 |

#### 4.7.2 条件类型注册表

新增条件类型只需在注册表中添加：

```typescript
// task-condition.registry.ts
export const CONDITION_TYPES = {
  LOGIN: { label: '登录', validator: LoginConditionValidator },
  SHARE: { label: '分享', validator: ShareConditionValidator }
  // ... 新增条件只需在此注册
}
```

#### 4.7.3 奖励类型注册表

新增奖励类型同理：

```typescript
// task-reward.registry.ts
export const REWARD_TYPES = {
  POINTS: { label: '积分', handler: PointsRewardHandler },
  PHYSICAL: { label: '实物', handler: PhysicalRewardHandler }
  // ... 新增奖励只需在此注册
}
```

#### 4.7.4 任务模板管理

| 功能      | 说明                    |
| --------- | ----------------------- |
| 模板 CRUD | 创建/编辑/删除任务模板  |
| 模板分类  | 日常/活动/新手引导/成就 |
| 一键创建  | 从模板快速创建任务      |
| 模板预览  | 查看模板详情            |

#### 4.7.5 操作日志

| 操作     | 记录内容               |
| -------- | ---------------------- |
| 创建任务 | 操作人、时间、任务信息 |
| 编辑任务 | 操作人、时间、变更字段 |
| 审核任务 | 审核人、结果、备注     |
| 分配任务 | 操作人、被分配用户列表 |
| 发放奖励 | 系统自动记录           |
| 发货     | 操作人、物流信息       |

---

## 五、数据模型设计

### 5.1 核心表结构

```sql
-- ============================================
-- 任务管理体系 - 数据库设计
-- 适用于 MySQL 8.0+ / Prisma ORM
-- ============================================

-- 1. 任务分类表
CREATE TABLE `task_category` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(64) NOT NULL COMMENT '分类名称',
  `code` VARCHAR(32) NOT NULL COMMENT '分类编码',
  `icon` VARCHAR(128) DEFAULT NULL COMMENT '分类图标',
  `description` VARCHAR(255) DEFAULT NULL,
  `parent_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '父分类ID',
  `sort_order` INT NOT NULL DEFAULT 0,
  `enabled` TINYINT NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`),
  KEY `idx_parent` (`parent_id`),
  KEY `idx_enabled` (`enabled`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务分类表';

-- 2. 任务定义表
CREATE TABLE `task` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `task_no` VARCHAR(32) NOT NULL COMMENT '任务编号：类型编码+YYYYMMDD+当日序号',
  `title` VARCHAR(128) NOT NULL COMMENT '任务标题',
  `description` TEXT COMMENT '任务描述（富文本）',
  `icon` VARCHAR(128) DEFAULT NULL,
  `category_id` BIGINT UNSIGNED NOT NULL,
  `task_type` VARCHAR(32) NOT NULL COMMENT 'DAILY/ONCE/LIMITED/ACHIEVEMENT/CUSTOM',
  `condition_type` VARCHAR(32) NOT NULL COMMENT 'LOGIN/SHARE/PURCHASE/...',
  `condition_config` JSON NOT NULL COMMENT '条件配置',
  `reward_config` JSON NOT NULL COMMENT '奖励配置（多类型组合）',
  `target_count` INT NOT NULL DEFAULT 1 COMMENT '目标完成次数',
  `daily_limit` INT NOT NULL DEFAULT 1 COMMENT '每日可完成次数（0=不限）',
  `total_limit` INT NOT NULL DEFAULT 0 COMMENT '总完成次数限制（0=不限）',
  `difficulty` TINYINT NOT NULL DEFAULT 1 COMMENT '1-4',
  `priority` INT NOT NULL DEFAULT 0 COMMENT '越大越靠前',
  `assign_type` VARCHAR(16) NOT NULL DEFAULT 'PUBLIC' COMMENT 'PUBLIC/ASSIGNED/ROLE_BASED/LEVEL_GATED/CONDITIONAL',
  `assign_config` JSON DEFAULT NULL COMMENT '分配配置（用户ID列表/角色ID/前置任务ID）',
  `parent_task_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '父任务ID（子任务拆解）',
  `completion_mode` VARCHAR(16) DEFAULT 'ALL' COMMENT 'ALL/N_OF_M（子任务完成模式）',
  `completion_n` INT DEFAULT NULL COMMENT 'N_OF_M 模式下的 N 值',
  `unlock_mode` VARCHAR(16) DEFAULT 'PARALLEL' COMMENT 'SEQUENTIAL/PARALLEL（子任务解锁模式）',
  `start_time` DATETIME DEFAULT NULL,
  `end_time` DATETIME DEFAULT NULL,
  `status` VARCHAR(16) NOT NULL DEFAULT 'DRAFT' COMMENT 'DRAFT/PENDING/APPROVED/REJECTED/PAUSED/OFFLINE',
  `audit_remark` VARCHAR(255) DEFAULT NULL,
  `auditor_id` BIGINT UNSIGNED DEFAULT NULL,
  `audited_at` DATETIME DEFAULT NULL,
  `creator_id` BIGINT UNSIGNED NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL COMMENT '软删除',
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category_id`),
  KEY `idx_type` (`task_type`),
  KEY `idx_status` (`status`),
  KEY `idx_parent` (`parent_task_id`),
  KEY `idx_assign` (`assign_type`),
  KEY `idx_time` (`start_time`, `end_time`),
  KEY `idx_priority` (`priority`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务定义表';

-- 3. 任务定向指派表
CREATE TABLE `task_assignment` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `task_id` BIGINT UNSIGNED NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '被指派用户',
  `assigned_by` BIGINT UNSIGNED NOT NULL COMMENT '指派操作人',
  `status` VARCHAR(16) NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING/ACCEPTED/COMPLETED/REVOKED',
  `assigned_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `accepted_at` DATETIME DEFAULT NULL,
  `revoked_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_task_user` (`task_id`, `user_id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务定向指派表';

-- 4. 用户任务实例表
CREATE TABLE `task_instance` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `task_id` BIGINT UNSIGNED NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `status` VARCHAR(16) NOT NULL DEFAULT 'ACCEPTED' COMMENT 'ACCEPTED/IN_PROGRESS/SUBMITTED/COMPLETED/FAILED/EXPIRED',
  `current_count` INT NOT NULL DEFAULT 0,
  `target_count` INT NOT NULL DEFAULT 1,
  `accepted_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `submitted_at` DATETIME DEFAULT NULL,
  `completed_at` DATETIME DEFAULT NULL,
  `expired_at` DATETIME DEFAULT NULL,
  `extra_data` JSON DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_task_date` (`user_id`, `task_id`, `DATE(accepted_at)`),
  KEY `idx_user` (`user_id`),
  KEY `idx_task` (`task_id`),
  KEY `idx_status` (`status`),
  KEY `idx_accepted` (`accepted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户任务实例表';

-- 5. 任务进度表（子任务/多步骤）
CREATE TABLE `task_progress` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `instance_id` BIGINT UNSIGNED NOT NULL,
  `sub_task_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '子任务ID',
  `step_index` INT NOT NULL,
  `step_name` VARCHAR(64) NOT NULL,
  `completed` TINYINT NOT NULL DEFAULT 0,
  `completed_at` DATETIME DEFAULT NULL,
  `extra_data` JSON DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_instance` (`instance_id`),
  KEY `idx_sub_task` (`sub_task_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务进度表';

-- 6. 奖励发放记录表
CREATE TABLE `task_reward_claim` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `instance_id` BIGINT UNSIGNED NOT NULL COMMENT '任务实例ID',
  `task_id` BIGINT UNSIGNED NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `reward_type` VARCHAR(32) NOT NULL COMMENT 'POINTS/PHYSICAL/COUPON/ITEM/BADGE/TITLE/EXP/LOTTERY',
  `reward_config` JSON NOT NULL COMMENT '奖励详情',
  `status` VARCHAR(16) NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING/CLAIMED/SHIPPED/RECEIVED/EXPIRED',
  `claimed_at` DATETIME DEFAULT NULL COMMENT '领取时间',
  `shipping_address` JSON DEFAULT NULL COMMENT '实物收货地址',
  `shipping_info` JSON DEFAULT NULL COMMENT '物流信息 {company, tracking_no, shipped_at}',
  `received_at` DATETIME DEFAULT NULL COMMENT '确认收货时间',
  `extra_data` JSON DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_instance` (`instance_id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_task` (`task_id`),
  KEY `idx_type` (`reward_type`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='奖励发放记录表';

-- 7. 成就记录表
CREATE TABLE `task_achievement` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `achievement_code` VARCHAR(64) NOT NULL,
  `achievement_name` VARCHAR(128) NOT NULL,
  `level` INT NOT NULL DEFAULT 1,
  `progress` INT NOT NULL DEFAULT 0,
  `target` INT NOT NULL,
  `completed` TINYINT NOT NULL DEFAULT 0,
  `completed_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_achievement` (`user_id`, `achievement_code`),
  KEY `idx_user` (`user_id`),
  KEY `idx_completed` (`completed`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='成就记录表';

-- 8. 任务通知记录表
CREATE TABLE `task_notification` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `task_id` BIGINT UNSIGNED DEFAULT NULL,
  `notify_type` VARCHAR(32) NOT NULL COMMENT '通知场景编码',
  `title` VARCHAR(128) NOT NULL,
  `content` TEXT NOT NULL,
  `action_url` VARCHAR(255) DEFAULT NULL,
  `is_read` TINYINT NOT NULL DEFAULT 0,
  `read_at` DATETIME DEFAULT NULL,
  `extra_data` JSON DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_task` (`task_id`),
  KEY `idx_read` (`is_read`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务通知记录表';

-- 9. 奖励模板表
CREATE TABLE `task_reward_template` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(64) NOT NULL COMMENT '模板名称',
  `description` VARCHAR(255) DEFAULT NULL,
  `reward_config` JSON NOT NULL COMMENT '奖励配置',
  `category` VARCHAR(32) DEFAULT NULL COMMENT '模板分类',
  `creator_id` BIGINT UNSIGNED NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='奖励模板表';
```

### 5.2 表关系图

```
task_category (分类)
    │
    ├── 1:N ──→ task (任务定义)
    │               │
    │               ├── 1:N ──→ task (子任务, parent_task_id)
    │               │
    │               ├── 1:N ──→ task_assignment (定向指派)
    │               │
    │               ├── 1:N ──→ task_instance (用户实例)
    │               │               │
    │               │               ├── 1:N ──→ task_progress (进度)
    │               │               │
    │               │               └── 1:N ──→ task_reward_claim (奖励)
    │               │
    │               └── N:1 ──→ task_reward_template (奖励模板)
    │
    └── task_achievement (成就)

task_notification (通知) ← 独立，关联 user_id + task_id
```

---

## 六、API 接口设计

### 6.1 用户端接口

| 接口                                | 方法 | 说明                                    |
| ----------------------------------- | ---- | --------------------------------------- |
| `/api/tasks`                        | GET  | 任务大厅列表（分类/状态/排序/分页）     |
| `/api/tasks/categories`             | GET  | 任务分类列表                            |
| `/api/tasks/:id`                    | GET  | 任务详情（含子任务、进度）              |
| `/api/tasks/:id/accept`             | POST | 接取任务                                |
| `/api/tasks/:id/submit`             | POST | 提交完成（含凭证）                      |
| `/api/tasks/:id/claim`              | POST | 领取奖励                                |
| `/api/tasks/:id/claim/shipping`     | POST | 填写实物收货地址                        |
| `/api/tasks/my`                     | GET  | 我的任务（进行中/待领奖/已完成/已指派） |
| `/api/tasks/my/stats`               | GET  | 我的任务统计                            |
| `/api/tasks/achievements`           | GET  | 我的成就墙                              |
| `/api/tasks/notifications`          | GET  | 我的任务通知列表                        |
| `/api/tasks/notifications/:id/read` | POST | 标记通知已读                            |

### 6.2 管理端接口

| 接口                             | 方法                | 说明               | 权限                |
| -------------------------------- | ------------------- | ------------------ | ------------------- |
| `/api/admin/tasks`               | POST                | 创建任务           | system:task:create  |
| `/api/admin/tasks/:id`           | PUT                 | 更新任务           | system:task:update  |
| `/api/admin/tasks/:id`           | DELETE              | 删除任务（软删除） | system:task:delete  |
| `/api/admin/tasks/:id/audit`     | POST                | 审核任务           | system:task:audit   |
| `/api/admin/tasks/:id/pause`     | POST                | 暂停任务           | system:task:status  |
| `/api/admin/tasks/:id/resume`    | POST                | 恢复任务           | system:task:status  |
| `/api/admin/tasks/:id/offline`   | POST                | 下线任务           | system:task:status  |
| `/api/admin/tasks/assign`        | POST                | 定向指派任务       | system:task:assign  |
| `/api/admin/tasks/assign/batch`  | POST                | 批量指派           | system:task:assign  |
| `/api/admin/tasks/assign/revoke` | POST                | 撤回指派           | system:task:assign  |
| `/api/admin/tasks/list`          | GET                 | 管理端任务列表     | system:task:list    |
| `/api/admin/rewards/ship`        | POST                | 实物发货           | system:task:operate |
| `/api/admin/rewards/templates`   | GET/POST/PUT/DELETE | 奖励模板管理       | system:task:operate |
| `/api/admin/categories`          | GET/POST/PUT/DELETE | 分类管理           | system:task:operate |
| `/api/admin/statistics/overview` | GET                 | 统计概览           | system:task:list    |
| `/api/admin/statistics/task/:id` | GET                 | 单任务分析         | system:task:list    |
| `/api/admin/statistics/user`     | GET                 | 用户维度分析       | system:task:list    |
| `/api/admin/statistics/reward`   | GET                 | 奖励维度分析       | system:task:list    |
| `/api/admin/statistics/export`   | POST                | 数据导出           | system:task:list    |

### 6.3 接口响应示例

```typescript
// GET /api/tasks 响应
{
  "status": true,
  "msg": "ok",
  "data": {
    "list": [
      {
        "id": 1,
        "title": "每日签到",
        "description": "每日登录签到，领取积分奖励",
        "icon": "calendar",
        "category": { "id": 1, "name": "日常任务", "code": "DAILY" },
        "taskType": "DAILY",
        "conditionType": "CHECK_IN",
        "difficulty": 1,
        "rewardConfig": {
          "rewards": [
            { "type": "POINTS", "config": { "amount": 10 }, "description": "10 积分" },
            { "type": "EXP", "config": { "amount": 5 }, "description": "5 经验" }
          ]
        },
        "targetCount": 1,
        "subTaskCount": 0,
        "userProgress": {
          "status": "COMPLETED",
          "currentCount": 1,
          "rewardClaimed": false
        },
        "endTime": "2026-12-31T23:59:59Z",
        "remainingTime": 12960000
      }
    ],
    "statistics": {
      "totalTasks": 15,
      "completedToday": 5,
      "availableTasks": 10,
      "totalRewardToday": { "points": 150, "items": 2 }
    },
    "pagination": { "page": 1, "pageSize": 20, "total": 15 }
  }
}
```

---

## 七、前端架构设计

### 7.1 目录结构

```
src/
├── types/
│   └── task.ts                       # 任务类型定义
├── api/
│   └── task.ts                       # 任务 API 层
├── stores/
│   └── task.ts                       # Pinia Store
├── composables/
│   ├── useTaskList.ts                # 任务列表（筛选/排序/分页）
│   ├── useTaskAccept.ts              # 接取任务
│   ├── useTaskSubmit.ts              # 提交完成
│   ├── useTaskReward.ts              # 领取奖励
│   ├── useTaskAssign.ts              # 任务分配
│   ├── useTaskSubTasks.ts            # 子任务管理
│   ├── useTaskStatistics.ts          # 统计数据
│   └── useTaskNotification.ts        # 通知管理
└── components/
    └── task/
        ├── TaskHall.vue              # 任务大厅页面
        ├── TaskCard.vue              # 任务卡片
        ├── TaskDetail.vue            # 任务详情弹窗
        ├── TaskProgress.vue          # 进度条组件
        ├── TaskReward.vue            # 奖励展示组件
        ├── TaskSubTasks.vue          # 子任务树组件
        ├── MyTasks.vue               # 我的任务面板
        ├── AchievementWall.vue       # 成就墙
        ├── TaskNotification.vue      # 通知列表
        ├── admin/
        │   ├── TaskAdmin.vue         # 任务管理列表
        │   ├── TaskForm.vue          # 任务创建/编辑表单
        │   ├── TaskAudit.vue         # 任务审核面板
        │   ├── TaskAssign.vue        # 分配面板
        │   ├── RewardManager.vue     # 奖励管理
        │   ├── ShippingManager.vue   # 奖励发放（实物发货）
        │   └── RewardTemplate.vue    # 奖励模板
        └── statistics/
            ├── TaskDashboard.vue     # 任务概览（统计 Dashboard）
            ├── TaskCharts.vue        # 图表组件
            └── TaskExport.vue        # 导出面板
```

### 7.1.1 管理端导航结构

管理端「任务管理」以 **三级菜单** 挂载（不做页签切换）：

```
管理中心
└── 任务管理（目录）
    ├── 任务概览      /home/manageHomePage/task/overview
    ├── 任务列表      /home/manageHomePage/task/list
    ├── 任务审核      /home/manageHomePage/task/audit
    ├── 奖励发放      /home/manageHomePage/task/shipping
    ├── 分类管理      /home/manageHomePage/task/categories
    └── 奖励模板      /home/manageHomePage/task/templates
```

| 菜单名称 | 路由                                   | 权限                | 说明                               |
| -------- | -------------------------------------- | ------------------- | ---------------------------------- |
| 任务概览 | `/home/manageHomePage/task/overview`   | system:task:list    | 统计 Dashboard、趋势图、导出       |
| 任务列表 | `/home/manageHomePage/task/list`       | system:task:list    | 任务 CRUD / 生命周期 / 复制 / 指派 |
| 任务审核 | `/home/manageHomePage/task/audit`      | system:task:audit   | 待审任务审批                       |
| 奖励发放 | `/home/manageHomePage/task/shipping`   | system:task:operate | 实物奖励发货与物流                 |
| 分类管理 | `/home/manageHomePage/task/categories` | system:task:operate | 任务分类 CRUD                      |
| 奖励模板 | `/home/manageHomePage/task/templates`  | system:task:operate | 奖励模板 / 任务模板 CRUD           |

页面实现目录：`src/views/manage/taskManage/`（overview / list / audit / shipping / categories / templates）。

### 7.2 Pinia Store 设计

```typescript
// stores/task.ts
import { defineStore } from 'pinia'

export const useTaskStore = defineStore('task', {
  state: () => ({
    // 任务大厅
    tasks: [] as Task[],
    categories: [] as TaskCategory[],
    filters: { categoryId: null, status: 'ALL', sort: 'priority' },
    pagination: { page: 1, pageSize: 20, total: 0 },

    // 我的任务
    myTasks: {
      inProgress: [] as TaskInstance[],
      pendingReward: [] as TaskInstance[],
      completed: [] as TaskInstance[],
      assigned: [] as TaskInstance[]
    },

    // 统计
    statistics: {
      overview: null as TaskStatistics | null,
      trend: [] as TrendItem[]
    },

    // 通知
    notifications: [] as TaskNotification[],
    unreadCount: 0,

    // 加载状态
    loading: false
  }),

  getters: {
    availableTasks: state =>
      state.tasks.filter(
        t => !t.userProgress || t.userProgress.status === 'NONE'
      ),
    completedToday: state =>
      state.myTasks.completed.filter(t => isToday(t.completedAt)),
    dailyProgress: state => {
      const total = state.tasks.length
      const done = state.myTasks.completed.filter(t =>
        isToday(t.completedAt)
      ).length
      return {
        total,
        done,
        percent: total ? Math.round((done / total) * 100) : 0
      }
    }
  },

  actions: {
    async loadTasks() {
      /* ... */
    },
    async acceptTask(taskId: bigint) {
      /* ... */
    },
    async submitTask(taskId: bigint, payload?: any) {
      /* ... */
    },
    async claimReward(instanceId: bigint) {
      /* ... */
    },
    async loadMyTasks() {
      /* ... */
    },
    async loadStatistics() {
      /* ... */
    }
  }
})
```

---

## 八、与现有系统集成

### 8.1 积分系统集成

```typescript
// task.service.ts - 积分奖励发放
async claimPointsReward(userId: number, instance: TaskInstance, task: Task) {
  const pointsReward = task.rewardConfig.rewards.find(r => r.type === 'POINTS')
  if (!pointsReward) return

  await this.pointsService.operatePoints({
    userId,
    points: pointsReward.config.amount,
    source: 'COMPLETE_TASK',
    referenceId: task.id.toString(),
    referenceType: 'TASK',
    description: `完成任务：${task.title}`,
    immediate: true,
  })
}
```

### 8.2 通知系统集成

```typescript
// task-notification.service.ts - 对接现有 WebSocket 通知
async sendTaskNotification(userId: number, notification: TaskNotification) {
  // 1. 写入数据库
  await this.prisma.taskNotification.create({ data: { ... } })

  // 2. WebSocket 实时推送（对接现有 notifyServer）
  await this.notifyService.sendToUser(userId, {
    title: notification.title,
    content: notification.content,
    type: notification.type,
  })
}
```

### 8.3 RBAC 权限集成

新增权限点：

| 权限编码              | 说明                                   |
| --------------------- | -------------------------------------- |
| `system:task:list`    | 查看任务列表/统计                      |
| `system:task:create`  | 创建任务、复制任务                     |
| `system:task:update`  | 编辑任务、提交审核                     |
| `system:task:status`  | 暂停 / 恢复 / 下线                     |
| `system:task:claim`   | 领取任务（指派给当前账号）             |
| `system:task:assign`  | 定向指派 / 撤回指派                    |
| `system:task:delete`  | 删除任务                               |
| `system:task:audit`   | 审核任务                               |
| `system:task:operate` | 运营类能力（奖励发放 / 分类 / 模板等） |

### 8.4 分析系统集成

任务相关事件上报到现有 analytics 模块：

| 事件                | 说明           |
| ------------------- | -------------- |
| `task_accept`       | 用户接取任务   |
| `task_complete`     | 用户完成任务   |
| `task_reward_claim` | 用户领取奖励   |
| `task_abandon`      | 任务过期未完成 |

---

## 九、实施计划

### 9.1 开发阶段

| 阶段   | 内容                                            | 工期 | 优先级 |
| ------ | ----------------------------------------------- | ---- | ------ |
| **P0** | 数据库设计 + 基础 CRUD + 任务分类               | 3天  | 🔴 高  |
| **P1** | 任务大厅 + 我的任务 + 接取/完成/领奖            | 5天  | 🔴 高  |
| **P2** | 积分奖励集成 + 多类型奖励框架                   | 3天  | 🔴 高  |
| **P3** | 子任务拆解 + 进度追踪                           | 3天  | 🔴 高  |
| **P4** | 任务分配（定向指派/角色分配）                   | 3天  | 🟡 中  |
| **P5** | 管理后台（任务列表 CRUD / 任务审核 / 奖励发放） | 4天  | 🟡 中  |
| **P6** | 通知系统接入（全场景）                          | 2天  | 🟡 中  |
| **P7** | 统计 Dashboard + 数据导出                       | 4天  | 🟡 中  |
| **P8** | 成就系统 + 成就墙                               | 3天  | 🟢 低  |
| **P9** | 奖励模板 + 任务模板                             | 2天  | 🟢 低  |

**总预估：~32 个工作日**

### 9.2 技术栈对齐

| 层级     | 技术选型           | 与现有项目一致 |
| -------- | ------------------ | -------------- |
| 前端框架 | Vue 3 + TypeScript | ✅             |
| 状态管理 | Pinia              | ✅             |
| UI 组件  | Element Plus       | ✅             |
| 后端框架 | NestJS             | ✅             |
| ORM      | Prisma             | ✅             |
| 数据库   | MySQL 8.0+         | ✅             |
| 通知     | WebSocket (ws)     | ✅             |
| 分析     | Analytics (Umami)  | ✅             |

---

## 十、风险与注意事项

### 10.1 技术风险

| 风险             | 影响                 | 应对方案                         |
| ---------------- | -------------------- | -------------------------------- |
| 并发领奖         | 重复发放奖励         | 数据库事务 + 唯一索引 + 幂等校验 |
| 子任务状态不一致 | 主任务进度错误       | 事件驱动 + 最终一致性 + 定时对账 |
| 通知风暴         | 大量用户同时收到推送 | 批量推送 + 延迟队列 + 限流       |
| 统计性能         | 大数据量查询慢       | Redis 缓存 + 定时聚合 + 读写分离 |
| 实物库存超卖     | 库存不足仍发放       | 乐观锁 + 库存预扣                |

### 10.2 业务风险

| 风险         | 影响      | 应对方案                       |
| ------------ | --------- | ------------------------------ |
| 刷任务       | 积分通胀  | 频率限制 + 设备指纹 + 异常检测 |
| 奖励配置错误 | 超发/少发 | 审核流程 + 修改日志 + 回滚机制 |
| 实物发货延迟 | 用户投诉  | 发货 SLA + 超时预警 + 客服通道 |
| 任务体验差   | 用户流失  | A/B 测试 + 用户反馈 + 持续优化 |

---

## 附录

### A. 相关文档

- [积分管理体系 PRD](../积分管理体系/README.md)
- [问卷管理系统 PRD](./问卷管理系统_PRD_v1.0.md)
- [积分数据库设计](../积分管理体系/database/schema.sql)

### B. 术语表

| 术语     | 说明                       |
| -------- | -------------------------- |
| 任务大厅 | 展示所有可接取任务的页面   |
| 任务实例 | 用户接取任务后生成的记录   |
| 子任务   | 主任务拆解出的子级任务     |
| 成就     | 长期目标，可分阶段完成     |
| 定向指派 | 管理员将任务指派给特定用户 |
| 奖励模板 | 预配置的奖励组合，便于复用 |

### C. 版本记录

| 版本 | 日期       | 变更内容                                                                                                    |
| ---- | ---------- | ----------------------------------------------------------------------------------------------------------- |
| v1.0 | 2026-08-06 | 初版：完整功能模块设计                                                                                      |
| v1.1 | 2026-08-07 | 管理端改为三级菜单：任务概览 / 任务列表 / 任务审核 / 奖励发放（取消页签切换）                               |
| v1.2 | 2026-08-07 | 前后端补齐剩余模块：统计趋势与导出、分类/模板 CRUD、子任务 UI、通知面板、复制/批量指派、实物确认收货        |
| v1.3 | 2026-08-07 | 任务列表细粒度按钮权限（create/update/status/assign/delete）；列表隐藏 ID；BaseTable 操作列按内容自适应宽度 |
| v1.4 | 2026-08-07 | 任务列表补充「领取」按钮与权限 system:task:claim                                                            |
| v1.5 | 2026-08-07 | 新增任务编号 taskNo（类型编码+日期+当日序号，唯一索引兼容并发）并在列表展示                                 |

---

**文档维护人**：拾光
