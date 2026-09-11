# drawStars UI 设计标准 v1.0

> 默认主题：**星夜靛蓝（Starry Indigo）**，另内置 11 套可选预设（经典 8 + 莫兰迪 3）与自定义主色（见 3.6 多主题预设）
> 适用范围：drawStars-Vue3 全部前端页面与组件（流程编排、IM 协作、任务管理、问卷、数据分析、积分等模块）
> Token 单一来源：`src/assets/styles/theme/theme.less`（编译期基线）+ `src/config/theme-presets.ts`（运行时预设）
> 生效日期：2026-09-11

---

## 1. 设计理念

**「星夜与白昼」**——取自品牌「摘星」意象：

- **星夜（暗）**：侧边导航栏使用深夜空色 `#1e2438`，如静谧夜空，承载方向与秩序；
- **白昼（亮）**：工作区使用浅灰白 `#f6f8fa`，如晨光画布，承载内容与专注；
- **靛蓝（品牌）**：主色 `#4C5EDB` 如暮色天际的星光，贯穿所有交互与强调。

品牌识别度上以星夜靛蓝为默认、刻意与 Element Plus 默认蓝（`#409EFF`）区分；同时将后者收录为「晴空蓝」预设（见 3.6），供偏好 Element 经典视觉的用户一键切换——即：**默认有态度，切换有自由**。

## 2. 设计原则

1. **Token 唯一来源**：所有颜色、圆角、阴影、字体、动效参数只在 `theme.less` 定义，业务代码一律引用 token，禁止硬编码。
2. **克制的强调**：主色只用于「当前、选中、主操作、链接」四类场景；页面中大面积使用中性色，主色占比控制在 10% 以内。
3. **状态三段式**：可交互元素必须具备 hover / active 两级反馈（主色 hover 提亮、active 加深）。
4. **轻量动效**：过渡以 150–200ms 缓出为主，位移不超过 8px，禁止 3D 翻转、弹跳等表演型动画（特效展示页除外）。
5. **暗侧栏高对比**：暗底文本不低于 `#a6acc8`，高亮用纯白 + 主色指示条，不用黄色等杂色。

## 3. 色彩系统

### 3.1 品牌色（星夜靛蓝 · 默认主题基线）

> 以下为默认主题的编译期基线；切换其他预设时，`--ds-primary*` 与 `--el-color-primary*` 会被运行时内联样式覆盖（见 3.6），业务代码引用 token 即自动跟肤。

| Token                          | 色值      | 用途                               |
| ------------------------------ | --------- | ---------------------------------- |
| `@ds-primary` / `--ds-primary` | `#4C5EDB` | 主操作按钮、选中态、链接、焦点描边 |
| `@ds-primary-hover`            | `#6C7CE8` | 主色悬浮态                         |
| `@ds-primary-active`           | `#3A4AC2` | 主色按下态                         |
| `@ds-primary-light`            | `#EDEFFB` | 选中底色、标签底色、浅色填充       |

Element Plus 色阶（`element-theme.less` 已全局覆盖）：`--el-color-primary` = `#4C5EDB`，light-1~9 / dark-2 按 Element mix 规则推算，业务代码直接使用 `--el-color-primary-*`。

### 3.2 星夜暗色（侧栏 / 深色容器 · 默认主题基线）

> 切换预设时此组变量同步被覆盖为该主题配套夜色；自定义主色时保持本默认值。CSS 引用一律写 `var(--ds-night*)` 运行时变量。

| Token                   | 色值                     | 用途              |
| ----------------------- | ------------------------ | ----------------- |
| `@ds-night`             | `#1E2438`                | 暗侧栏底色        |
| `@ds-night-deep`        | `#171C2B`                | Logo 区、悬浮加深 |
| `@ds-night-hover`       | `rgba(255,255,255,0.08)` | 暗底菜单悬浮      |
| `@ds-night-text`        | `#A6ACC8`                | 暗底二级文本      |
| `@ds-night-text-active` | `#FFFFFF`                | 暗底选中文本      |

### 3.3 语义功能色

| 语义      | Token                   | 色值      | 场景             |
| --------- | ----------------------- | --------- | ---------------- |
| 成功/安全 | `@ds-color-success`     | `#2BA471` | 完成、通过、在线 |
| 警告/次要 | `@ds-color-warning`     | `#D97706` | 待办、注意、降级 |
| 紧急/错误 | `@ds-color-danger`      | `#DC2626` | 失败、删除、阻断 |
| 提示/运行 | `@ds-color-info`        | `#86909C` | 中性提示、运行中 |
| 未启动    | `@ds-color-not-started` | `#A4A5A6` | 草稿、未开始     |

### 3.4 中性色阶

- 文本：`#191919`（正文）/ `#626364`（二级）/ `#939496`（占位）/ `#D2D4D5`（禁用）
- 背景：`#F6F8FA`（页面底）/ `#FFFFFF`（卡片）/ `#EFF1F3`（悬浮填充）
- 描边：`#D2D4D5`（输入）/ `#E5E7E9`（分割线）/ `#757677`（悬浮描边）
- 完整 15 级灰阶见 `@color-gray-scale-1~15`

### 3.5 使用规则

- **CSS 样式中**：优先 `var(--el-color-primary)` 等 Element 变量；品牌专属场景用 `var(--ds-*)`；`.vue`/`.less` 中可直接用 LESS 变量 `@ds-*` / `@color-*`（vite modifyVars 已全局注入）。
- **JS/TS 中**（echarts 配置、地图 strokeColor、SVG setAttribute 等）：使用字面量 `'#4C5EDB'`（SVG 属性与 canvas 不解析 CSS var）。
- **rgba 派生色**：主色系阴影/蒙层用靛调 `rgba(76, 94, 219, α)`；遮罩用星夜调 `rgba(15, 22, 48, α)`；阴影统一靛蓝基底 `rgba(23, 32, 74, α)`。
- **预设主题色**：已升级为多主题预设体系，见 3.6；自定义取色器预定义色与预设主色保持一致（`#4C5EDB / #409EFF / #7C3AED / #0891B2 / #2BA471 / #D97706 / #DC2626 / #C71585 / #475569 / #6E8B9E / #90A47E / #B5838D`）。

### 3.6 多主题预设（换肤）

系统内置 **11 套主题预设**（`src/config/theme-presets.ts`），分两组：**经典系列** 8 套（高饱和品牌色）+ **莫兰迪系列** 3 套（低饱和灰调）。每套含精调主色阶 + 同色系夜色侧栏，另支持自定义主色。布局设置抽屉「主题配色」区块按组渲染卡片。

| 预设 key          | 名称               | 主色      | hover / active        | 浅底      | 夜色侧栏（底 / 深 / 文本）        |
| ----------------- | ------------------ | --------- | --------------------- | --------- | --------------------------------- |
| `starry-indigo`   | 星夜靛蓝（默认）   | `#4C5EDB` | `#6C7CE8` / `#3A4AC2` | `#EDEFFB` | `#1E2438` / `#171C2B` / `#A6ACC8` |
| `sky-blue`        | 晴空蓝             | `#409EFF` | `#66B1FF` / `#3A8EE6` | `#ECF5FF` | `#1A2B4A` / `#13203A` / `#A3B0CE` |
| `obsidian-violet` | 曜石紫             | `#7C3AED` | `#9558F0` / `#6428C4` | `#F1EBFD` | `#241D3A` / `#1B162C` / `#ACA6CE` |
| `lake-cyan`       | 湖光青             | `#0891B2` | `#23A8C9` / `#06768F` | `#E3F4F9` | `#17262E` / `#111D24` / `#A0B4C4` |
| `jade-green`      | 翡翠绿             | `#2BA471` | `#4CB98A` / `#21865C` | `#E7F6EF` | `#1B2721` / `#141D18` / `#A2BDAE` |
| `amber-glow`      | 琥珀橙             | `#D97706` | `#EA8F2B` / `#B4620A` | `#FCF0DF` | `#2A2119` / `#201912` / `#C4B39E` |
| `crimson`         | 绯红               | `#DC2626` | `#E8504F` / `#B71E1E` | `#FDEAEA` | `#2B1B1E` / `#211417` / `#C4A4AA` |
| `graphite`        | 石墨灰             | `#475569` | `#5D6C83` / `#384456` | `#EDEFF3` | `#1F2530` / `#181D26` / `#A6AEC2` |
| `morandi-mist`    | 雾霭蓝（莫兰迪）   | `#6E8B9E` | `#87A2B2` / `#597687` | `#EDF1F4` | `#2B343B` / `#22292F` / `#9FAEB8` |
| `morandi-sage`    | 鼠尾草绿（莫兰迪） | `#90A47E` | `#A6B995` / `#75886A` | `#F0F3EB` | `#2A3027` / `#212620` / `#A9B6A2` |
| `morandi-rose`    | 豆沙粉（莫兰迪）   | `#B5838D` | `#C79BA3` / `#9D6C76` | `#F8F0F2` | `#342C2E` / `#2A2325` / `#C0AFB3` |

**莫兰迪系列设计约束**：

- 核心特征是**低饱和（S ≈ 15–25%）、中等明度**的灰调，主色取自莫兰迪静物画的经典色域：雾霭蓝（灰蓝）、鼠尾草绿（灰绿）、豆沙粉（灰粉）；
- 色阶**必须全手工精调**：`theme-style.ts` 的算法（向白/黑混合）会稀释灰调、显得「漂」或「脏」，故莫兰迪预设的 hover/active/light 与夜色三值均逐个校色，不可算法派生（`theme-presets.ts` 文件头已注明）；
- 夜色侧栏同样保持灰调倾向（深灰蓝 / 深灰绿 / 深灰粉），避免高对比纯黑；
- 莫兰迪主色上的白字对比度天然低于经典系列（约 3:1），按钮文字建议搭配稍深的主色 active 层使用，暗底文本不低于组内 nightText 值。

**运行时机制**（`src/utils/theme-style.ts`）：

- 预设切换 `applyThemePreset(preset)` 将 `--el-color-primary` 色阶、`--ds-primary*`、`--ds-night*` 以内联 style 写入 `documentElement`，优先级高于 `:root` 基线，即时生效无需刷新。
- 自定义主色 `handleThemeStyle(hex)`：hover/active/light 由算法向白/黑混合派生；夜色侧栏回退默认星夜色。
- 持久化：`themeName`（预设 key 或 `custom`）随布局配置存 localStorage；旧数据仅存色值时按主色匹配回填预设 key，无匹配视为自定义。

**换肤编码规则**：

- 需要跟随换肤的暗色场景，CSS 一律用 `var(--ds-night)` / `var(--ds-night-deep)` / `var(--ds-night-text)`，**禁止**编译期 `@ds-night` 字面量引用（不会随运行时切换）。
- 主色场景天然跟随：`var(--el-color-primary)` / `var(--ds-primary)` 会在切肤时被内联覆盖。
- ECharts / SVG 等 JS 配置色为字面量快照，不随换肤联动；涉及品牌色的图表在主题切换后需重渲染或保持中性色。

## 4. 字体系统

字体栈：`'HarmonyOS Sans SC', 'PingFang SC', 'Microsoft YaHei', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`

| Token          | 字号 | 用途                 |
| -------------- | ---- | -------------------- |
| `@ds-font-xs`  | 12px | 辅助说明、标签、角标 |
| `@ds-font-sm`  | 13px | 次要正文、表格内容   |
| `@ds-font-md`  | 14px | 基准正文（默认）     |
| `@ds-font-lg`  | 16px | 卡片标题             |
| `@ds-font-xl`  | 18px | 页面标题             |
| `@ds-font-xxl` | 20px | 区块大标题           |

行高基准 1.5；标题可加粗（600/700），正文常规字重。

## 5. 圆角与阴影

### 5.1 圆角

| Token              | 值    | 用途                                 |
| ------------------ | ----- | ------------------------------------ |
| `@ds-radius-sm`    | 4px   | 标签、输入框、小按钮                 |
| `@ds-radius-md`    | 6px   | 按钮、卡片（Element 组件默认已对齐） |
| `@ds-radius-lg`    | 10px  | 弹框、面板、大容器                   |
| `@ds-radius-round` | 999px | 胶囊、头像环、开关                   |

### 5.2 阴影（靛调冷阴影）

| Token           | 值                              | 用途             |
| --------------- | ------------------------------- | ---------------- |
| `@ds-shadow-sm` | `0 1px 2px rgba(23,32,74,.06)`  | 卡片常态、轻浮层 |
| `@ds-shadow-md` | `0 4px 12px rgba(23,32,74,.08)` | 下拉、悬浮卡片   |
| `@ds-shadow-lg` | `0 8px 24px rgba(23,32,74,.12)` | 弹框、侧滑面板   |

禁止使用纯黑阴影；蒙层统一 `rgba(15, 22, 48, 0.45)` 起步。

## 6. 动效规范

| Token               | 值                                  | 用途                       |
| ------------------- | ----------------------------------- | -------------------------- |
| `@ds-duration-fast` | 150ms                               | hover、按下、icon 变色     |
| `@ds-duration-base` | 200ms                               | 展开、折叠、路由过渡、抽屉 |
| `@ds-ease-out`      | `cubic-bezier(0.22, 0.61, 0.36, 1)` | 标准缓出曲线               |

- 路由切换统一「淡入 + 8px 上移」（见 `Index.vue` 的 `.fade-*`）；
- 侧栏收展 300ms `@ds-ease-out`；
- 页面顶部长度条（nprogress）跟随 `--el-color-primary`。

## 7. 布局规范

```
┌─────────────────────────────────────────┐
│ 顶栏（白底 #FFFFFF + 底部 1px 靛调阴影）    │
├───────────┬─────────────────────────────┤
│           │  面包屑 / 页签               │
│  侧边导航   ├─────────────────────────────┤
│  星夜暗色   │                             │
│  #1E2438   │   工作区（白昼 #F6F8FA）      │
│  宽 200px  │   内容卡片（白底 + md 圆角）   │
│  收展 64px │                             │
└───────────┴─────────────────────────────┘
```

- 暗侧栏：底 `#1E2438`、菜单文本 `#A6ACC8`、悬浮 `rgba(255,255,255,.08)`、选中项文本纯白 + 主色指示；
- 工作区：页面底色 `var(--ds-bg-base)`（#F6F8FA），内容容器白底 + `@ds-radius-lg` 圆角 + `@ds-shadow-sm`；
- 滚动条：8px 宽中性细滚动条（`--el-border-color-dark`，hover 加深），透明轨道；
- 间距节奏：以 4px 为基数（8/12/16/24/32）。

## 8. 组件使用约定（Element Plus）

1. 主操作用 `type="primary"`（自动取新主色）；次要操作用 plain 或 default；危险操作必须 `type="danger"` 且需二次确认。
2. 表单校验错误色自动继承 `--el-color-danger`，不自定义。
3. 状态标签：success / warning / danger / info 对应 3.3 节语义，禁止用颜色自定义混用。
4. el-menu 暗色模式参数由 `AsideList.vue` 统一管理（bg `var(--ds-night)` / text `var(--ds-night-text)` / active `#FFFFFF`，切换主题时自动跟色），新增菜单不要单独传色。
5. 图标交互色：默认 `@color-icon-normal`，hover `@ds-primary-hover`，选中 `@ds-primary`。
6. 运行时换肤：`utils/theme-style.ts` 会内联覆盖 `--el-color-primary` 色阶，业务侧不要写死主色色值，否则换肤失效。

## 9. 三轨 Token 引用速查

| 场景                  | 写法         | 示例                                                              |
| --------------------- | ------------ | ----------------------------------------------------------------- |
| .vue / .less 样式     | LESS 变量    | `color: @ds-primary;`                                             |
| 任意 CSS / 内联 style | CSS 变量     | `color: var(--ds-primary);`                                       |
| Element 组件语义      | Element 变量 | `var(--el-color-primary)`                                         |
| Tailwind class        | ds 命名空间  | `text-ds-primary`、`bg-ds-night`、`rounded-ds-lg`、`shadow-ds-md` |
| JS/TS/SVG/canvas      | 字面量色值   | `'#4C5EDB'`                                                       |

> Tailwind 扩展见 `tailwind.config.js` 的 `colors.ds` / `borderRadius` / `boxShadow` / `fontFamily.ds` / `transitionDuration.ds`；修改后需重新生成 output.css。

## 10. 编码红线（Code Review 检查项）

1. **禁止硬编码色值**：不允许 `#409eff`、`aqua`、`skyblue`、`#4395ff` 等；新颜色必须先在 `theme.less`（编译期 token）或 `theme-presets.ts`（运行时预设数据）登记。
2. **禁止绕过加载顺序**：覆盖 `--el-*` 变量只能写在 `src/assets/styles/theme/element-theme.less`（位于 element-plus dist css 之后加载），不要在 global.less 或业务组件中覆盖全局 Element 变量。
3. **SVG 属性不写 var()**：`stroke="#..."` 属性值用字面量，只有 CSS 声明可用 var()。
4. **动效时长**：不得出现 >400ms 的界面过渡（骨架屏/艺术展示页除外）。
5. **暗底可读性**：暗底（星夜色）上的文本对比度不低于 4.5:1。
6. **验收入口**：`grep -ri "#409eff\|aqua\|skyblue" src/` 除以下合法登记处外应为 0 结果——`src/config/theme-presets.ts`（晴空蓝预设主色，运行时数据源）、`src/components/layout/LayoutSettingsDrawer.vue`（取色器预定义色列表）、`views/case/demos/skystar` 特效展示页豁免。

## 11. 主题文件索引

| 文件                                                                | 职责                                                                                                                             |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `src/assets/styles/theme/theme.less`                                | **唯一**色彩/圆角/阴影/字体/动效 token 定义 + `:root` CSS 变量输出                                                               |
| `src/assets/styles/theme/element-theme.less`                        | Element Plus `--el-*` 变量基线（主色阶/功能色/圆角/阴影/字体），在 `src/plugins/index.ts` 中于 dist css 之后加载                 |
| `src/config/theme-presets.ts`                                       | **主题预设单一来源**：11 套预设（经典 8 + 莫兰迪 3，含 group 分组）、默认/自定义 key、查找函数                                   |
| `src/utils/theme-style.ts`                                          | 运行时换肤：`applyThemePreset` 预设精调应用 / `handleThemeStyle` 自定义色算法派生，内联覆盖 `--el-color-primary` 色阶与 `--ds-*` |
| `src/config/layout-defaults.ts` + `src/stores/layout-settings.ts`   | 布局默认值与持久化（含 `themeName` 主题标识，旧数据按色值兼容回填）                                                              |
| `tailwind.config.js`                                                | Tailwind ds 命名空间映射                                                                                                         |
| `src/assets/styles/g.less` / `u.less` / `m.less` / `nprogress.less` | 全局布局/工具/模块/进度条样式（全部引用 token）                                                                                  |
| `src/components/ai-assistant/ai-variables.less`                     | AI 助手专属 token（已对齐主色 `#4C5EDB`，渐变保留品牌靛蓝系）                                                                    |

## 12. 版本记录

| 版本 | 日期       | 变更                                                                                                                                                                                                                                            |
| ---- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v1.3 | 2026-09-11 | 新增莫兰迪系列 3 套预设（雾霭蓝 `#6E8B9E` / 鼠尾草绿 `#90A47E` / 豆沙粉 `#B5838D`），预设达 11 套；预设体系引入 group 分组，抽屉按「经典 / 莫兰迪」两组渲染；补莫兰迪设计约束（低饱和灰调、禁算法派生色阶、灰调夜色）；取色器预定义色增至 12 个 |
| v1.2 | 2026-09-11 | 新增「晴空蓝」预设（`#409EFF`，Element 官方色阶 + 深海军蓝夜色），预设达 8 套；文档完善：标题版本同步、3.1/3.2 标注默认主题基线、红线第 1/6 条补充 `theme-presets.ts` 合法登记处、8.4 菜单参数改运行时变量写法                                  |
| v1.1 | 2026-09-11 | 多主题换肤：新增 7 套主题预设（3.6）；设置抽屉新增「主题配色」卡片切换 + 自定义色；暗色侧栏全链路改 `var(--ds-night)` 运行时变量；`themeName` 持久化与旧数据兼容                                                                                |
| v1.0 | 2026-09-11 | 首版发布：确立「星夜靛蓝」主题；建立三轨 token 体系；完成全站硬编码色清理（#409eff 75 处、aqua/skyblue、旧暗侧栏色等）                                                                                                                          |
