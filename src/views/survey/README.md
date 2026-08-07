# 问卷管理模块

管理端路径：`/home/survey`  
公开填写：`/survey/fill/:shareCode`  
成绩页：`/survey/result/:responseId`

## 能力概览

- 问卷 CRUD / 设计器 / 发布生命周期 / 分享（链接、二维码、iframe、站内邀请）
- 16 种题型注册表（基础 + 高级），逻辑编排，断点续填，防作弊
- 统计分析（概览、单题、交叉、质量）、导出（同步/异步）
- 评分模式、阅卷、排行、证书结果
- 模板库、个人题库

## 扩展点（PRD v2.0 未落地）

- **AI 智能出题**：可在编辑器接入 `services/ai-assistant`，向题型注册表注入生成结果
- **多人协作编辑**：需问卷级锁 / OT 或 CRDT，当前为单人编辑
- **定时邮件报表**：依赖外部邮件通道，统计侧已有自定义报表配置可复用

## 权限码

`survey:questionnaire:list|create|update|delete|publish|analyze|export|template|questionBank|grading`
