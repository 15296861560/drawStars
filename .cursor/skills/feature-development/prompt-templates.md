# 功能开发提示词模板

复制到对话中使用；按场景选用。开发时 Agent 会自动遵循 `.cursor/skills/feature-development` 与 `.cursor/rules/feature-development.mdc`。

---

## 模板 A：有需求文档

```text
请根据需求文档开发功能：

- 需求文档：@prd/任务管理体系_PRD_v1.0.md（或替换为实际路径）
- 本期范围：<模块名，如「任务大厅列表 + 接取」>
- 不做：<可选，或写「按 PRD 本期范围」>

要求：
1. 先读需求相关章节，列出实现清单与验收点，再写代码
2. 优先复用 src/components/base 与现有业务组件；不够再扩展或新增
3. 遵循项目 .eslintrc.js / .prettierrc.cjs，完成后跑 npm run lint
4. 目录与写法对齐邻近管理页（如 src/views/manage/）
5. 兼顾高并发（防重/防抖/过期响应）、性能（分页/虚拟列表/按需加载）、安全（RBAC/XSS/敏感信息）
6. 若实现与需求文档不一致或冲突，同步更新需求文档并记录版本
```

---

## 模板 B：有 UI 设计

```text
请根据 UI 调整/实现页面样式：

- 设计稿/截图：<附上图片或 Figma 链接>
- 目标页面：<路径，如 src/views/manage/xxx/index.vue>
- 对照重点：布局 / 间距 / 颜色 / 空态 / 交互态

要求：
1. 以现有页面结构为准，只改实现 UI 所需部分
2. 复用项目已有样式体系（Tailwind / Less / Element Plus），不另起视觉体系
3. 优先复用通用组件；样式差异用 props/class 扩展
4. 遵守 ESLint/Prettier，跑 npm run lint
5. 不因样式改动引入性能回退或安全风险（如不必要的 v-html、全量渲染）
```

---

## 模板 C：需求 + UI

```text
请按需求文档实现功能，并按 UI 还原界面：

- 需求：@prd/xxx.md ，范围：<模块>
- UI：<截图/Figma>
- 参考实现：<可选，如积分管理 pointsManage>

要求：
1. 功能以 PRD 验收为准，视觉以 UI 为准
2. 复用 → 扩展 → 新增组件
3. 遵循 ESLint/Prettier；完成后 lint
4. 兼顾高并发、性能、安全（防重提交、列表分页/虚拟化、RBAC/XSS/敏感信息）
5. 若实现与需求文档不一致或冲突，同步更新需求文档并记录版本
```

---

## 模板 D：只扩展/新增组件

```text
现有组件无法满足：<具体缺口>

请先搜索 src/components/base 与相关业务组件；
若可扩展则扩展并保持向后兼容；
若必须新增，放到合适目录并说明为何不能复用。
遵守项目 ESLint/Prettier。
新组件需考虑：高频触发时的防抖/防重、大数据性能、用户输入安全。
```
