# 权限管理体系 — 产品需求设计文档（PRD）

> **项目**: drawStars (Vue3)
> **版本**: v1.0
> **日期**: 2026-08-06
> **状态**: 初稿（基于现有前后端 RBAC 代码整理）
> **关联规范**: `需求文档输出规范.md`

---

## 一、需求背景与目标

### 1.1 背景

drawStars 已从单角色演示演进为多业务平台（用户管理、积分、问卷、通知、日志等），需要统一的权限体系支撑：

- 不同运营/管理角色看到不同菜单与可操作按钮
- 敏感接口（用户删改、角色绑菜单、积分发放等）服务端强校验
- 菜单、权限码可配置，新增业务模块时可扩展而不改鉴权核心
- 超级管理员具备兜底全权限，避免配置遗漏导致无法运维

前端能力集中在 `permissionStore`、`v-permission`、路由 `meta.permission`；后端集中在 Nest `rbac` 模块（`PermissionsGuard` + `RequirePermissions`）。

### 1.2 设计目标

| 目标       | 说明                                                       |
| ---------- | ---------------------------------------------------------- |
| **统一**   | 用户—角色—菜单（权限码）一条链路，前后端同一套权限码语义   |
| **可控**   | 路由、按钮、接口三层拦截；缺权不可见、不可进、不可调       |
| **可运营** | 角色、菜单、用户授角均可后台配置，无需发版改硬编码名单     |
| **可兜底** | `super_admin` 自动拥有全部启用权限码与菜单，不依赖勾选同步 |
| **可扩展** | 新模块按 `域:资源:动作` 约定新增权限码与菜单节点即可接入   |

### 1.3 不在本期范围

- ABAC / 数据权限（按部门、仅本人数据行级过滤）完整引擎（部分业务自建过滤，非统一框架）
- 动态路由按权限懒注册整棵前端路由树（本期静态路由 + meta 校验）
- 权限审批流、临时授权、委托授权
- 多租户隔离
- OAuth 第三方应用级 scope 管理（个人中心 OAuth 绑定为独立能力）

---

## 二、用户角色

| 角色                         | 说明                          | 核心诉求                                     |
| ---------------------------- | ----------------------------- | -------------------------------------------- |
| **普通用户 (user)**          | 默认业务用户                  | 使用个人中心与已授权前台功能                 |
| **进阶用户 (advanced)**      | 较高业务权限                  | 使用更多业务能力（由菜单绑定决定）           |
| **管理员 (admin)**           | 运营/管理中心常用操作         | 管理用户、配置业务，但不一定拥有全部系统权限 |
| **超级管理员 (super_admin)** | 平台最高权限                  | 任意菜单与接口；角色绑菜单只读展示全量       |
| **权限运维人员**             | 具备角色/菜单管理权限的管理员 | 维护角色、菜单树、用户授角                   |

> 预置角色编码与等级映射（种子）：`1→user`、`2→advanced`、`9→admin`、`99→super_admin`。
> 管理端入口权限示例：`system:user:list` / `system:role:list` / `system:menu:list`。
> 前端：路由 `meta.permission` + `v-permission`；后端：`@RequirePermissions` + `PermissionsGuard`（多码为 **OR**）。

---

## 三、功能模块总览

```text
权限管理（RBAC）
├── 1. 认证上下文与权限加载
│   ├── 登录后拉取用户菜单 / 权限码
│   ├── Pinia 持久化（sessionStorage）
│   └── 登出清理
├── 2. 角色管理
│   ├── 角色 CRUD / 启停
│   ├── 权限字符（code）
│   └── 绑定菜单（含半选父节点）
├── 3. 菜单与权限码管理
│   ├── 目录 / 菜单 / 按钮树
│   ├── 权限码维护
│   └── 显隐与启停
├── 4. 用户授角
│   ├── 创建/编辑用户时绑定角色
│   └── 独立「分配角色」操作
├── 5. 前端鉴权表现
│   ├── 侧边栏菜单渲染（RBAC 树）
│   ├── 路由守卫
│   └── 按钮指令 v-permission
├── 6. 后端鉴权
│   ├── PermissionsGuard
│   ├── 权限聚合（含 super_admin 兜底）
│   └── 用户菜单树构建（补全父级）
└── 7. 个人中心只读视角
    └── 我的角色与权限列表
```

---

## 四、各模块详细设计

### 4.1 认证上下文与权限加载

#### 4.1.1 加载时机

| 时机       | 行为                                                       |
| ---------- | ---------------------------------------------------------- |
| 登录成功   | 保存用户与 Token 后调用 `permissionStore.loadPermission()` |
| 路由跳转   | `App.vue` `beforeEach`：已登录且 `!loaded` 时补拉权限      |
| 侧边栏挂载 | 若未加载且菜单为空，触发 `loadPermission()`                |
| 登出       | `clearPermission()`，清空 roles / permissions / menus      |

#### 4.1.2 加载接口

并行请求（无需 `PermissionsGuard`，以便登录引导）：

| 接口                               | 说明                            |
| ---------------------------------- | ------------------------------- |
| `GET /api/menuApi/userMenus`       | 当前用户可见菜单树（目录+菜单） |
| `GET /api/menuApi/userPermissions` | `{ roles, permissions, ... }`   |

用户 ID 解析优先级：请求鉴权 uid → JWT → query/body 中的 userId（以后端 `resolveUserIdFromRequest` 为准）。

#### 4.1.3 前端状态

| 字段         | 说明                     |
| ------------ | ------------------------ |
| roles        | 角色编码数组             |
| permissions  | 权限码数组               |
| menus        | 侧边栏菜单树             |
| loaded       | 是否已完成首次加载       |
| isSuperAdmin | `roles` 含 `super_admin` |

`hasPermission(code | code[])`：无码 / 跳过登录模式 / 超管 / **任一**码命中 → true。

---

### 4.2 角色管理

#### 4.2.1 功能列表

| 功能     | 说明                                   | 权限码                                                                  |
| -------- | -------------------------------------- | ----------------------------------------------------------------------- |
| 列表查询 | 分页/筛选角色                          | `system:role:list`（用户管理授角场景亦可用 `system:user:list` 调 list） |
| 详情     | 单角色信息                             | `system:role:list`                                                      |
| 新增     | 名称、权限字符 code、备注、排序、状态  | `system:role:create`                                                    |
| 编辑     | 更新字段；code 唯一                    | `system:role:update`                                                    |
| 删除     | 禁止删除 `super_admin`                 | `system:role:delete`                                                    |
| 启停     | status 启用/停用；停用后不参与权限聚合 | `system:role:update`                                                    |
| 绑定菜单 | 树勾选；提交 checked + half-checked    | `system:role:bind`                                                      |

#### 4.2.2 角色状态

| 状态 | 值  | 说明                                 |
| ---- | --- | ------------------------------------ |
| 启用 | 1   | 参与用户权限与菜单聚合               |
| 停用 | 0   | 即使用户仍关联该角色，也不再贡献权限 |

#### 4.2.3 绑定菜单规则

| 规则        | 说明                                                  |
| ----------- | ----------------------------------------------------- |
| 普通角色    | 全量替换 `sys_role_menu` 为提交的 menuIds             |
| super_admin | 服务端强制拥有全部菜单；忽略前端勾选变更；UI 禁用编辑 |
| 半选父节点  | 前端提交时一并带上，保证目录结构完整                  |
| 新建菜单    | 创建后自动确保超管角色绑定该菜单                      |

---

### 4.3 菜单与权限码管理

#### 4.3.1 菜单类型

| type | 名称 | 用途                                       |
| ---- | ---- | ------------------------------------------ |
| 1    | 目录 | 侧边栏分组，可无 path 或仅作容器           |
| 2    | 菜单 | 可导航页面；参与侧边栏                     |
| 3    | 按钮 | 权限点载体，**不进侧边栏**；权限码常挂于此 |

#### 4.3.2 功能列表

| 功能       | 说明                                               | 权限码               |
| ---------- | -------------------------------------------------- | -------------------- |
| 树形列表   | 全量菜单树表格                                     | `system:menu:list`   |
| 新增       | 支持在目录/菜单下新增子节点；按钮下不可再开子菜单  | `system:menu:create` |
| 编辑       | 改名称、路径、组件、权限码、图标、排序、显隐、状态 | `system:menu:update` |
| 删除       | 删除节点（需处理子节点策略，与现实现一致）         | `system:menu:delete` |
| 保存后刷新 | 删除等变更后刷新 `permissionStore`，侧边栏即时生效 | —                    |

#### 4.3.3 显隐与启停

| 字段    | 值              | 对用户菜单的影响                                                             |
| ------- | --------------- | ---------------------------------------------------------------------------- |
| status  | 1 启用 / 0 停用 | 停用菜单不进入权限聚合与用户菜单                                             |
| visible | 1 显示 / 0 隐藏 | 用户菜单仅返回 visible=1；隐藏菜单仍可挂权限码供按钮鉴权（视绑定与聚合逻辑） |

> 用户菜单过滤：`status=1` 且 `visible=1` 且 `type ∈ {1,2}`；若子菜单被授权，需**向上补全父目录**，避免侧边栏断层。

#### 4.3.4 权限码命名约定

推荐格式：`{域}:{资源}:{动作}`

| 示例                           | 含义            |
| ------------------------------ | --------------- |
| `system:user:list`             | 用户列表        |
| `system:role:bind`             | 角色绑定菜单    |
| `system:points:operate`        | 积分写操作/发放 |
| `survey:questionnaire:analyze` | 问卷分析        |

同一权限码可同时用于：菜单节点 `permission` 字段、路由 `meta.permission`、`v-permission`、接口 `@RequirePermissions`。

---

### 4.4 用户授角

| 功能          | 说明                   | 权限码               |
| ------------- | ---------------------- | -------------------- |
| 用户列表/详情 | 展示已绑角色名         | `system:user:list`   |
| 创建用户      | 可同时提交 roleIds     | `system:user:create` |
| 编辑用户      | 可更新 roleIds         | `system:user:update` |
| 分配角色      | 独立弹窗多选角色后提交 | `system:user:assign` |
| 重置密码      | 管理端重置             | `system:user:update` |
| 删除用户      | 软删等策略按用户模块   | `system:user:delete` |

**授角写入规则**：`assignRoles` 先清空该用户全部 `sys_user_role`，再按去重后的 roleIds 批量插入（全量覆盖，非增量补丁）。

---

### 4.5 前端鉴权表现

#### 4.5.1 侧边栏

- 数据源：`permission.menus`
- 过滤：去掉首页占位、去掉 `type===3`
- 最多三级展示；无 RBAC 菜单时回退静态菜单（兼容）
- 已知差距：部分业务子菜单（如问卷区）仍可能存在硬编码入口，后续应收敛到 RBAC 树（见版本规划）

#### 4.5.2 路由守卫

```text
未登录且非公开页 → /login
已登录且权限未加载 → loadPermission()
目标路由 meta.permission 未通过 hasPermission → 重定向 /home/homepage
```

管理中心示例：

| 路径                                 | meta.permission         |
| ------------------------------------ | ----------------------- |
| `/home/manageHomePage/user`          | `system:user:list`      |
| `/home/manageHomePage/role`          | `system:role:list`      |
| `/home/manageHomePage/menu`          | `system:menu:list`      |
| `/home/manageHomePage/points`        | `system:points:list`    |
| `/home/manageHomePage/points/adjust` | `system:points:operate` |

#### 4.5.3 按钮指令

- 指令名：`v-permission`
- 取值：`string` 或 `string[]`（OR）
- 无权限：`display:none` + `aria-hidden`（不卸载 DOM）
- 注意：仅前端隐藏，**不能替代**接口鉴权

---

### 4.6 后端鉴权

#### 4.6.1 聚合逻辑

```text
用户 → sys_user_role（角色 status=1）
     → sys_role_menu → sys_menu（status=1）
     → 收集 menu.permission 非空集合

若角色含 super_admin：
     → 额外并入所有 status=1 且 permission 非空的菜单权限码
     → 用户菜单返回全部启用且可见的目录/菜单
```

#### 4.6.2 Guard 行为

| 项       | 说明                                             |
| -------- | ------------------------------------------------ |
| 装饰器   | `@RequirePermissions('a', 'b')` → 满足任一即可   |
| 超管     | 直接放行                                         |
| 失败     | 无权限（与全局异常体系一致返回）                 |
| 引导接口 | `userMenus` / `userPermissions` 不做权限码 Guard |

#### 4.6.3 特殊保护

| 场景     | 规则                                       |
| -------- | ------------------------------------------ |
| 删除角色 | 禁止删除 code=`super_admin`                |
| 绑定菜单 | 超管忽略客户端 menuIds，服务端 ensure 全量 |
| 新建菜单 | 自动挂到超管角色                           |

---

### 4.7 个人中心只读视角

| 页面                                | 说明                                             |
| ----------------------------------- | ------------------------------------------------ |
| `/home/personalCenter/...` 我的角色 | 展示当前账号角色、状态、权限列表（只读）         |
| 接口                                | Profile `myRoles` 类接口，聚合方式与权限查询一致 |

不提供在个人中心自助改角色/改权限。

---

### 4.8 预置权限码清单（v1.0）

#### 系统域

| 权限码                                                         | 说明                                                   |
| -------------------------------------------------------------- | ------------------------------------------------------ |
| `system:user:list` / `create` / `update` / `delete` / `assign` | 用户管理                                               |
| `system:role:list` / `create` / `update` / `delete` / `bind`   | 角色管理                                               |
| `system:menu:list` / `create` / `update` / `delete`            | 菜单管理                                               |
| `system:points:list` / `operate` / `self`                      | 积分管理（list 查看，operate 发放与写配置，self 个人） |

#### 问卷域（与问卷模块共用）

| 权限码                                                       | 说明             |
| ------------------------------------------------------------ | ---------------- |
| `survey:questionnaire:list` / `create` / `update` / `delete` | 问卷基础         |
| `survey:questionnaire:publish` / `analyze` / `export`        | 发布与分析导出   |
| `survey:questionnaire:template` / `questionBank` / `grading` | 模板、题库、阅卷 |

> 新增业务模块时：先在菜单管理录入按钮权限码，再赋给角色，最后在路由/按钮/接口三处引用同一字符串。

---

## 五、核心数据模型

### 5.1 实体关系

```text
┌──────────┐     N:M     ┌──────────┐     N:M     ┌──────────┐
│  用户     │────────────→│  角色     │────────────→│  菜单     │
│  user    │ sys_user_role│ sys_role │ sys_role_menu│ sys_menu │
└──────────┘             └──────────┘             └────┬─────┘
                                                       │
                                                       │ permission
                                                       ▼
                                                 权限码（字符串）
                                                 用于路由/按钮/接口
```

### 5.2 核心实体字段

#### 角色 (sys_role)

| 字段                      | 类型     | 说明                         |
| ------------------------- | -------- | ---------------------------- |
| id                        | bigint   | 主键                         |
| name                      | varchar  | 角色名称                     |
| code                      | varchar  | 权限字符，唯一（如 `admin`） |
| remark                    | varchar  | 备注                         |
| status                    | tinyint  | 1 启用 / 0 停用              |
| sort                      | int      | 排序                         |
| create_time / update_time | datetime | 时间戳                       |

#### 菜单 (sys_menu)

| 字段                      | 类型     | 说明                     |
| ------------------------- | -------- | ------------------------ |
| id                        | bigint   | 主键                     |
| parent_id                 | bigint   | 父节点，根为 0           |
| name                      | varchar  | 名称                     |
| type                      | tinyint  | 1 目录 / 2 菜单 / 3 按钮 |
| path                      | varchar  | 路由 path                |
| component                 | varchar  | 前端组件标识（可选）     |
| permission                | varchar  | 权限码，可空             |
| icon                      | varchar  | 图标                     |
| sort                      | int      | 排序                     |
| visible                   | tinyint  | 1 显示 / 0 隐藏          |
| status                    | tinyint  | 1 启用 / 0 停用          |
| create_time / update_time | datetime | 时间戳                   |

#### 用户角色 (sys_user_role)

| 字段    | 类型   | 说明              |
| ------- | ------ | ----------------- |
| user_id | bigint | 用户 ID，联合主键 |
| role_id | bigint | 角色 ID，联合主键 |

#### 角色菜单 (sys_role_menu)

| 字段    | 类型   | 说明              |
| ------- | ------ | ----------------- |
| role_id | bigint | 角色 ID，联合主键 |
| menu_id | bigint | 菜单 ID，联合主键 |

---

## 六、页面结构

### 6.1 路由规划

```text
/home/manageHomePage/user          ← 用户管理（授角）
/home/manageHomePage/role          ← 角色管理（绑菜单）
/home/manageHomePage/menu          ← 菜单管理

/home/personalCenter/.../roles     ← 我的角色（只读，以实际 profile 路由为准）
```

### 6.2 关键页面说明

#### 用户管理

- 列表：账号信息 + 角色名展示
- 操作：新增/编辑（含角色多选）、分配角色、重置密码、删除
- 按钮按 `system:user:*` 显隐

#### 角色管理

- 列表：名称、权限字符、状态、排序
- 操作：新增/编辑/删除/启停
- 「绑定菜单」：左侧或弹窗内菜单树，勾选 + 半选；超管只读提示

#### 菜单管理

- 树表：类型标签、路径、权限码、显隐、状态
- 支持新增同级/子级；按钮类型限制再向下扩展
- 保存成功后刷新当前登录用户权限缓存（至少在删改后）

#### 绑定菜单弹窗（示意）

```text
┌─────────────────────────────────────┐
│ 为角色「管理员」绑定菜单              │
│ ☑ 管理中心                           │
│   ☑ 用户管理                         │
│     ☑ 查询  ☑ 新增  ☐ 删除 ...      │
│   ☑ 角色管理                         │
│ [取消]                    [保存]     │
└─────────────────────────────────────┘
```

---

## 七、接口概要

> 网关前缀 `/api`。下列权限均为 `@RequirePermissions`，多码为 OR。

### 7.1 角色

| 接口                           | 方法   | 说明                                                  |
| ------------------------------ | ------ | ----------------------------------------------------- |
| `/api/roleApi/list`            | GET    | 角色列表；需 `system:role:list` 或 `system:user:list` |
| `/api/roleApi/detail/:id`      | GET    | 详情；需 `system:role:list`                           |
| `/api/roleApi/create`          | POST   | 创建；需 `system:role:create`                         |
| `/api/roleApi/update`          | PUT    | 更新；需 `system:role:update`                         |
| `/api/roleApi/delete/:id`      | DELETE | 删除；需 `system:role:delete`                         |
| `/api/roleApi/menuIds/:roleId` | GET    | 已绑菜单 ID；需 `list` 或 `bind`                      |
| `/api/roleApi/bindMenus`       | POST   | body: `{ roleId, menuIds }`；需 `system:role:bind`    |

### 7.2 菜单

| 接口                           | 方法   | 说明                                         |
| ------------------------------ | ------ | -------------------------------------------- |
| `/api/menuApi/tree`            | GET    | 管理端菜单树；需 menu:list 或 role:bind/list |
| `/api/menuApi/detail/:id`      | GET    | 详情；需 `system:menu:list`                  |
| `/api/menuApi/create`          | POST   | 创建；需 `system:menu:create`                |
| `/api/menuApi/update`          | PUT    | 更新；需 `system:menu:update`                |
| `/api/menuApi/delete/:id`      | DELETE | 删除；需 `system:menu:delete`                |
| `/api/menuApi/userMenus`       | GET    | 当前用户侧边栏菜单（无权限码 Guard）         |
| `/api/menuApi/userPermissions` | GET    | 当前用户角色与权限码（无权限码 Guard）       |

### 7.3 用户管理（授角相关）

| 接口                               | 方法   | 说明                                                    |
| ---------------------------------- | ------ | ------------------------------------------------------- |
| `/api/userManageApi/list`          | GET    | 用户列表；需 `system:user:list`                         |
| `/api/userManageApi/detail/:id`    | GET    | 详情（含角色）；需 `system:user:list`                   |
| `/api/userManageApi/create`        | POST   | 创建（可带 roleIds）；需 `system:user:create`           |
| `/api/userManageApi/update`        | PUT    | 更新（可带 roleIds）；需 `system:user:update`           |
| `/api/userManageApi/delete/:id`    | DELETE | 删除；需 `system:user:delete`                           |
| `/api/userManageApi/resetPassword` | POST   | 重置密码；需 `system:user:update`                       |
| `/api/userManageApi/assignRoles`   | POST   | `{ userId, roleIds }` 全量覆盖；需 `system:user:assign` |

**统一响应约定**：与平台一致，如 `{ status, msg, data }`。

---

## 八、非功能性需求

| 维度       | 要求                                                                                                                         |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **安全**   | 所有写操作与敏感读必须以服务端 Guard 为准；前端隐藏仅体验层                                                                  |
| **性能**   | 用户权限聚合 < 300ms（常规角色菜单量）；菜单树管理端 < 500ms                                                                 |
| **缓存**   | 前端 session 级缓存 roles/permissions/menus；角色菜单变更后，受影响用户需重新登录或提供刷新入口方可感知（v1.1 可做主动失效） |
| **一致性** | 授角、绑菜单采用事务性覆盖写，避免半成功                                                                                     |
| **审计**   | 角色/菜单/授角变更建议写入操作日志（对接日志模块，v1.1 强化）                                                                |
| **兼容性** | 跟随主站浏览器矩阵；指令在 SSR/无 DOM 场景不报错                                                                             |
| **可用性** | 超管兜底保证系统在菜单配置失误时仍可进入菜单管理修复                                                                         |

---

## 九、扩展性设计

### 9.1 新模块接入步骤

1. 在菜单管理新增目录/菜单/按钮，填写权限码
2. 给目标角色绑定这些菜单
3. 前端路由增加 `meta.permission`，按钮加 `v-permission`
4. 后端 Controller 方法加 `@RequirePermissions` 与 `PermissionsGuard`
5. （可选）种子脚本同步预置数据，便于新环境初始化

### 9.2 鉴权扩展点

| 扩展点     | 说明                                                        |
| ---------- | ----------------------------------------------------------- |
| 权限码语义 | 字符串约定，不改表结构即可扩展                              |
| Guard      | 可在 OR 基础上扩展「全部满足」模式（需新装饰器，v1.1+）     |
| 菜单渲染   | Aside 仅消费树数据，新业务菜单配置化接入                    |
| 数据权限   | 在业务 Service 层按 userId/部门过滤，未来可抽统一 DataScope |

### 9.3 与现有系统集成点

| 集成对象    | 集成方式                                      |
| ----------- | --------------------------------------------- |
| 登录态      | Token / auth.uid 解析当前用户                 |
| 用户信息    | `userInfoStore.roles` 与 permission 同步      |
| 积分/问卷等 | 各自权限码挂到菜单并在接口 Guard              |
| 布局导航    | `AsideList` 消费 RBAC 菜单                    |
| 个人中心    | 只读展示我的角色与权限                        |
| 种子数据    | `prisma/seed-rbac.ts` / `sql/rbac_tables.sql` |

---

## 十、版本规划

| 版本     | 范围                                                                                                    | 预计周期           |
| -------- | ------------------------------------------------------------------------------------------------------- | ------------------ |
| **v1.0** | 角色/菜单/用户授角、权限加载、路由守卫、v-permission、Guard、超管兜底、预置 system/survey/points 权限码 | 已落地（对照现码） |
| **v1.1** | 侧边栏硬编码入口收敛到 RBAC；角色变更后在线刷新权限；操作审计完善；权限码 AND 鉴权可选                  | 2 周               |
| **v1.2** | 数据权限（本人/本部门/全部）基础 DataScope；菜单拖拽排序                                                | 2～3 周            |
| **v1.3** | 临时授权/权限有效期；权限差异对比（两角色）                                                             | 2 周               |
| **v2.0** | 多租户、审批流授权、动态路由注册                                                                        | 4 周               |

---

## 附录 A：术语表

| 术语                 | 说明                                                       |
| -------------------- | ---------------------------------------------------------- |
| RBAC                 | 基于角色的访问控制：用户通过角色获得菜单与权限码           |
| 权限码 (Permission)  | 字符串标识，如 `system:user:list`，贯穿菜单/路由/按钮/接口 |
| 权限字符 (Role Code) | 角色唯一编码，如 `super_admin`                             |
| 菜单类型             | 目录(1)/菜单(2)/按钮(3)                                    |
| 授角                 | 为用户分配一个或多个角色                                   |
| 绑菜单               | 为角色配置可访问的菜单与按钮权限点                         |
| 超管兜底             | `super_admin` 自动拥有全部启用权限，不依赖勾选完整性       |
| OR 鉴权              | `RequirePermissions` / `hasPermission` 对多码取任一命中    |

## 附录 B：代码与库表索引

| 层级         | 路径                                                                                 |
| ------------ | ------------------------------------------------------------------------------------ | ---------- | ----------- |
| 权限 Store   | `drawStars-Vue3/src/stores/permission.ts`                                            |
| 指令         | `src/utils/directives/permission.ts`                                                 |
| 路由守卫     | `src/App.vue`（`beforeEach`）                                                        |
| 侧边栏       | `src/components/AsideList.vue`                                                       |
| 管理页       | `src/views/manage/userManage                                                         | roleManage | menuManage` |
| API          | `src/assets/js/api/{role,menu,userManage}Controller/*`                               |
| 后端模块     | `drawStars-serve-node/src/nest/modules/rbac/`                                        |
| Guard/装饰器 | `src/nest/common/guards/permissions.guard.ts`、`decorators/permissions.decorator.ts` |
| SQL / 种子   | `sql/rbac_tables.sql`、`prisma/seed-rbac.ts`                                         |

## 附录 C：登录到鉴权时序

```text
登录成功
  → 持久化 Token / 用户信息
  → loadPermission（userMenus + userPermissions）
  → 进入首页，Aside 渲染 menus

用户点击管理端菜单
  → beforeEach 校验 meta.permission
  → 通过则进入页面；按钮级再经 v-permission

用户点击「发放积分」等写操作
  → 前端按钮可见性校验
  → 请求后端 → PermissionsGuard 校验 system:points:operate
  → 业务执行
```
