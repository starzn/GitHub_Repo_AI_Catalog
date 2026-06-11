# GitHub Repo AI Catalog MVP Spec

## Why
当前仓库缺少可执行的产品规格，无法把“GitHub 仓库自动分析与归档”这一想法稳定落到实现层。需要先明确 MVP 的边界、核心流程和验收要求，确保后续开发聚焦在最小可用闭环。

## What Changes
- 新增 GitHub 仓库分析 MVP 规格，覆盖“输入 URL -> 拉取 GitHub 数据 -> AI 总结分类 -> 入库 -> 列表/详情展示”完整链路
- 新增前端页面范围：首页提交分析、仓库列表页、仓库详情页
- 新增后端能力范围：仓库 URL 校验、GitHub 数据抓取、AI 结构化分析、数据库持久化
- 新增数据模型范围：保存仓库基础信息、AI 总结、分类、标签、分析时间
- 新增非功能约束：MVP 不包含登录、多用户、私有仓库、批量导入、定时任务、向量搜索

## Impact
- Affected specs: GitHub 仓库解析、仓库分析流程、仓库数据持久化、仓库列表与详情展示
- Affected code: `app/page.tsx`、`app/repos/page.tsx`、`app/repos/[id]/page.tsx`、`app/api/repos/analyze/route.ts`、`app/api/repos/route.ts`、`app/api/repos/[id]/route.ts`、`components/AnalyzeRepoForm.tsx`、`components/RepoCard.tsx`、`components/RepoList.tsx`、`components/CategoryBadge.tsx`、`components/TagList.tsx`、`lib/github.ts`、`lib/ai.ts`、`lib/repo-analyzer.ts`、`lib/prisma.ts`、`lib/validators.ts`、`types/repo.ts`、`prisma/schema.prisma`、`.env.example`

## ADDED Requirements
### Requirement: 通过 GitHub URL 发起仓库分析
系统 SHALL 接收用户输入的 GitHub 仓库 URL，并完成 URL 解析、GitHub 数据拉取、README 获取、AI 总结分类和结果返回。

#### Scenario: 成功分析公开仓库
- **WHEN** 用户提交一个合法的 GitHub 仓库 URL
- **THEN** 系统正确解析 `owner/repo`
- **AND** 调用 GitHub API 获取仓库基础信息与 README
- **AND** 调用 OpenAI 兼容接口生成中文总结、分类、标签和分析理由
- **AND** 返回包含仓库基础信息与 AI 结果的结构化响应

#### Scenario: 非法仓库地址
- **WHEN** 用户提交的地址不是合法的 GitHub 仓库 URL
- **THEN** 系统拒绝处理该请求
- **AND** 返回明确的参数校验错误信息

#### Scenario: 外部服务调用失败
- **WHEN** GitHub API 或 AI 接口请求失败
- **THEN** 系统返回可识别的失败结果
- **AND** 不写入不完整或伪造的分析数据

### Requirement: 持久化保存分析后的仓库信息
系统 SHALL 将分析完成的仓库保存到数据库，并在重复分析同一仓库时执行更新而不是创建重复记录。

#### Scenario: 首次分析仓库
- **WHEN** 用户分析一个数据库中不存在的公开仓库
- **THEN** 系统创建新的仓库记录
- **AND** 保存仓库基础字段、AI 总结、分类、标签和最近分析时间

#### Scenario: 重复分析同一仓库
- **WHEN** 用户再次分析已存在的仓库
- **THEN** 系统基于唯一仓库标识更新已有记录
- **AND** 刷新 AI 结果和最近分析时间

### Requirement: 展示已分析仓库列表
系统 SHALL 提供仓库列表页，展示所有已分析仓库，并支持分类筛选、关键词搜索和按 stars 排序。

#### Scenario: 默认浏览列表
- **WHEN** 用户访问仓库列表页
- **THEN** 系统返回所有已分析仓库的卡片摘要
- **AND** 每个卡片展示仓库名、GitHub 链接、描述、AI 总结、分类、标签、语言、stars 和更新时间

#### Scenario: 按条件筛选列表
- **WHEN** 用户传入 `category` 或 `keyword` 查询条件
- **THEN** 系统仅返回满足条件的仓库结果

### Requirement: 查看单个仓库详情
系统 SHALL 提供仓库详情页，展示单个仓库的完整信息与 AI 分析结果。

#### Scenario: 成功查看详情
- **WHEN** 用户访问一个存在的仓库详情页
- **THEN** 系统展示仓库名、GitHub 地址、描述、AI 总结、分类、标签、主要语言、stars、forks、open issues、license、topics 和最近分析时间

#### Scenario: 访问不存在的仓库
- **WHEN** 用户访问不存在的仓库详情页
- **THEN** 系统返回明确的未找到结果

### Requirement: 使用固定分类体系约束 AI 输出
系统 SHALL 使用预定义分类集合约束 AI 分类结果，避免随意生成不在范围内的类别名称。

#### Scenario: AI 返回分类结果
- **WHEN** 系统向 AI 发起仓库分析请求
- **THEN** Prompt 中包含固定分类候选集
- **AND** 最终保存的分类必须来自候选集

## MODIFIED Requirements
### Requirement: 无
本次变更不修改已有规格要求，因为当前仓库中不存在可复用的既有功能规格。

## REMOVED Requirements
### Requirement: 无
**Reason**: 本次变更不删除现有需求。
**Migration**: 无迁移要求。
