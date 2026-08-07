---
name: feature-development
description: >-
  根据 PRD/需求文档与 UI 设计开发 drawStars-Vue3 功能。
  遵守 ESLint/Prettier，优先复用通用组件，不满足时扩展或新增；
  兼顾高并发、性能与安全。
  在实现功能、按 PRD/prd 开发、按 UI 调样式、或用户要求开发模块/页面时使用。
---

# 功能开发工作流

按需求文档实现功能，有 UI 时对齐样式；代码遵循项目 ESLint/Prettier；优先复用通用组件，不满足时再扩展或新增。

## 触发场景

- 用户提供或指向 `prd/`、需求文档、验收标准
- 用户提供 Figma/设计稿/截图并要求还原样式
- 用户要求开发/实现某功能模块或页面

## 开发流程

复制并维护进度：

```
功能开发进度:
- [ ] 1. 读需求 / UI，明确范围与验收标准
- [ ] 2. 扫描可复用组件、页面、API、store、路由
- [ ] 3. 设计实现方案（数据流、页面结构、组件清单）
- [ ] 4. 实现功能（优先复用，再扩展/新增）
- [ ] 5. 有 UI 则对齐样式与交互
- [ ] 6. 检查高并发、性能、安全
- [ ] 7. lint/format 通过，自检验收标准
```

### 1. 需求与范围

有需求文档时：

1. 先读完整相关章节（背景、角色、功能、字段、状态机、权限、边界）
2. 列出本期必做 vs 明确不做
3. 拆成可交付小任务（页面 / API / 组件 / 权限 / 文案）
4. 需求冲突或缺失时先向用户确认，再写代码

无完整 PRD 时：根据用户描述补齐验收要点后再开发。

### 2. 复用优先（组件策略）

**顺序：复用 → 扩展 → 新增。禁止平行造轮子。**

先搜索：

| 类型 | 位置 |
|------|------|
| 通用基础 | `src/components/base/`（BaseDialog、BaseFormItem、BaseTable、SearchForm、SearchItem、UserSearchSelect、VirtualList 等） |
| 业务组件 | `src/components/` 下业务目录（points、analytics、layout、ai-assistant 等） |
| 页面内组件 | `src/views/**/components/` |
| UI 库 | Element Plus、`draw-stars-ui` |
| 工具/状态 | `src/utils/`、`src/stores/`、`src/api/` |

决策：

- **能复用**：直接用现有 props/slots/events
- **差一点**：在原组件上扩展 props/slots，保持向后兼容
- **全新能力**：在合适目录新增组件；通用放 `src/components/base/`，业务放对应业务目录
- 列表筛选用 SearchForm；弹窗表单优先 BaseDialog + BaseFormItem；表格优先 BaseTable

### 3. 有 UI 时的样式对齐

1. 对照设计稿/截图：布局、间距、字号、颜色、状态（hover/disabled/empty/loading）
2. 优先沿用项目已有样式体系（Tailwind、Less、Element Plus 主题变量）
3. 不引入与现有页面冲突的全新视觉体系
4. 桌面与移动端都要可用（按现有布局习惯）
5. 仅改样式时：不改业务逻辑与数据结构，除非 UI 强制要求

### 4. 代码规范（必须遵守）

配置源：`.eslintrc.js`、`.prettierrc.cjs`

Prettier 要点：

- printWidth 80、tabWidth 2、不用 tab
- 无分号 `semi: false`、单引号 `singleQuote: true`
- `trailingComma: none`、`arrowParens: avoid`
- `endOfLine: lf`

ESLint 要点：

- Vue + Prettier 集成；`prettier/prettier` 为 warn
- 未使用变量：`_` 前缀可忽略
- Vue 多词组件名规则已关闭，仍优先有意义命名

改完后执行：

```bash
npm run lint
```

有格式问题时：

```bash
npm run lint:fix
```

或按需对改动文件跑 prettier。不要为无关文件做全库 format。

### 5. 实现约定

- 对齐邻近页面的目录、命名、API 封装、权限写法
- 管理端列表页参考 `src/views/manage/` 现有模式
- 新增路由/菜单/权限码与项目 RBAC 惯例一致
- 中文文案写入源码时注意 UTF-8，避免乱码
- 不做需求外重构；不擅自扩大范围
- **需求文档同步**：功能调整若与所属 PRD/需求文档不一致或冲突，必须同步修改对应文档（如 prd/ 下文件），并补充版本记录

### 6. 高并发、性能与安全（必须考虑）

实现业务逻辑时同步审视；有写操作、列表、上传、权限相关功能时尤其重要。

#### 高并发 / 竞态

- 写操作（提交、领取、审核、支付、删除等）：防重复提交（loading 锁、按钮 disabled、短时内忽略重复点击）
- 搜索/筛选/输入触发请求：防抖或节流；快速切换条件时取消或忽略过期响应（避免旧数据覆盖新数据）
- 并发请求：合并可合并的请求；避免同一页面无限重复打接口
- 状态更新：以最新请求结果为准；组件卸载后不再写入状态
- 涉及积分/奖励/库存等敏感资源：假设服务端做幂等与校验，前端不作唯一信任来源

#### 性能

- 列表必须分页或虚拟滚动（优先复用 `VirtualList`）；禁止一次拉全量大数据渲染
- 大表/多 Tab：按需加载；避免首屏同时发起大量无关请求
- 图片/附件：压缩、懒加载、合理尺寸限制；避免巨图直接 base64 塞进店
- 避免在渲染热路径做重计算；大列表 item 保持轻量
- 路由级页面按需异步加载（与现有 router 惯例一致）
- ECharts/地图等重型组件：及时 dispose，避免内存泄漏

#### 安全

- 权限：菜单/按钮/接口与 RBAC 一致；前端隐藏不等于安全，敏感操作必须依赖服务端校验
- XSS：不对用户输入做 `v-html`；必须时先清洗/白名单；富文本优先复用现有 `RichTextViewer` 等组件
- 敏感信息：Token、密钥、私钥不写入仓库、日志、错误弹窗；不在前端硬编码密钥
- 输入校验：前端做体验与长度/格式校验，仍假设后端会再校；文件上传限制类型与大小
- 跳转/链接：外链打开注意 rel 与协议检查；避免开放重定向
- 不在 URL query 中放密码、Token、身份证等敏感参数

### 7. 完成自检

- [ ] 验收标准覆盖
- [ ] 优先复用了通用组件，扩展/新增有理由
- [ ] 有 UI 时视觉与交互对齐
- [ ] 高并发：写操作防重、过期请求已处理
- [ ] 性能：列表分页/虚拟化、无无意义重请求与渲染
- [ ] 安全：权限、XSS、敏感信息、输入校验已考虑
- [ ] `npm run lint` 无新增 error（warn 尽量清）
- [ ] 未引入无关文件与无关重构
- [ ] 若有行为/文案/导航变更，所属需求文档已同步更新

## 附加资源

- 对话提示词模板：[prompt-templates.md](prompt-templates.md)
