# 积分管理体系 — 产品需求设计文档（PRD）

> **项目**: drawStars (Vue3)  
> **版本**: v1.0  
> **日期**: 2026-08-06  
> **状态**: 初稿（基于现有前后端代码整理）  
> **关联规范**: `需求文档输出规范.md`

---

## 一、需求背景与目标

### 1.1 背景

drawStars 已具备用户管理、RBAC 权限、个人中心等基础能力，需要一套可运营的积分体系，用于提升日活与转化，并支撑运营发放、等级权益等场景：

- 用户每日签到与成长激励
- 消费/任务/邀请等行为奖励
- 积分抵扣与会员等级权益
- 管理员定向发放与审计留痕

前端模块位于 `drawStars-Vue3`（`src/types|api|stores|components|views` 下 points 相关代码），后端位于 `drawStars-serve-node`（Nest + Prisma + MySQL，`src/nest/modules/points`）。

### 1.2 设计目标

| 目标 | 说明 |
|------|------|
| **可运营** | 规则、等级、发放均可后台配置，无需发版改代码 |
| **可审计** | 每笔积分变动有流水；管理员发放必填原因并记录操作人 |
| **可扩展** | 积分类型、来源渠道、计算方式可扩展，核心账户/流水模型稳定 |
| **安全可控** | 日/月/单次限额、账户状态、权限码控制敏感操作 |
| **体验清晰** | C 端可见余额、等级进度、签到、明细与规则；管理端 Tab 化配置 |

### 1.3 不在本期范围

- 积分商城 / 实物兑换履约
- 积分转让、提现、跨用户赠送
- 多币种积分互通兑换（多类型账户本期仅建模与按类型隔离）
- 完整营销活动编排器（活动积分渠道预留）
- 积分过期批处理任务的可视化运营台（表结构已支持 `expire_at`，批跑与通知 v1.1+）
- 开放第三方积分 OpenAPI（v2.0）

---

## 二、用户角色

| 角色 | 说明 | 核心诉求 |
|------|------|----------|
| **普通用户** | 登录后使用个人中心「我的积分」 | 看余额与等级、签到领分、查明细与规则 |
| **平台管理员** | 管理中心「积分管理」 | 配置规则/等级、给用户发放积分、查看调整流水 |
| **系统/业务服务** | 通过通用积分操作接口记账 | 订单抵扣、任务奖励等业务侧入账（受规则与限额约束） |

> 权限与现有 RBAC 集成：  
> - 管理端入口：`system:points:list`  
> - 发放 / 规则·等级写操作：`system:points:operate`  
> - 前端通过路由 `meta.permission` 与 `v-permission` 控制可见性。

---

## 三、功能模块总览

```
积分管理
├── 1. 积分账户
│   ├── 账户查询 / 自动开户
│   ├── 可用 / 冻结 / 累计获得 / 累计消费
│   └── 账户状态（ACTIVE / FROZEN / CLOSED）
├── 2. 积分获取与消费
│   ├── 每日签到
│   ├── 通用积分操作（operate）
│   ├── 消费抵扣计算
│   └── 来源渠道（签到/消费/邀请/任务/活动/评价/分享/管理员/其他）
├── 3. 积分规则引擎
│   ├── 规则 CRUD
│   ├── 计算方式（FIXED / RATIO / FORMULA）
│   └── 日/月/单次限额与有效期
├── 4. 会员等级
│   ├── 等级配置 CRUD
│   ├── 升级门槛（累计获得积分）
│   └── 权益 JSON（折扣、免邮等）
├── 5. 交易流水
│   ├── 用户侧明细查询
│   └── 管理端流水（含操作人）
├── 6. 管理端运营
│   ├── 积分概览
│   ├── 新增积分（发放）
│   ├── 规则配置
│   └── 等级配置
└── 7. 用户侧展示
    ├── 积分卡片（余额/等级/签到）
    ├── 统计卡片（今日/本月/即将过期）
    ├── 积分明细弹窗
    └── 积分规则弹窗
```

---

## 四、各模块详细设计

### 4.1 积分账户

#### 4.1.1 账户模型

| 能力 | 说明 |
|------|------|
| 自动开户 | 首次查询账户时按 `userId + pointsType` 创建；默认类型 `GENERAL`，等级取 level=1 配置 |
| 唯一约束 | 同一用户同一积分类型仅一条账户 |
| 余额字段 | `availablePoints`（可用）、`frozenPoints`（冻结，待确认交易） |
| 累计字段 | `totalEarned`（累计获得）、`totalSpent`（累计消费） |
| 等级镜像 | 账户上冗余 `level` / `levelName`，入账后按累计获得重算 |

#### 4.1.2 账户状态

| 状态 | 说明 | 允许操作 |
|------|------|----------|
| ACTIVE | 正常 | 获取、消费、查询 |
| FROZEN | 冻结 | 仅查询；禁止增减（目标行为，需服务端校验对齐） |
| CLOSED | 关闭 | 仅查询历史 |

#### 4.1.3 积分类型（PointsType）

| 枚举 | 说明 |
|------|------|
| GENERAL | 通用积分（默认） |
| CONSUMPTION | 消费积分 |
| EVENT | 活动积分（限时场景） |
| INVITATION | 邀请积分 |

> 本期主路径以 GENERAL 为主；多类型并存时账户隔离，不自动互通。

---

### 4.2 积分获取与消费

#### 4.2.1 交易类型（PointsTransactionType）

| 枚举 | 说明 | 积分符号惯例 |
|------|------|--------------|
| EARN | 获取 | 正数 |
| SPEND | 消费 | 负数 |
| EXPIRE | 过期 | 负数 |
| ADJUST | 调整（含管理员发放） | 正/负 |
| REFUND | 退款回退 | 正数 |

#### 4.2.2 积分来源（PointsSource）

| 枚举 | 中文 | 典型场景 |
|------|------|----------|
| CHECK_IN | 签到 | 每日签到 |
| PURCHASE | 消费 | 下单返积分 / 抵扣 |
| INVITE_FRIEND | 邀请好友 | 邀请注册成功 |
| COMPLETE_TASK | 完成任务 | 任务中心 |
| EVENT_REWARD | 活动奖励 | 运营活动 |
| REVIEW | 评价 | 评价奖励 |
| SHARE | 分享 | 分享内容 |
| ADMIN_ADJUST | 管理员调整 | 后台发放 |
| OTHER | 其他 | 兜底 |

#### 4.2.3 每日签到

| 规则 | 说明 |
|------|------|
| 频率 | 同一用户自然日仅一次（`points_check_in` 唯一键 `user_id + check_in_date`） |
| 积分 | 读取启用规则 `DAILY_CHECK_IN`（默认 FIXED 10 分）；受规则日/月/单次限额约束 |
| 连续天数 | 昨日有签到则 +1，否则重置为 1 |
| 周状态 | 返回近 7 天是否签到数组，供前端展示 |
| 幂等 | 重复签到返回业务错误「今日已签到」；前端同步刷新状态 |

#### 4.2.4 通用积分操作（operate）

供业务侧调用的统一入账/扣减入口：

| 项 | 说明 |
|----|------|
| 入参 | userId、points（可负）、source、description；可选 referenceId/Type、immediate、extra |
| immediate=true | 直接变更可用余额并记 COMPLETED 流水 |
| immediate=false | 进入冻结/待确认（PENDING）路径，确认后再入账（能力预留） |
| 校验 | 扣减时余额不足失败；匹配规则时校验日/月/单次上限 |
| 流水 | 记录变动前后余额、来源、描述、可选过期时间 |

#### 4.2.5 消费与抵扣

| 规则 | 说明 |
|------|------|
| 汇率（默认） | **100 积分 = 1 元**（`calculate-deduction`，rate=0.01） |
| 订单上限 | 单笔最多抵扣订单金额的 **50%**（前端 `usePointsSpend` 约定，下单链路需服务端二次校验） |
| 不可用场景 | 转让、提现；规则页需明示 |

#### 4.2.6 管理员发放

| 规则 | 说明 |
|------|------|
| 权限 | `system:points:operate` |
| 必填 | userId、points（正整数）、reason（原因，至少 2 字） |
| 操作人 | 取当前登录用户，写入流水 `extra_data.operatorId/operatorName` |
| 来源 | `ADMIN_ADJUST` |
| 审计 | 管理端「新增积分」页展示调整记录列表 |

---

### 4.3 积分规则引擎

#### 4.3.1 规则字段

| 字段 | 说明 |
|------|------|
| name / code | 名称；编码全局唯一（如 `DAILY_CHECK_IN`） |
| source / pointsType | 关联来源与积分类型 |
| pointsValue | 固定值或比例基数 |
| calcMethod | FIXED 固定值 / RATIO 按比例 / FORMULA 公式（预留） |
| dailyLimit / monthlyLimit / singleLimit | 0 表示不限制 |
| validDays | 积分有效天数，0 表示永久 |
| enabled / priority | 启停；数值越大优先级越高 |
| startTime / endTime | 生效窗口（可选） |
| extraConfig | JSON 扩展 |

#### 4.3.2 限额机制

通过 `points_user_limit` 按 `userId + ruleCode + periodType + periodKey` 计数：

| periodType | periodKey 示例 | 用途 |
|------------|----------------|------|
| DAILY | `2026-08-06` | 日次数/积分上限 |
| MONTHLY | `2026-08` | 月次数/积分上限 |

超出时拒绝本次获取并返回明确错误。

#### 4.3.3 预置规则（种子数据）

| 编码 | 名称 | 默认值 | 日上限 |
|------|------|--------|--------|
| DAILY_CHECK_IN | 每日签到 | 10 分 FIXED | 1 |
| CONSUMPTION_REWARD | 消费积分 | 0.01 RATIO | 不限 |
| INVITE_FRIEND | 邀请好友 | 100 分 | 5（月 30） |
| COMPLETE_TASK | 完成任务 | 50 分 | 10 |
| REVIEW_REWARD | 评价奖励 | 20 分 | 5 |
| SHARE_REWARD | 分享奖励 | 5 分 | 10 |

#### 4.3.4 管理端规则 CRUD

支持新增、编辑、删除、启停；写操作需 `system:points:operate`。编码冲突时拒绝保存。

---

### 4.4 会员等级

#### 4.4.1 等级模型

| 字段 | 说明 |
|------|------|
| level | 等级序号，唯一 |
| name / icon | 展示名与图标标识 |
| requiredPoints | 升级所需**累计获得积分**门槛 |
| benefits | JSON 权益，如 `{"discount":0.95,"freeShipping":true}` |
| description / sortOrder | 说明与排序 |

#### 4.4.2 预置等级

| 等级 | 名称 | 所需累计积分 | 权益摘要 |
|------|------|--------------|----------|
| 1 | 普通会员 | 0 | 注册即享 |
| 2 | 白银会员 | 1000 | 98 折 |
| 3 | 黄金会员 | 5000 | 95 折 + 免邮 |
| 4 | 铂金会员 | 10000 | 92 折 + 免邮 + 优先客服 |
| 5 | 钻石会员 | 50000 | 88 折 + 全部权益 |

#### 4.4.3 升级逻辑

- 依据账户 `totalEarned` 与等级表 `requiredPoints` 匹配当前档位
- 前端展示升级进度条与「距下一等级还需 N 积分」
- 入账成功后服务端更新账户 level / levelName（与后端实现保持一致）

---

### 4.5 交易流水与统计

#### 4.5.1 流水字段要点

| 字段 | 说明 |
|------|------|
| transactionNo | 唯一流水号，格式建议 `PT{yyyyMMddHHmmss}{rand}` |
| points / balanceBefore / balanceAfter | 变动值与前后余额 |
| source / type / status | 来源、交易类型、状态 |
| referenceId / referenceType | 关联业务（如订单） |
| description | 描述或调整原因 |
| expireAt | 该笔积分过期时间（可选） |
| operatorId / operatorName | 管理端发放时从 extra 映射到前端展示 |

#### 4.5.2 交易状态

| 状态 | 说明 |
|------|------|
| PENDING | 待确认 |
| COMPLETED | 已完成 |
| FAILED | 失败 |
| CANCELLED | 已取消 |

#### 4.5.3 用户统计指标

| 指标 | 说明 |
|------|------|
| todayEarned / monthEarned / yearEarned | 今日/本月/本年获得（COMPLETED 且 points>0） |
| todaySpent | 今日消费绝对值 |
| expiringPoints / expiringDays | 未来 N 天（默认 30）内将过期的获得类积分合计 |

---

### 4.6 管理端运营

#### 4.6.1 积分概览

- KPI：当前登录账户可用积分、等级、启用规则数、等级档位数
- 规则/等级预览表（前 5 条）+ 快捷跳转
- 主按钮：给用户新增积分（需 operate 权限）

#### 4.6.2 新增积分

- 左：发放表单（远程搜索用户、积分数、原因）
- 右：管理员调整记录（筛选 source=ADMIN_ADJUST，分页）
- 展示当前操作人标签

#### 4.6.3 规则配置 / 等级配置

- 表格展示 + 弹窗表单新增/编辑
- 删除需二次确认
- 列表只读权限 `list`，写操作 `operate`

---

### 4.7 用户侧展示

#### 4.7.1 我的积分页

- 积分卡片：可用积分、等级标签、进度、签到按钮、明细/规则入口、连续签到天数
- 统计行：今日获得、本月获得、即将过期
- 弹窗：积分明细（来源筛选、分页）、积分规则（等级权益 + 获取方式 + 使用说明）

#### 4.7.2 使用说明（对用户文案）

- 100 积分 = 1 元  
- 单笔最多抵扣订单 50%  
- 默认有效期 365 天  
- 不可转让、不可提现  

---

## 五、核心数据模型

### 5.1 实体关系

```
┌──────────────┐     1:N     ┌────────────────────┐
│ 积分账户      │────────────→│ 积分交易流水         │
│ PointsAccount│             │ PointsTransaction  │
└──────┬───────┘             └─────────┬──────────┘
       │                               │
       │ N:1（类型维度）                │ 可选关联规则/业务
       ▼                               ▼
┌──────────────┐             ┌────────────────────┐
│ 积分类型枚举  │             │ 业务单据（订单等）   │
└──────────────┘             └────────────────────┘

┌──────────────┐             ┌────────────────────┐
│ 积分规则      │────────────→│ 用户限额计数         │
│ PointsRule   │   约束       │ PointsUserLimit    │
└──────────────┘             └────────────────────┘

┌──────────────┐             ┌────────────────────┐
│ 积分等级      │  决定升级   │ 签到记录             │
│ PointsLevel  │←───────────│ PointsCheckIn       │
└──────────────┘  (累计获得)  └────────────────────┘
```

### 5.2 核心实体字段

#### 积分账户 (points_account)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint | 主键 |
| user_id | bigint | 用户 ID |
| points_type | varchar(32) | 积分类型，默认 GENERAL |
| available_points | int | 可用积分 |
| frozen_points | int | 冻结积分 |
| total_earned | int | 累计获得 |
| total_spent | int | 累计消费 |
| level | tinyint | 当前等级 |
| level_name | varchar(32) | 等级名称 |
| status | varchar(16) | ACTIVE/FROZEN/CLOSED |
| created_at / updated_at | datetime | 时间戳 |

> 唯一索引：`uk_user_points_type (user_id, points_type)`

#### 积分交易 (points_transaction)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint | 主键 |
| transaction_no | varchar(32) | 流水号，唯一 |
| user_id / account_id | bigint | 用户与账户 |
| type | varchar(16) | 交易类型 |
| points | int | 变动值（可负） |
| balance_before / balance_after | int | 前后余额 |
| source | varchar(32) | 来源 |
| reference_id / reference_type | varchar | 业务关联 |
| description | varchar(255) | 描述/原因 |
| expire_at | datetime | 过期时间 |
| status | varchar(16) | 交易状态 |
| extra_data | json | 扩展（含操作人等） |
| created_at | datetime | 创建时间 |

#### 积分规则 (points_rule)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint | 主键 |
| name / code | varchar | 名称 / 唯一编码 |
| source / points_type | varchar | 来源 / 类型 |
| points_value | decimal(10,4) | 积分值 |
| calc_method | varchar(16) | FIXED/RATIO/FORMULA |
| daily_limit / monthly_limit / single_limit | int | 限额，0=不限 |
| valid_days | int | 有效天数 |
| description | varchar | 说明 |
| enabled | tinyint | 是否启用 |
| priority | int | 优先级 |
| start_time / end_time | datetime | 生效窗口 |
| extra_config | json | 扩展 |

#### 积分等级 (points_level)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint | 主键 |
| level | tinyint | 等级，唯一 |
| name / icon | varchar | 名称 / 图标 |
| required_points | int | 升级所需累计积分 |
| benefits | json | 权益 |
| description | varchar | 说明 |
| sort_order | int | 排序 |

#### 签到记录 (points_check_in)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint | 主键 |
| user_id | bigint | 用户 |
| check_in_date | date | 签到日 |
| points_earned | int | 当日获得 |
| consecutive_days | int | 连续天数 |
| created_at | datetime | 创建时间 |

> 唯一索引：`uk_user_date (user_id, check_in_date)`

#### 用户限额 (points_user_limit)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint | 主键 |
| user_id | bigint | 用户 |
| rule_code | varchar(32) | 规则编码 |
| period_type | varchar(16) | DAILY/MONTHLY 等 |
| period_key | varchar(16) | 周期键 |
| count / points | int | 已用次数 / 已获积分 |
| updated_at | datetime | 更新时间 |

---

## 六、页面结构

### 6.1 路由规划

```
/home/personalCenter/points                    ← 我的积分（C 端）

/home/manageHomePage/points                    ← 积分管理（重定向 overview）
/home/manageHomePage/points/overview           ← 概览
/home/manageHomePage/points/adjust             ← 新增积分（需 operate）
/home/manageHomePage/points/rules              ← 规则配置
/home/manageHomePage/points/levels             ← 等级配置
```

### 6.2 关键页面说明

#### 我的积分

- 顶部积分卡片 + 快捷操作（签到 / 明细 / 规则）
- 中部三列统计卡
- 明细、规则以 Dialog 形式打开，不占用独立路由

#### 管理端容器

- Tab：概览 | 新增积分 | 规则配置 | 等级配置
- Tab 切换同步路由 path

#### 新增积分

```
┌─────────────────┬──────────────────────────┐
│ 发放表单         │ 管理员调整记录            │
│ 用户搜索         │ 时间/用户/积分/原因/操作人 │
│ 积分数 + 原因    │ 分页                      │
│ 确认新增         │                          │
└─────────────────┴──────────────────────────┘
```

---

## 七、接口概要

> 网关前缀：`/api`；前端 axios 基址已含 `/api`，调用时写 `/points/...`。  
> Mock 开关：`.env` 中 `VITE_POINTS_MOCK`，`false` 时走真实接口。

### 7.1 账户与流水（用户）

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/points/account` | GET | 查询/自动创建账户；可选 pointsType |
| `/api/points/transactions` | GET | 当前用户流水分页；可筛 type/source/时间 |
| `/api/points/statistics` | GET | 今日/月/年获得、今日消费、即将过期 |

### 7.2 签到与操作

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/points/check-in` | POST | 每日签到 |
| `/api/points/check-in/status` | GET | 今日是否签到、连续天数、近 7 日状态 |
| `/api/points/operate` | POST | 通用增减积分 |
| `/api/points/calculate-deduction` | GET | 积分可抵扣金额（points→金额） |

### 7.3 规则与等级

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/points/rules` | GET | 规则列表（可筛 source/type/enabled） |
| `/api/points/rules` | POST | 创建规则（需 operate） |
| `/api/points/rules` | PUT | 更新规则（需 operate） |
| `/api/points/rules/:id` | DELETE | 删除规则（需 operate） |
| `/api/points/levels` | GET | 等级列表 |
| `/api/points/levels` | POST | 创建等级（需 operate） |
| `/api/points/levels` | PUT | 更新等级（需 operate） |
| `/api/points/levels/:id` | DELETE | 删除等级（需 operate） |

### 7.4 管理端

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/points/admin/grant` | POST | 管理员发放；body: userId, points, reason；需 operate |
| `/api/points/admin/transactions` | GET | 管理端流水（含操作人）；需 list |

**统一响应约定**：`{ status: boolean, msg: string, data: T }`

---

## 八、非功能性需求

| 维度 | 要求 |
|------|------|
| **性能** | 账户查询 < 200ms；签到（含写流水）< 500ms；流水分页 < 500ms（单用户万级流水内） |
| **并发** | 同一用户签到/扣减需事务 + 唯一约束防重；支持高峰签到（建议账户行级锁或事务） |
| **一致性** | 余额变更与流水同事务；流水号全局唯一 |
| **安全** | 发放/规则写接口鉴权 + 权限码；原因必填；操作人不可由客户端伪造 |
| **兼容性** | 管理端与个人中心跟随主站浏览器矩阵（Chrome 90+ 等） |
| **可用性** | 积分服务故障时，非积分主流程可降级（下单临时禁用抵扣） |
| **可观测** | 关键失败（余额不足、超限、重复签到）返回明确业务码/文案，便于客服排查 |

---

## 九、扩展性设计

### 9.1 来源与类型扩展

- 新增 `PointsSource` / `PointsType` 枚举值 + 中文标签（`points-labels.ts`）
- 新增规则种子或后台配置即可接入，不必改账户表结构

### 9.2 计算方式扩展

`calcMethod` 策略化：

| 方式 | 行为 |
|------|------|
| FIXED | 直接取 pointsValue |
| RATIO | `floor(amount * pointsValue)` |
| FORMULA | 读取 extraConfig 公式（v1.1+） |

### 9.3 业务接入方式

业务方（订单、任务、邀请）统一走 `operate` 或领域封装，并传入 `referenceId/referenceType`，保证可追溯。

### 9.4 与现有系统集成点

| 集成对象 | 集成方式 |
|----------|----------|
| 用户体系 | userId 关联；发放页远程搜用户 |
| 权限体系 | `system:points:list` / `system:points:operate` |
| 个人中心 | 路由 `/home/personalCenter/points` |
| 管理中心 | `/home/manageHomePage/points/*` |
| 前端状态 | Pinia `pointsStore`（session 持久化账户与签到状态） |
| 订单/商城 | 抵扣计算接口 + 服务端核销（商城模块对接时） |

---

## 十、版本规划

| 版本 | 范围 | 预计周期 |
|------|------|----------|
| **v1.0** | 账户自动开户、签到、规则/等级 CRUD、流水与统计、管理员发放、C 端展示、Mock/真实切换 | 已落地（对照现码） |
| **v1.1** | 过期批处理任务 + 过期提醒；冻结/解冻完整闭环；FORMULA 计算；连续签到阶梯奖励 | 2 周 |
| **v1.2** | 订单抵扣服务端核销与回退（REFUND）；任务/邀请事件自动入账对接 | 2～3 周 |
| **v1.3** | 管理端全局用户积分检索、批量发放、导出流水 | 2 周 |
| **v2.0** | 积分商城、活动编排、开放 API、多类型兑换 | 4 周 |

---

## 附录 A：术语表

| 术语 | 说明 |
|------|------|
| 积分账户 (PointsAccount) | 用户在某积分类型下的余额与等级载体 |
| 积分流水 (PointsTransaction) | 一笔积分变动的不可抹记账记录 |
| 积分规则 (PointsRule) | 定义如何计算、限额与有效期的配置 |
| 积分等级 (PointsLevel) | 按累计获得积分划分的会员档位与权益 |
| 签到 (Check-in) | 每日一次的固定规则领分行为 |
| 冻结积分 (Frozen Points) | 待确认交易占用的积分，不可直接消费 |
| 管理员发放 (Admin Grant) | 后台人工加分，必须写原因并记操作人 |
| 抵扣汇率 | 积分换算现金的比例，默认 100:1 |

## 附录 B：代码与库表索引

| 层级 | 路径 |
|------|------|
| 类型定义 | `drawStars-Vue3/src/types/points.ts` |
| API | `drawStars-Vue3/src/api/points.ts` |
| Store / Composable | `src/stores/points.ts`、`src/composables/usePoints.ts` |
| C 端页面 | `src/views/profile/points.vue`、`src/components/points/*` |
| 管理端 | `src/views/manage/pointsManage/*` |
| 路由 | `src/router/homePages/profile.ts`、`manage.ts` |
| 后端模块 | `drawStars-serve-node/src/nest/modules/points/` |
| SQL | `drawStars-serve-node/sql/points_tables.sql` |
| 说明 | `drawStars-Vue3/src/database/points-README.md` |
