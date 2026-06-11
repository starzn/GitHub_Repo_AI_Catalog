# 项目架构说明

## 1. 项目定位

当前项目是一个 GitHub 仓库分析与归档工具。

用户输入一个公开 GitHub 仓库地址后，系统会：

1. 校验并解析仓库 URL
2. 拉取 GitHub 仓库基础信息
3. 拉取 README 与根目录文件
4. 调用 OpenAI 兼容模型生成中文总结、分类、标签和分析理由
5. 使用 Prisma 将结果写入 Supabase PostgreSQL
6. 在列表页和详情页中展示分析结果

核心闭环：

```text
输入 URL -> 拉取数据 -> AI 分析 -> 入库 -> 展示
```

## 2. 整体分层

项目可以分成 4 层：

### 2.1 页面层

负责用户交互与结果展示。

- `app/page.tsx`
  - 首页，输入 GitHub URL 并发起分析
- `app/repos/page.tsx`
  - 仓库列表页，支持分类筛选与关键词搜索
- `app/repos/[id]/page.tsx`
  - 仓库详情页，展示单个仓库的完整分析结果

### 2.2 API 层

负责承接前端请求，并调用业务逻辑层。

- `POST /api/repos/analyze`
  - 分析一个 GitHub 仓库并写入数据库
- `GET /api/repos`
  - 查询仓库列表
- `GET /api/repos/:id`
  - 查询单个仓库详情

### 2.3 业务逻辑层

位于 `src/lib/`，负责 GitHub 抓取、AI 调用、URL 校验、数据库编排。

- `validators.ts`
  - GitHub URL 解析与请求体校验
- `github.ts`
  - GitHub REST API 调用封装
- `ai.ts`
  - OpenAI 兼容接口调用与结果结构校验
- `repo-analyzer.ts`
  - 主流程编排：解析 -> 抓取 -> AI -> upsert
- `repo-categories.ts`
  - 分类候选集
- `prisma.ts`
  - PrismaClient 单例
- `errors.ts`
  - 统一业务错误类

### 2.4 数据层

负责持久化与数据约束。

- `prisma/schema.prisma`
  - 定义 `GithubRepo` 模型
- `supabase/migrations/create_github_repo_table.sql`
  - Supabase 远程建表脚本
- Supabase PostgreSQL
  - 实际数据库存储

## 3. 核心数据流

### 3.1 仓库分析流程

```text
用户提交 GitHub URL
        ->
POST /api/repos/analyze
        ->
Zod 校验请求体
        ->
解析 owner/repo
        ->
调用 GitHub API 拉取仓库信息、README、根目录文件
        ->
调用 OpenAI 兼容接口生成 summary/category/tags/analysisReason
        ->
Prisma upsert 写入数据库
        ->
返回保存后的仓库详情
```

### 3.2 仓库列表流程

```text
用户访问 /repos
        ->
前端根据 query 参数调用 GET /api/repos
        ->
Prisma 查询 GithubRepo
        ->
按 stars desc、updatedAt desc 排序
        ->
返回列表摘要字段
        ->
前端渲染 RepoCard
```

### 3.3 仓库详情流程

```text
用户访问 /repos/:id
        ->
页面请求 GET /api/repos/:id
        ->
Prisma 按 id 查询
        ->
返回完整仓库数据
        ->
前端渲染详情视图
```

## 4. 关键模块职责

### 4.1 `validators.ts`

职责：

- 支持没有协议头的 GitHub URL 自动补全为 `https://`
- 只允许 `github.com` 和 `www.github.com`
- 要求路径格式必须是标准 `owner/repo`
- 使用 Zod 对 `POST /api/repos/analyze` 请求体做校验

### 4.2 `github.ts`

职责：

- 调用 GitHub REST API
- 获取仓库基础信息
- 获取 README
- 获取根目录文件列表
- 对 404、403、其他错误统一转换为业务错误

实现特征：

- 使用 `Promise.all` 并发拉取仓库快照
- 请求头中自动注入 `GITHUB_TOKEN`
- 所有请求使用 `cache: "no-store"`

### 4.3 `ai.ts`

职责：

- 调用 OpenAI 兼容 `chat/completions`
- 以 JSON 模式要求模型返回结构化结果
- 使用 Zod 校验 AI 输出结构
- 对输出进行标签去重、截断和兜底处理

实现特征：

- 强制 `response_format: { type: "json_object" }`
- 分类必须来自固定候选集
- 对 README 文本做长度截断，避免超长 prompt

### 4.4 `repo-analyzer.ts`

职责：

- 串联 URL 解析、GitHub 抓取、AI 分析与数据库写入
- 使用 `fullName` 作为 upsert 唯一依据
- 防止重复分析时生成重复记录

### 4.5 `prisma.ts`

职责：

- 提供 PrismaClient 单例
- 在开发环境下挂到 `global`，避免热更新导致连接泄漏

## 5. 数据模型

当前核心模型为 `GithubRepo`。

关键字段：

- 基础信息
  - `owner`
  - `name`
  - `fullName`
  - `htmlUrl`
  - `description`
  - `language`
  - `stars`
  - `forks`
  - `openIssues`
  - `license`
  - `topics`
- 抓取内容
  - `readmeText`
- AI 分析结果
  - `summary`
  - `category`
  - `tags`
  - `analysisReason`
- 时间字段
  - `analyzedAt`
  - `createdAt`
  - `updatedAt`

关键约束：

- `fullName` 唯一
- `htmlUrl` 唯一
- `category` 建索引
- `owner + name` 建联合索引
- `analyzedAt` 建索引

## 6. 架构约束与约定

### 6.1 分类必须固定

AI 分类不允许自由发挥，必须从 `REPO_CATEGORIES` 中选择一个。

### 6.2 重复分析必须更新

对同一个 GitHub 仓库重复分析时，系统使用 `upsert` 更新已有记录，而不是重复创建。

### 6.3 API 以 JSON 为主

前后端交互都基于 JSON，分析接口成功时返回：

```json
{
  "success": true,
  "data": {}
}
```

错误时当前主要格式为：

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误信息"
  }
}
```

说明：

- `POST /api/repos/analyze` 已使用统一错误结构
- `GET /api/repos/:id` 当前未命中时返回的是 `{ "error": "仓库不存在" }`
- 后续如需统一，可将详情接口也切换为统一错误结构

## 7. 当前边界

当前项目聚焦 MVP，不包含以下能力：

- 用户登录
- 多用户空间
- 私有仓库分析
- GitHub OAuth
- 批量导入
- 定时任务
- 向量搜索
- 相似项目推荐

## 8. 后续可扩展方向

- 批量分析多个仓库 URL
- 增加分类统计页
- 增加标签聚合与标签云
- 增加重新分析按钮与变更检测
- 增加任务队列与失败重试
- 接入部署平台并对外提供在线访问地址
