# AI语音助手 — 产品需求设计文档（PRD）

> **项目**: drawStars (Vue3)
> **版本**: v1.0.1
> **日期**: 2026-10-26
> **状态**: 评审修订稿（经 10 分制评审后补齐量化目标与基础信息；现有能力按代码事实对齐并标注「现状」；本期新增能力标注 P0/P1/P2 与目标态；遗留偏差标注「待对齐」）
> **关联规范**: `需求文档输出规范.md`
> **关联系统**: 用户体系、RBAC 权限管理体系（`权限管理体系_PRD_v1.0.md`）、日志管理体系（`日志管理体系_PRD_v1.0.md`）、各业务域数据统计（积分/工作流/任务/问卷/日志）、移动端统一平台（`移动端统一平台_PRD_v1.0.md`，AI 助手移动形态在该 PRD 决策 D02 中结算）
> **阅读导引**: 产品 → 第一/二/十章；前端 → 第三/四章与第六章；后端 → 4.5~4.7 与第五/七章；测试 → 第二章角色矩阵、4.4.4、4.5 安全基线、附录 B/C

## 基础信息

| 字段 | 内容 |
| ---- | ---- |
| 项目级别 | 迭代级（单功能域新增，不涉及架构升级，随常规双周迭代交付） |
| 需求提出人 | TBD（诉求来源见 1.1：管理者「用嘴查数」诉求 + 语音助手名实差距） |
| 产品负责人（PM） | TBD |
| 前端负责人 | TBD |
| 后端负责人 | TBD |
| 测试负责人 | TBD |
| 设计师 | TBD（本期无独立设计稿：沿用现有 AI 助手面板设计语言，新增交互态见第三/四章） |
| 关联需求单 / tapd | TBD（本文件为唯一需求来源） |
| 关联原型 / 设计稿 | 无独立设计稿；以 `src/components/ai-assistant/` 现有交互与视觉为基线 |
| 期望联调时间 | v1.0 范围随首个双周迭代的迭代内联调（具体日期随迭代排期确定，TBD） |
| 期望上线时间 | v1.0 P0 范围（见十章版本规划）于迭代末上线；具体日期 TBD |

> 责任人字段为占位（TBD），人员认领后在下方修订记录中登记；联调/上线的具体日期随迭代排期落定后回填本表。

## 修订记录

| 版本 | 日期 | 修改人 | 描述 |
| ---- | ---- | ---- | ---- |
| v1.0 | 2026-10-26 | TBD | 初稿：现状按代码事实对齐；新增语音闭环 F01~F04 与权限问数 F05~F07；权限码/错误码/埋点清单成文 |
| v1.0.1 | 2026-10-26 | TBD | 评审修订：① 头部补基础信息/修订记录表；② 1.1 补数据佐证口径声明；③ 1.3 设计目标表补「量化指标与验收口径」列与评估方法；④ 修复 1.2 盘点表模块编号笔误（TTS F03 / 语音消息 F04） |

---

## 一、需求背景与目标

### 1.1 背景

drawStars 平台已于 v2 上线**AI 助手**（`src/components/ai-assistant/`，登录后由 `App.vue` 常驻挂载悬浮球 + 720×520 对话面板），支持文本流式对话、多会话管理、文件上传与能力卡片回复。但以「AI **语音**助手」为标准衡量，当前能力存在**名实差距**：

- **语音仅有单向输入**：语音输入基于浏览器 Web Speech API（`src/composables/useSpeechRecognition.ts`，`zh-CN`、单句模式），识别完成即直接发送（`ChatInput` 组件 `toggleVoice()`），中间态粗糙
- **「听」的能力完全缺失**：助手回复无任何 TTS 播报；`voice` 类型消息不能播放（`payload.audioUrl` 恒为 `''`，气泡仅展示波形 + 时长 + 转写）
- **后端语音链路未接通**：`src/api/ai-assistant.ts` 中 `voiceToText()` 在真实模式（`VITE_AI_ASSISTANT_MOCK=false`）下仍调用 mock，返回随机假文案（「上海今天天气怎么样」等 4 条样例轮询）
- **降级策略失真**：浏览器不支持 Web Speech 时，`useSpeechRecognition` 静默降级为 mock 假文本，用户「说了话」实际发送的却是系统随机文案，体验硬伤
- **参考实现闲置**：v1「彗星」政务汇报助手（`src/components/assistant/`）已是全仓无引用的死代码，但包含**全仓唯一的 TTS 实现**（`speechSynthesis` 增量播报，存在 `rate = 3` 异常速率疑似 bug）与 **MediaRecorder 录音上传**降级方案，可作为本期参考实现素材

同时，平台存在明确的**「用嘴查数」诉求**：管理者希望直接向助手提问获取业务数据（如「这月积分发了多少」「任务完成率前十的部门」）。现状仅有：

- `/api/mysqlApi/sql`（POST 裸 SQL 透传），**前端拼接、无权限校验、无只读约束**，仅适合 demo 演练，存在 SQL 注入与越权风险
- 各业务域分散的 statistics 接口（points/workflow/tasks/survey/logs），无统一问数入口

因此本期 PRD 承担两件事：**①补全语音「能听能说」闭环；②新建权限感知的数据问数（NL2SQL）网关**，让用户在权限范围内用自然语言直接查询数据库。

**数据佐证口径**：语音输入入口长期处于 Mock 演示态（`VITE_AI_ASSISTANT_MOCK`）、`/api/mysqlApi/sql` 仅限 demo 演练，二者均无生产埋点可引用，且此前未组织过用户调研，故本节问题严重性暂无量化数据，不做无依据估计。基线获取机制：v1.0 上线后依托附录 B 埋点（`module_open_ai_assistant`、`ai_voice_*`、`ai_query_*`）与 `ai_query_audit` 审计表，采集 **T0+30 日基线数据**（面板渗透率、语音入口使用率、问数使用量与拒绝构成），回填本节并作为 1.3 量化目标修定与 v1.1 排期的唯一数据依据。

### 1.2 现状盘点（能力基线）

| 能力 | v2 现役模块 | v1 遗留模块（死代码） | 结论 |
| ---- | ---- | ---- | ---- |
| 语音输入（识别为文字） | ✅ Web Speech API 封装，不支持时降级假文本 | ✅ MediaRecorder 录音 → 服务端转写（降级链路） | v2 为主链路，v1 方案留作服务端 ASR 参考 |
| 语音消息存档/播放 | ❌ `audioUrl` 恒空、无播放逻辑 | — | 本期补全（F04） |
| TTS 播报（说出来） | ❌ 完全缺失 | ✅ `speechSynthesis` 增量播报（`rate=3` bug 待修） | 本期补全（F03），v1 实现为参考 |
| 服务端 ASR 接口 | ❌ 前端 `voiceToText()` 真实模式仍走 mock | 预留 speechRecognition 上传形态 | 后端待建（F02，v1.1+） |
| 数据问数 | ❌（仅 demo 级 `/mysqlApi/sql` 裸 SQL） | — | 本期新建（F05~F07） |
| 文本流式对话/会话管理/文件上传 | ✅ SSE 六事件协议 + Mock 双轨 | — | 现状保留（F08），作为问数链路载体 |
| 权限体系 | ✅ RBAC 三段式权限码 + 三层拦截（路由守卫/`v-permission`/服务端 Guard）+ `super_admin` 兜底 | — | 问数权限模型直接复用（4.5.2） |

### 1.3 设计目标

| 目标 | 说明 | 量化指标与验收口径 |
| ---- | ---- | ---- |
| **名副其实** | 补齐 TTS 播报与语音消息播放使「语音助手」可听可说；禁止假文本降级 | TTS 手动播报触发后 ≤1s 出声（8 章）；unsupported 环境「假文本降级」出现次数 = **0**（零容忍，入口隐藏策略见 D04）；TTS 引擎不可用环境播报按钮隐藏率 100%（埋点 `module_open_ai_tts_unavailable` 佐证） |
| **所说即所查** | 自然语言问数直达数据库，无需写 SQL、无需进报表页 | T0+30 日内问数活跃使用者 ≥20 人、`ai_query_submit` ≥100 次（基线验证型目标，用于确认「有真实使用」，非 KPI 摊派）；问数端到端 P95 ≤5s；表格 200 行渲染 ≤500ms（均见 8 章）；空结果/拒绝场景 100% 有明确话术，无「无响应」裸状态 |
| **权限即边界** | 问数范围=当前用户权限范围：功能权限码控制入口，数据集权限控制可查域，越权即拒且有明确文案 | 越权问数 100% 返回 `QUERY_PERM_DENIED` 并落审计 `status=denied`（5.4）；功能权限与数据集权限缺失两类话术可区分（4.5.2）；越权专项测试用例通过率 100% |
| **安全可控** | 只读网关：白名单数据集、只读 SQL 校验、强制行数限制、全程审计；用户问句永不拼接进 SQL | 词法校验器攻击用例库（注入/多语句/写操作/注释/白名单外表/敏感字段，见 4.5.4）拦截率 **100%**（零容忍）；SQL 原文仅存 `ai_query_audit`，不出现在任何前端响应；执行 SQL 100% 携带强制 LIMIT 200 |
| **平滑接入** | 问数能力作为统一 capability 接入现有架构，复用 SSE 协议与 table/chart 消息载体，前端改动最小化 | SSE 事件类型新增数 = **0**（7.4 六事件不动）；F08 通用对话零改动回归用例通过率 100%；Mock 双轨下问数与语音均可独立演示出图（开关说明见附录 A「Mock 双轨」） |
| **可观测** | 语音与问数全链路埋点对接日志管理体系，问数审计可查 | 附录 B 埋点全量上报、`ai_query_*` 事件与 `ai_query_audit` 记录一一对应（5.4）；T0+30 日输出基线报告并回填 1.1（基线即本表 30 日目标的度量来源） |

**评估方法与复盘口径**：以 v1.0 上线日为 T0，于 T0+30 依托埋点与 `ai_query_audit` 出验收报告。上表指标分两类：**零容忍型**（假文本降级、攻击拦截率、越权拒绝、SSE 零新增、降级行为）出现任何非 0/非 100% 值即触发专项复盘，不参与达标率折算；**基线验证型**（活跃使用者、使用量、性能 P95）未达标不阻塞 v1.0 验收，但触发 v1.1 阈值修定与排期复核。

### 1.4 不在本期范围

| 项 | 说明 |
| ---- | ---- |
| 声纹识别 / 多说话人区分、唤醒词 | 不做；入口仍是面板点击 |
| 语音实时通话（边说边答的 duplex 模式） | 不做；仍是「录音/识别 → 发送 → 回复」单工模式 |
| 后端 TTS 引擎（服务器合成音频流） | v1.0 仅用浏览器本地 `speechSynthesis`；后端引擎 v1.2+（决策 D03） |
| 任意 SQL 开放执行 | 明确不做；`/api/mysqlApi/sql` 的裸 SQL 透传问题另行整改，不作为问数通道，本期仅设计只读网关 |
| v1「彗星」政务汇报助手复活 | 不做；该目录按死代码处置，仅吸收参考实现（9.4） |
| 移动端语音助手形态 | 随《移动端统一平台 PRD》决策 D02 结算，本期不做移动端适配 |
| 问数结果订阅 / 定时报表推送 | 预留（v2.0+） |

---

## 二、用户角色

### 2.1 角色与诉求

| 角色 | 说明 | 核心诉求 | 权限依赖 |
| ---- | ---- | ---- | ---- |
| 未授权用户 | 管理员未授予助手功能权限 | 助手不可见（悬浮球隐藏） | 无 `system:ai-assistant:use` |
| 授权用户 | 普通使用者 | 文本/语音对话、能力卡片 | `system:ai-assistant:use`（+`…:voice` 可用语音输入） |
| 问数用户 | 数据消费型：管理者/运营 | 「用嘴查数」：自然语言问业务数据、表格/图表返回 | `system:ai-assistant:use` + `system:ai-assistant:query` + 目标数据集业务权限（如 `system:points:list`） |
| 系统管理员 | 权限与审计责任人 | 分配助手权限码、检索问数审计 | 现有管理员体系；`system:ai-assistant:audit`（v1.2+ 审计页） |
| `super_admin` | 超级管理员 | 兜底全权限（含全部数据集） | 硬编码全权限 |

### 2.2 权限码与入口控制方式

- 权限码命名遵循现有 RBAC 三段式 `{域}:{资源}:{动作}`，本模块新增 4 个权限码（详见附录 B）；**问数的数据范围控制复用各业务域既有权限码**，不新造数据权限体系
- 控制方式三层（与平台一致）：
  1. **入口层**：悬浮球/面板渲染前校验 `use` 权限（现有 `App.vue` 登录后直接挂载，改造点见 4.8，标注 target）
  2. **指令层**：面板内麦克风按钮、问数快捷提示等用 `v-permission` 控制（无权隐藏或置灰 + tooltip）
  3. **服务端层**：每个 `/api/ai-assistant/*` 端点 Guard 校验权限码，前端缺失不构成越权
- `super_admin` 及持有对应权限码的角色可全部放行

---

## 三、功能模块总览

```text
AI语音助手（ai-assistant）
│
├─ F01 语音输入 · 浏览器原生（Web Speech API）          [现状保留 + P0 缺陷修复]
├─ F02 语音输入 · 录音上传（服务端 ASR 降级链路）         [P1（v1.1+）]
├─ F03 TTS 播报（回复可听，浏览器引擎先行）              [P0 手动 / P1 流式增量与自动播报]
├─ F04 语音消息管理（存档 / 播放）                       [P1（v1.1+）]
├─ F05 权限感知数据问数（NL2SQL 网关）★ 本期核心         [P0 新增]
│   ├─ F05.1 问数意图识别与数据集路由
│   ├─ F05.2 权限校验（功能权限 + 数据集权限）
│   ├─ F05.3 NL2SQL 生成与只读安全基线
│   └─ F05.4 问数风控（限流 / 超时 / 兜底文案）
├─ F06 问数结果渲染（表格 / 图表 / 导出）                [P0 表格 / P1 智能图表与导出]
├─ F07 问数审计与可观测（审计日志 + 埋点）               [P0 落库 / P2（v1.2+）审计查询页]
├─ F08 通用对话与会话管理（现有基线，零改动承诺项）        [现状]
└─ F09 设置与偏好（播报开关 / 输入方式）                  [P1（v1.1+），本期仅规划]
```

> 模块编号与第四章小节一一对应；「现状」= 已上线行为按代码事实记录，「P0」= 本期交付，「P1/P2」按下章版本规划排期。

---

## 四、各模块详细设计

### 4.1 F01 语音输入 · 浏览器原生（Web Speech API）

#### 4.1.1 现状（按代码事实）

| 项 | 现状 | 事实依据 |
| ---- | ---- | ---- |
| 入口交互 | ChatInput 麦克风按钮，点击开始/再次点击结束，识别完成**立即发送**（无转写确认中间态） | `ChatInput.vue` `toggleVoice()` |
| 引擎 | `window.SpeechRecognition / webkitSpeechRecognition`，`lang='zh-CN'`、`continuous=false`、`interimResults=true` | `useSpeechRecognition.ts` |
| 不支持降级 | **静默注入 mock 假文本**（随机 4 条样例之一，延迟 300ms） | `useSpeechRecognition.ts` → `mockVoiceToText()` |
| 错误处理 | `onerror` 直接 reject 原始错误串，无统一错误码与用户文案 | 同上 |

#### 4.1.2 目标态规则

| 功能 | 规则 | 优先级 |
| ---- | ---- | ---- |
| 按钮状态机 | `idle → listening → recognizing → sending`；`listening` 时麦克风呼吸动画 + 中间态文本实时回显（复用 `interimText`） | 现状保留 |
| 不支持降级（修复项） | `supported=false` 时**隐藏麦克风入口**（而非注入假文本），并在输入框 tooltip 引导「当前浏览器暂不支持语音输入」；Mock 演示模式下保留假文本以便走查（`VITE_AI_ASSISTANT_MOCK` 开启时） | **P0** |
| 识别语言 | 固定 `zh-CN`；可识别中文带英文数字混排 | 现状保留 |
| 单次时长上限 | 持续收音 60s 自动截断并发送已识别内容（现状无上限，浏览器自行断句后有 `onend` 兜底 resolve） | P1 |
| 错误码统一 | Web Speech 原始错误映射为平台错误码（附录 B）并给出用户文案，`aborted` 视为用户主动取消（静默） | **P0** |

#### 4.1.3 错误映射表

| Web Speech 原始 error | 平台错误码 | 用户文案（反馈在消息流内，非崩溃式提示） |
| ---- | ---- | ---- |
| `not-allowed` | `MIC_PERMISSION_DENIED` | 「麦克风权限被拒绝，请在浏览器地址栏允许后重试」 |
| `audio-capture` | `MIC_UNAVAILABLE` | 「未检测到可用麦克风设备」 |
| `no-speech` | `ASR_NO_SPEECH` | 「没有听到内容，请重新按住说话」 |
| `network` | `ASR_NETWORK` | 「语音识别服务网络异常，请稍后重试」 |
| `aborted` | （不计错误） | 静默取消 |

### 4.2 F02 语音输入 · 录音上传（服务端 ASR）

**定位**：Web Speech API 不可用（如 Firefox、部分移动端）时的**服务端转写降级链路**，P1（v1.1+）。参考 v1 遗留模块的 MediaRecorder 实现，修正其录音状态复位缺陷。

| 功能 | 规则 |
| ---- | ---- |
| 触发条件 | ① `supported=false`；② Web Speech 返回 `ASR_NETWORK` 连续 2 次。用户可在设置中手动指定「录音上传」模式（F09） |
| 采集 | `getUserMedia({audio:true})` + `MediaRecorder`，编码 `audio/webm;codecs=opus`（必要时降级 `audio/ogg` / `audio/mp4`，按 `MediaRecorder.isTypeSupported`） |
| 约束 | 单条 ≤60s；文件 ≤5MB；超限自动截断上传 |
| 转写 | `POST /api/ai-assistant/voice/asr`（FormData）→ `{ transcript, durationSec }`；超时 15s 返回 `ASR_TIMEOUT` |
| 隐私 | 音频仅用于转写；转写完成后默认不落盘（落盘仅 F04 消息存档链路） |
| 兜底 | 服务端转写失败 → 提示改用文本输入，不静默重试 |

### 4.3 F03 TTS 播报（回复可听）

**现状**：v2 完全无 TTS；v1 死代码含 `speechSynthesis` 增量播报实现，但 `utterance.rate = 3` 为异常速率（正常应约 `1.0`），实现时修正。

#### 4.3.1 v1.0（P0）：手动播报

| 功能 | 规则 |
| ---- | ---- |
| 入口 | `assistant` 文本类消息气泡 hover 工具条新增「播报」按钮（🔊）；点击整条播报 `content` 纯文本（剥离 rich/HTML 标签） |
| 引擎 | 浏览器 `speechSynthesis` 本地合成，`lang='zh-CN'`，`rate=1.0`，`pitch=1.0`（决策 D03） |
| 控制 | 播报中按钮态为「停止」；点击任意新的播报或发送消息时中断当前播报 |
| 不可用 | 浏览器无 `speechSynthesis` 或无可发音色时按钮隐藏，日志埋点 `module_open_ai_tts_unavailable`（不计错误） |
| 范围 | 仅播报文本类回复（`type='text'\|'rich'`）；table/chart/file/voice 消息提供数据摘要播报（如「共返回 12 行，最高为…」）P1 |

#### 4.3.2 v1.1+（P1）：流式增量播报与自动播报

- **增量播报**：SSE `delta` 事件按标点/换行分句缓冲，`speechSynthesis.speak` 队列追加，实现「边生成边朗读」（分句缓冲避免截断杂音）；`done` 后 flush 余量
- **自动播报开关**：设置项「回复自动播报」默认**关闭**（办公环境减少打扰），开启后回复完成自动触发播报；偏好持久化于现有 Pinia persist（key `drawstars-ai-assistant` UI 偏好段）

### 4.4 F04 语音消息管理

**现状**：`voice` 气泡展示波形图 + 时长 + 转写文本；`payload.audioUrl` 恒为 `''`，无任何播放逻辑。

| 功能 | 规则 | 优先级 |
| ---- | ---- | ---- |
| 转写展示 | 保留现状：气泡主位显示转写文本，辅以时长 | 现状保留 |
| 音频存档 | 浏览器原生识别成功后，如启用「保留语音原声」偏好（默认关），同步采集音频上传 `POST /api/ai-assistant/voice/message` 落盘，回填 `payload.audioUrl`；录音上传链路（F02）默认存档 | P1 |
| 播放 | 气泡波形区可点击：`Audio` 播放/暂停，波形按播放进度高亮；仅当 `audioUrl` 非空可用，否则波形不可点 | P1 |
| payload 扩展 | `AiVoicePayload` 新增 `asrSource?: 'web-speech' \| 'server'` 区分识别来源 | P1（类型先行 P0 预留） |
| 生命周期 | 会话删除 → 该会话音频随之删除（物理删除，不留副本） | P1 |
| 隐私边界 | 音频/转写仅本人会话可见；问数审计中的转写只落文本问句 | P1 |

### 4.5 F05 权限感知数据问数（NL2SQL 网关）★ 本期核心

#### 4.5.1 概述与定位

- 用户在对话框用自然语言提问业务数据（「这月积分发放总量是多少」），助手识别**问数意图**，在**数据库注册表白名单**内生成只读 SQL，经由网关校验执行后以表格/图表消息返回
- 问数能力注册为统一 capability（capabilityId `data-query`），与现有 weather/chart/table 等能力同机制接入 `registerAiCapability` 扩展点（Mock 侧同构，真实侧由服务端意图路由实现）
- **明确替代关系**：问数网关上线后，AI 助手侧不再使用 `/api/mysqlApi/sql` 裸 SQL 端点；该端点的整改另行立项（不在本期）

#### 4.5.2 权限模型（两层）

##### 第一层 · 功能权限（问「能不能问数」）

| 权限码 | 控制点 | 缺失表现 |
| ---- | ---- | ---- |
| `system:ai-assistant:use` | 悬浮球/面板入口 | 助手不可见 |
| `system:ai-assistant:query` | 问数意图路由 + 服务端 `/data-query` Guard | 助手回复固定文案「当前账号未开通数据问数权限，请联系管理员」；输入框无问数快捷引导 |

##### 第二层 · 数据集权限（问「能查哪个域」）

| 规则 | 说明 |
| ---- | ---- |
| 数据集注册表 | 每个可问数业务域注册为一个**数据集**（dataset），绑定：允许的表/字段白名单、**前置业务权限码**（复用既有权限，如积分数据集绑定 `system:points:list`）、敏感字段清单 |
| 校验时机 | NL2SQL 生成前做数据集路由：按问句涉及域命中数据集 → 校验用户是否持有该数据集前置权限码 → 未持有则拒绝并说明「您暂无积分数据查看权限」 |
| 多数据集追问 | 问句跨 ≥2 数据集时，逐一校验；任一无权则整句拒绝（不降级出部分结果，避免误导） |
| super_admin | 兜底全部数据集 |
| 权限快照 | 审计记录落库时保存当时用户权限码清单，保证事后可追溯（权限变更不影响历史审计语义） |

**首版数据集清单（P0，5 个域）**：

| dataset code | 数据集 | 主要覆盖 | 前置业务权限码（示例） |
| ---- | ---- | ---- | ---- |
| points | 积分 | 发放/消耗/余额统计、排行 | `system:points:list` |
| workflow | 工作流 | 审批流转量、节点耗时 | `system:workflow:list` |
| tasks | 任务 | 任务完成率、超期分布 | `system:tasks:list` |
| survey | 问卷 | 提交量、回收分布 | `system:survey:list` |
| logs | 操作日志 | 登录/操作行为统计 | `system:logs:list` |

> 前置权限码写法须与权限管理体系实际登记一致，上表为建议值，落地前与 RBAC 字典对齐（待对齐项）。

#### 4.5.3 交互流程与状态机

```text
[用户提问]
    v
[1 意图识别] ──非问数──> 走 F08 通用对话链路
    |问数
    v
[2 数据集路由]──未命中──> 助手澄清「想查哪类数据？积分/任务/…」（推荐数据集chips）
    |命中
    v
[3 数据集权限校验]──无权──> 拒绝文案（含缺失权限说明）→ 审计(status=denied) → 结束
    |有权限
    v
[4 NL2SQL 生成]（问句→LLM→候选SQL，见 4.5.4 安全基线）
    |生成失败/超时 ──> 兜底文案 + 审计(status=fail)
    v
[5 SQL 校验器]──校验拒绝──> 兜底文案（提示换个问法）+ 审计(status=rejected)
    |通过
    v
[6 只读执行]──超时/DB错误──> 兜底文案 + 审计(status=timeout/fail)
    |结果
    v
[7 结果装载] AiMessage(type=table|chart) → SSE done
    v
[8 审计落库](status=success, rows, duration_ms) + 埋点
```

体验细节：

- 流式提示复用现有 `thinkingStart/thinkingDelta` 事件输出过程文案（「正在检索积分数据集…」「已生成查询语句，正在执行」），`thinking` 气泡折叠展示
- 回复消息默认**表格**；时间序列类问句命中自动出**图表**（智能选卡规则 v1.1，见 4.6）
- 失败必须对用户可解释：按错误码给固定话术（附录 B），绝不裸抛堆栈

#### 4.5.4 安全基线（对照 `/mysqlApi/sql` 风险教训）★ 测试重点

| # | 风险 | 基线规则 |
| ---- | ---- | ---- |
| 1 | SQL 注入 | **用户问句永不拼进 SQL 字符串**：问句以独立参数传入 LLM；生成 SQL 后先过校验器再执行；校验器实现 SQL 词法检查（首词必须 `SELECT`/`WITH`，出现 `;` 除尾部分号外拒绝，注释符 `--`/`/*` 拒绝，危险关键词（`INSERT/UPDATE/DELETE/DROP/ALTER/TRUNCATE/GRANT/CALL/LOAD_FILE/INTO OUTFILE…`）以词边界匹配拒绝 |
| 2 | 越权查库 | 只允许数据集注册表内地表/字段；跨表 JOIN 双表都必须在白名单内；不在白名单的表 → `QUERY_DATASET_NOT_FOUND` 拒绝 |
| 3 | 大结果拖库 | 强制 LIMIT：生成 SQL 无 LIMIT 自动注入 `LIMIT 200`；已有 LIMIT>200 改写为 200；**单次结果行数 ≤200**，超限提示缩小条件范围 |
| 4 | 长事务阻塞 | 仅只读连接池执行；SQL 级超时 5s；查询级超时 8s |
| 5 | 越权数据可见 | 行级过滤依赖前置业务权限码语义；本期不做行级条件注入（v2.0 随数据权限引擎演进），首版以「域级可见/不可见」为边界 |
| 6 | 恶意刷量 | 限流：每用户 10 次/分钟、200 次/天；超限 `RATE_LIMITED` 并提示「稍后再试」 |
| 7 | 敏感信息 | 数据集注册表 `sensitiveFields`（如手机号/密码哈希）禁止出现在 SELECT 列；确需统计时仅允许聚合（v1.1+ 支持聚合白名单） |
| 8 | 审计缺失 | 全量落 `ai_query_audit`（4.5.5）+ 埋点，含 permission 快照与生成 SQL 原文 |

#### 4.5.5 审计与埋点

| 数据 | 归属 |
| ---- | ---- |
| `ai_query_audit` 表全量落库（成功也记） | 4.5.4-8；字段见 5.4 |
| 埋点：`module_open_ai_query` / `ai_query_submit` / `ai_query_success` / `ai_query_deny` / `ai_query_fail`（对接日志管理体系命名规范） | 附录 B |

### 4.6 F06 问数结果渲染

| 功能 | 规则 | 优先级 |
| ---- | ---- | ---- |
| 表格默认 | 结果以 `AiMessage(type='table')` 返回，payload 走现有 `AiTablePayload`（`columns[{prop,label}] + rows`）；行数 ≤200；气泡内最大高度滚动 | **P0** |
| 图表 | 时间序列/趋势类问数命中（自动判断规则 v1.1）返回 `AiChartPayload`（ECharts option）；用户可在表格/图表间切换查看 | P1（v1.1） |
| 空结果 | 明确话术「未查询到符合条件的数据」并附查询条件回显 | P0 |
| 答案自述 | 表格上方以一句话给出直接答案（「本月积分发放共计 12,340 分」），表格为佐证明细 | P0 |
| 导出 | 表格导出 CSV（本地生成，不落盘） | P1 |
| 超行数 | 结果 >200 行：「已返回前 200 行，可缩小时间范围后追问」 | P0 |

### 4.7 F07 问数审计查询（管理侧查询页）

| 功能 | 规则 | 优先级 |
| ---- | ---- | ---- |
| 审计落库 | 见 4.5.5；v1.0 即上线，前端无界面，可经 SQL/运维通道查询 | **P0** |
| 审计查询页 | 管理端新增页面（建议 `system:ai-assistant:audit` 权限码）：按用户/时间/数据集/状态筛选，展示问句、生成 SQL、行数、耗时；只读 | P2（v1.2+） |
| 风险提示 | 管理端对 `status=rejected/denied` 高频用户给出标记（不自动封禁） | P2 |

### 4.8 F08 通用对话与会话管理（现状基线 · 零改动承诺项）

本期对以下现有能力**保持零改动**（问数/语音功能的载体）：

| 能力 | 现状事实（以代码为准） |
| ---- | ---- |
| 入口 | `App.vue` 登录后常驻挂载 `AiAssistantHost`；悬浮球 58px 可拖拽（`useBoundaryDrag`）；面板 720×520，含 `PanelToolbar + ConversationSidebar + MessageList + ChatInput` |
| 会话 | 列表/新建/删除；`AiConversation`（title/group(today\|yesterday\|earlier)/preview/messageCount） |
| 消息类型 | `text / rich / voice / file / table / chart`（`AiMessage.type`），capability 卡片：weather / translate / chart / table / code / file / reminder / default |
| 流式协议 | `POST /api/ai-assistant/chat/stream`（fetch + ReadableStream 手动解析）事件：`userMessage / thinkingStart / thinkingDelta / delta / done / error` |
| 文件上传 | `POST /api/ai-assistant/upload`（FormData，返回 `fileId/name/mimeType/size/url/excerpt`） |
| Mock 双轨 | `VITE_AI_ASSISTANT_MOCK !== 'false'` 开启 Mock；`VITE_AI_ASSISTANT_STREAM !== 'false'` 开启流式 |
| 鉴权 | axios 拦截器注入 `accessToken` header；`TOKEN-FAIL` 跳登录 |

> 改动例外仅一处：悬浮球挂载增加 `use` 权限判断（2.2 入口层），功能行为不变。

### 4.9 F09 设置与偏好（本期仅规划）

| 设置项 | 默认 | 行为 | 版本 |
| ---- | ---- | ---- | ---- |
| 回复自动播报 | 关 | 开启后回复完成自动 TTS | v1.1+ |
| 语音输入方式 | 自动（Web Speech 优先） | `自动 / 仅录音上传` | v1.1+ |
| 保留语音原声 | 关 | 开启后语音消息落盘 `audioUrl` | v1.1+ |
| 转写确认 | 开 | 识别完成展示确认条，1.5s 倒计时自动发送，可编辑/取消 | v1.1+（决策 D02） |

持久化：复用现有 Pinia persist（key `drawstars-ai-assistant`）UI 偏好段；设置入口位于面板工具条齿轮（v1.1）。

---

## 五、核心数据模型

### 5.1 ER 示意

```text
sys_user 1 ──── N ai_conversation            （经登录态创建）
ai_conversation 1 ── N ai_message             （1:N）
ai_message 1 ── 0..1 payload(JSON)            （多态：voice/file/table/chart/thinking）
sys_user 1 ──── N ai_query_audit              （1:N，权限快照内嵌）
ai_dataset_registry 1 ── N ai_query_audit     （1:N，被执行数据集）
```

### 5.2 消息与会话（现有契约，保持稳定）

`ai_message` / `ai_conversation` 字段以 `src/types/ai-assistant.ts` 为前端契约（接口层 camelCase，库表可对齐 snake_case）：

| 实体 | 字段 | 类型 | 说明 |
| ---- | ---- | ---- | ---- |
| AiMessage | id / conversationId / role / type / content / payload? / createdAt / capabilityId? | string / string / `user\|assistant\|system` / `text\|rich\|voice\|file\|table\|chart` / string / JSON / ISO string / string | 问数结果即 `type='table'\|'chart'` + payload |
| AiConversation | id / title / group / preview / updatedAt / messageCount | — / — | `group`: `today\|yesterday\|earlier` |

### 5.3 payload JSON 约定（现有 + 扩展点）

```jsonc
// voice（现有 + v1.1 扩展 asrSource）
{ "durationSec": 12, "transcript": "这月积分发放多少", "audioUrl": "", "asrSource": "web-speech | server" }
// table（问数结果主载体，现有不变）
{ "columns": [{ "prop": "month", "label": "月份" }], "rows": [{ "month": "2026-10", "total": 12340 }] }
// chart（问数图表载体，现有不变）
{ "option": { /* ECharts option */ }, "height": 280 }
```

### 5.4 ai_query_audit（新增 P0）

| 字段 | 类型 | 说明 |
| ---- | ---- | ---- |
| id | bigint PK | |
| user_id / user_name | bigint / varchar | 执行者 |
| permission_codes | json | **当时权限快照**（4.5.2） |
| conversation_id | varchar | 关联会话（可回放上下文） |
| question | text | 用户问句原文（语音问数为转写文本） |
| dataset_code | varchar | 命中数据集；未命中/澄清阶段记 `none` |
| generated_sql | text | 生成并执行的 SQL 原文（audit 专用，别处不可见） |
| status | varchar | `success / denied / rejected / timeout / fail` |
| error_code | varchar | 平台错误码（附录 B），可空 |
| rows | int | 返回行数（≤200） |
| duration_ms | int | 端到端耗时 |
| created_at | datetime | |

### 5.5 ai_dataset_registry（新增 P0，服务端配置表）

| 字段 | 类型 | 说明 |
| ---- | ---- | ---- |
| code | varchar PK | `points` / `workflow` / `tasks` / `survey` / `logs` |
| label | varchar | 展示名（问数澄清 chips 使用） |
| allowed_tables | json | 允许查询的表白名单（JOIN 双表校验依据） |
| required_permission | varchar | 前置业务权限码 |
| sensitive_fields | json | 禁 select 直出的字段 |
| enabled | boolean | 数据集开关（下线只需关停，不删数据） |
| description | text | 供 LLM 路由与 NL2SQL prompt 使用的数据字典摘要 |
| updated_at | datetime | |

---

## 六、页面结构

### 6.1 挂载与路由规划

助手为**全局常驻组件（非路由页）**；管理端本期**无新增路由**，v1.2+ 预留审计页。

```text
（非路由）App.vue
└─ AiAssistantHost                      ← v-permission: system:ai-assistant:use（目标态）
   ├─ AiAssistantFab                    悬浮球（可拖拽）
   └─ AiAssistantPanel                  面板
      ├─ PanelToolbar                   新建/关闭/清空；+播报态指示（可选）
      ├─ ConversationSidebar            会话列表
      ├─ MessageList
      │  └─ MessageBubble               工具条 +🔊播报（F03）；voice 气泡可点播放（F04）；table/chart 气泡（F06）
      └─ ChatInput                      麦克风（F01/F02）、问数引导提示（F05）

管理端（现有 RBAC 配置页内新增权限码，无新页面）
└─ 角色/权限配置    ×  system:ai-assistant:use|voice|query
（v1.2+ 预留）日志管理 → AI 问数审计    system:ai-assistant:audit
```

### 6.2 关键交互态

| 态 | 表现 |
| ---- | ---- |
| 无 `use` 权限 | 悬浮球完全隐藏（非置灰） |
| 无 `query` 权限 | 输入框正常可用；问数类问题收到固定引导文案；不显示问数快捷 chips |
| 无 `voice` 权限或浏览器不支持 | 麦克风按钮隐藏；tooltip 说明 |
| 问数进行中 | thinking 折叠气泡显示过程文案（复用现有样式） |
| 问数拒绝 | 文本气泡输出话术（附录 B），可附「联系管理员」引导 |

---

## 七、接口概要

> 鉴权：全部接口走 axios 拦截器 `accessToken` header；`TOKEN-FAIL` 跳登录。响应统一 `{ status, data }` 包装。
> **Mock 切换**：前端 `VITE_AI_ASSISTANT_MOCK=false` 走真实后端（当前默认 Mock）；`VITE_AI_ASSISTANT_STREAM=false` 关闭流式。当前 `.env` 未声明 `VITE_AI_ASSISTANT_STREAM`（配置缺口，待对齐，见 9.4）。新端点在 Mock 模式下由 `services/ai-assistant` 提供同构假数据（问数返回固定示例表格）。

### 7.1 会话与消息域（现有）

| 接口 | 方法 | 说明 |
| ---- | ---- | ---- |
| /api/ai-assistant/conversations | GET / POST | 会话列表 / 新建 |
| /api/ai-assistant/conversations/:id/messages | GET | 历史消息（问数结果消息原样回放） |
| /api/ai-assistant/conversations/:id | DELETE | 删除会话（联动音频 F04） |
| /api/ai-assistant/upload | POST | 文件上传（FormData），返回 `AiUploadResult` |
| /api/ai-assistant/chat | POST | 同步问答（含问数降级可用，P0 保留） |
| /api/ai-assistant/chat/stream | POST | SSE 流式问答；问数走此链路（决策 D05），结果以 `done` 携带 `AiMessage(type=table\|chart)` |

### 7.2 语音域（新增）

| 接口 | 方法 | 说明 | 权限 | 版本 |
| ---- | ---- | ---- | ---- | ---- |
| /api/ai-assistant/voice/asr | POST | FormData `audio`（webm/ogg/mp4，≤5MB，≤60s）→ `{ transcript, durationSec }`；错误码 `ASR_TIMEOUT` 等 | `…:voice` | v1.1+ |
| /api/ai-assistant/voice/message | POST | 语音消息存档，FormData `audio + conversationId` → `{ audioUrl }`（同步删除规则见 4.4） | `…:voice` | v1.1+ |

### 7.3 问数域（新增）

| 接口 | 方法 | 说明 | 权限 | 版本 |
| ---- | ---- | ---- | ---- | ---- |
| /api/ai-assistant/data-query | POST | 非流式问数：`{ conversationId, question }` → `{ assistantMessage(type=table\|chart), sqlAuditId }`；服务端全量校验（4.5.4） | `…:query` | **P0**（决策 D05：流式为主、非流式兜底同时交付） |
| /api/ai-assistant/query-audit | GET | 审计分页查询：筛选 userId/datasetCode/status/时间窗 | `…:audit` | P2（v1.2+） |

### 7.4 SSE 事件（现有六事件，问数复用不新增）

`userMessage / thinkingStart / thinkingDelta / delta / done / error` —— 问数过程文案走 `thinkingDelta`，最终表格/图表在 `done.assistantMessage` 返回。

---

## 八、非功能性需求

| 维度 | 要求 |
| ---- | ---- |
| 性能 | 语音识别首字 ≤1.5s（本地引擎）；TTS 手动播报触发后 ≤1s 出声（本地合成）；问数端到端 P95 ≤5s（含 LLM 生成、SQL 执行与装载）；表格 200 行渲染 ≤500ms |
| 并发 | 单用户 SSE 长连接 ≤2；问数 10 次/分钟、200 次/天；只读库执行超时 5s/单条 SQL |
| 兼容性 | 优先 Chrome/Edge（Web Speech 可用）；Firefox/Safari 的 Web Speech 不可用时隐藏语音入口，v1.1+ 由录音上传链路补足；面板在 1280 宽视口不遮挡主内容 |
| 数据安全 | 用户问句不拼接 SQL；白名单表；只读校验；强制 LIMIT 200；敏感字段不出 select；权限快照审计；SQL 原文仅存审计表 |
| 可用性 | Mock 双轨保持演进出图能力（问数/ASR 均有 Mock）；错误码统一大写下划线（附录 B）；不因语音/TTS 不可用阻塞文本对话主路径 |
| 隐私合规 | 录音默认不落盘；落盘会话删除即物理删除；转写文本随消息与会话同生命周期 |
| 可观测 | 埋点对接日志管理体系（附录 B 命名）；问数审计全量落库 |
| 国际化 | 本期仅 `zh-CN`（识别/播报/话术）；tts lang 与 asr lang 同步配置，预留枚举 |

---

## 九、扩展性设计

### 9.1 可插拔扩展点

| 扩展点 | 现状机制 | 本期动作 |
| ---- | ---- | ---- |
| 能力注册表 | `registerAiCapability(handler)`（`reply-engine.ts`） | 问数以 `capabilityId='data-query'` 接入；未来「查权限、查工单」等新能力同机制注册（每个 capability 一行注册器） |
| Asr / Tts Provider | 新抽象（接口 `recognize(audio)->text` / `speak(text)->void`） | v1.0 浏览器实现（Web Speech / speechSynthesis）；v1.1 接入服务端 ASR、v1.2+ 可替换后端 TTS 引擎，上层组件零改动 |
| 数据集注册表 | 新建 `ai_dataset_registry` 配置表 | 新业务域问数=「注册数据集 + 绑业务权限码 + 撰写数据字典描述」，无需改代码 |
| SSE 事件 | 六事件协议 | 问数不新增事件类型，扩展走 payload 多态，旧客户端可读旧消息 |
| 意图路由 | 服务端问数意图判定（规则+LLM 混合） | 路由策略服务端可配（问数开关、数据集开关即时生效） |

### 9.2 与现有系统集成

| 系统 | 集成方式 |
| ---- | ---- |
| 用户体系 | accessToken 鉴权、`TOKEN-FAIL` 跳登录（现有 axios 拦截器） |
| RBAC 权限 | 4 个新权限码挂入现有角色-权限配置；三层拦截复用；`super_admin` 兜底 |
| 日志管理 | 问数/语音埋点按 `module_open_*`/业务事件命名上报（附录 B） |
| 文件上传 | 语音存档复用上传域的存储与删除规则（F04） |
| 各业务域数据 | 数据集注册表以白名单方式授权只读库读取，**不经业务代码侵入** |
| 移动端平台 | 移动形态随《移动端统一平台 PRD》决策 D02 结算；若采用壳级浮层，F01~F06 能力原样可用（录音链路对移动浏览器更友好） |

### 9.3 决策记录

| # | 决策 | 结论 | 状态 |
| ---- | ---- | ---- | ---- |
| D01 | 助手入口是否权限化 | 新增 `system:ai-assistant:use`，上线时**默认授予全员角色**（保持现状体验），管理员可按角色回收；悬浮球 `v-permission` + 服务端 Guard 双保险 | 已确认 |
| D02 | 语音识别完成即发送 vs 转写确认 | v1.0 保持现状「识别完成即发送」；v1.1 引入转写确认条（默认开、可关闭、可编辑），避免误发 | 已确认 |
| D03 | TTS 引擎路径 | v1.0 浏览器 `speechSynthesis`（零成本、离线可用）；后端 TTS（多人音色/流式下发）v1.2+ 按发音质量诉求立项 | 已确认 |
| D04 | ASR 路径 | 浏览器 Web Speech 原生优先；`supported=false` 隐藏入口（**移除假文本降级**，Mock 演示模式除外）→1.1 录音上传服务端转写补全跨引擎可用性——引擎具体选型（第三方 API vs 自部署）随 v1.1 后端设计定 | 已确认 |
| D05 | 问数链路形态 | 流式为主（复用 `/chat/stream` 意图路由，thinking 输出过程）+ 非流式 `/data-query` 兜底同版本交付，确保无 SSE 环境可用 | 已确认 |
| D06 | NL2SQL 管控模式 | LLM 生成 + 词法白名单校验器（只读、白名单、强制 LIMIT、禁注释/多语句）；**不提供前端写 SQL 的任何通道** | 已确认 |
| 《移动端统一平台 PRD》D02 | AI 助手在移动端的形态（独立 H5 模块 vs 壳级浮层） | 该决策在移动端 PRD 名下结算，本 PRD 不预置 | 待定 |

### 9.4 代码现状治理建议（随本期技术债清单）

| 项 | 建议 |
| ---- | ---- |
| `src/components/assistant/`（v1 彗星死代码） | 本期实现 TTS/录音参考后，v1.1 删除该目录（含其依赖的 `rate=3` bug 一并消失） |
| `VITE_AI_ASSISTANT_STREAM` 未在 `.env` 声明 | 补充默认声明 `VITE_AI_ASSISTANT_STREAM=true`，并在 `.env.example` 注释说明 |
| 真实模式 `voiceToText()` 仍走 mock | 随 F02 v1.1 落地后修正为调用 `/voice/asr`；此前该函数仅 Mock 模式可达 |
| `/api/mysqlApi/sql` 裸 SQL 端点 | 问数网关上线后前端 AI 链路禁用；端点本身整改另行立项（越权/注入风险） |

---

## 十、版本规划

| 版本 | 范围 | 预计周期 |
| ---- | ---- | ---------- |
| v1.0（本期） | **F05 问数网关**（权限两层校验 + 数据集白名单 + 只读校验 + 限流 + 审计落库）· **F06 表格渲染**（答案自述 + table 载体）· **F03 TTS 手动播报**（speechSynthesis，rate 修正）· **F01 缺陷修复**（unsupported 隐藏入口、错误码映射）· 权限码 4 枚入 RBAC · audit P0 落库 · D01~D06 落定 | 1 个双周迭代（后端网关为主链路） |
| v1.1 | F02 服务端 ASR 录音上传 · F03 流式增量播报 + 自动播报开关 · F04 语音消息存档/播放 · F06 图表智能选卡 + CSV 导出 · F09 设置项 · 转写确认（D02 兑现）· v1 死代码清理 | 1 个双周迭代 |
| v1.2+ | 后端 TTS 引擎（D03）· F07 审计查询页 · 移动端语音助手（随《移动端统一平台 PRD》D02）· 多轮上下文追问（「那上周呢」口径保持）· 敏感字段聚合白名单 | 按 Q roadmap 排期 |

---

## 附录 A · 术语表

| 术语 | 英文/来源 | 一句话定义 |
| ---- | ---- | ---- |
| 语音转写 | ASR (Automatic Speech Recognition) | 把语音音频转成文字，前端现用 Web Speech API 本地识别 |
| 语音合成 | TTS (Text To Speech) | 把文本转成可听语音播报，本期用浏览器 speechSynthesis，速率参数修正为 1.0 |
| 问数 | NL2SQL Data Query | 用户以自然语言提问，系统生成受权限约束的只读 SQL 并回表/图 |
| 数据集 | Dataset Registry | 问数白名单的最小单元：一组允许查询的表 + 前置业务权限码 + 数据字典 |
| 只读网关 | Read-only Gateway | 问数唯一 SQL 执行通道，收口校验（只读/白名单/LIMIT/超时/审计） |
| 流式对话 | SSE (Server-Sent Events) | 服务端单向推送的对话协议，事件：userMessage/thinkingStart/thinkingDelta/delta/done/error |
| 能力卡片 | Capability | 助手回复的可视化载体（weather/chart/table 等），问数注册为 data-query |
| 三层拦截 | RBAC 前后端拦截 | 路由/组件层 v-permission + 服务端 Guard + super_admin 兜底 |
| 权限码 | Permission Code | 三段式 `{域}:{资源}:{动作}`，如 `system:ai-assistant:query` |
| Mock 双轨 | Mock switch | `VITE_AI_ASSISTANT_MOCK` / `VITE_AI_ASSISTANT_STREAM` 环境开关切换假数据/真实接口 |
| FAB | Floating Action Button | 登录后常驻的 58px 可拖拽悬浮球入口 |

## 附录 B · 权限码 / 错误码 / 埋点清单

### 权限码（新增 4 枚，写入 RBAC 字典）

| 权限码 | 动作 | 控制点 |
| ---- | ---- | ---- |
| `system:ai-assistant:use` | 使用助手（悬浮球/面板/对话） | 入口 + 全部端点 Guard |
| `system:ai-assistant:voice` | 语音输入 + 语音消息存档 | 麦克风入口、voice/* 端点 |
| `system:ai-assistant:query` | 数据问数 | 问数意图与 data-query 端点 |
| `system:ai-assistant:audit` | 问数审计查询页（v1.2+ 预留） | query-audit 端点 |

数据集权限不新增码，复用各业务域 `list` 权限（4.5.2 五域清单，落地前与 RBAC 字典对齐）。

### 错误码（统一大写下划线，供话术映射）

| 错误码 | 场景 |
| ---- | ---- |
| `MIC_PERMISSION_DENIED` / `MIC_UNAVAILABLE` | 设备/权限：拒绝麦克风、无设备 |
| `ASR_NO_SPEECH` / `ASR_NETWORK` / `ASR_TIMEOUT` | 识别：无声、网络、服务端超时 |
| `TTS_UNAVAILABLE` | 浏览器无可播报引擎 |
| `VOICE_AUDIO_TOO_LARGE` / `VOICE_AUDIO_TOO_LONG` | 语音文件 >5MB / >60s |
| `QUERY_PERM_DENIED` | 缺 `…:query` 功能权限**或**数据集业务权限（话术区分两者） |
| `QUERY_DATASET_NOT_FOUND` | 问句未命中/命中未注册数据集 |
| `NL2SQL_REJECTED` | 生成 SQL 未通过只读/白名单校验 |
| `QUERY_TIMEOUT` / `QUERY_DB_ERROR` | SQL 超时 / 执行异常 |
| `RATE_LIMITED` | 问数频控触发 |

### 埋点（对接日志管理体系命名规范）

| 埋点 | 触发 |
| ---- | ---- |
| `module_open_ai_assistant` | 面板首次展开 |
| `module_open_ai_tts_unavailable` | TTS 引擎不可用（隐藏播报按钮） |
| `ai_voice_start` / `ai_voice_success` / `ai_voice_fail`（附错误码） | 语音识别链路 |
| `ai_tts_play` / `ai_tts_stop` | 播报（v1.1 自动播报区分 `auto` 参数） |
| `ai_query_submit` / `ai_query_success` / `ai_query_deny` / `ai_query_fail`（附 dataset/错误码） | 问数全链路，与 `ai_query_audit` 一一对应 |

## 附录 C · 参考实现与竞品

| 来源 | 可借鉴点 |
| ---- | ---- |
| v1「彗星」助手（仓库内 `src/components/assistant/`，现状死代码） | ① speechSynthesis 增量播报的**分句+队列**实现思路（修正 rate 误传）；② MediaRecorder 录音→FormData 上传降级链路的完整源码 |
| § 问数风控基线 | 对照 `/api/mysqlApi/sql` 教训定标 : 注入、越权、无审计、无行限制 |
| 业界对话问数产品（钉钉 AI 助理、飞书智能伙伴） | 表格/图表双视图可切换 · **一句话答案 + 明细表格佐证** · 问句回显与生成耗时提示 · 结果导出（P1+） |
