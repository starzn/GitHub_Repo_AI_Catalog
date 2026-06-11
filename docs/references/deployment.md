# 部署文档

本文档说明当前项目的部署前提、环境变量、数据库初始化方式，以及在 Vercel 等平台上的部署建议。

## 1. 部署前提

在部署当前项目之前，需要先准备以下资源：

- 一个可用的 GitHub 仓库
- 一个 Supabase 项目
- 一个可用的 OpenAI 兼容模型服务
- 一个 GitHub Personal Access Token

当前项目依赖：

- GitHub API 抓取公开仓库数据
- OpenAI 兼容 API 生成总结、分类和标签
- Supabase PostgreSQL 持久化数据

## 2. 部署架构

推荐部署结构如下：

```text
Vercel / 其他 Node 平台
        ->
Next.js App Router
        ->
API Route Handlers
        ->
Prisma
        ->
Supabase PostgreSQL

外部服务:
- GitHub REST API
- OpenAI 兼容 API
```

说明：

- 页面与 API 都由 Next.js 承载
- 数据库存储放在 Supabase
- GitHub 和 AI 都是运行时外部依赖

## 3. 必填环境变量

建议以 [`.env.example`](file:///Users/didi/Desktop/samples/GitHub_Repo_AI_Catalog/.env.example) 为模板，在部署平台配置以下变量。

### 3.1 数据库

```bash
DATABASE_URL=""
DIRECT_URL=""
```

说明：

- `DATABASE_URL`
  - 应用运行时使用
  - 建议填写 Supabase pooler 地址
- `DIRECT_URL`
  - Prisma 直连使用
  - 在某些部署平台或当前网络下，`5432` 直连可能不可达
  - 如果部署平台无法使用直连，可优先保证运行时 `DATABASE_URL` 正常

### 3.2 GitHub

```bash
GITHUB_TOKEN=""
```

说明：

- 用于访问 GitHub API
- 不配置时可能很容易命中未认证限流

### 3.3 AI

```bash
OPENAI_API_KEY=""
OPENAI_BASE_URL=""
OPENAI_MODEL=""
```

说明：

- `OPENAI_BASE_URL` 支持 OpenAI 官方或兼容 OpenAI 协议的平台
- `OPENAI_MODEL` 可使用你当前实际模型名，例如 `gpt-4.1-mini` 或其他兼容模型

### 3.4 可选变量

```bash
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
SUPABASE_SERVICE_ROLE_KEY=""
```

说明：

- 当前代码运行核心并不强依赖这些值
- 但如果后续加 Supabase 前端直连能力或后台管理能力，会用到这些变量

## 4. 数据库初始化

当前项目有两种初始化数据库的方式。

### 4.1 方式一：Prisma `db push`

适合本地或部署网络能直连数据库时使用：

```bash
pnpm prisma db push
```

注意：

- 当前项目 schema 同时配置了 `DATABASE_URL` 和 `DIRECT_URL`
- 如果 `DIRECT_URL` 指向的 `5432` 端口在当前环境不可达，`db push` 可能失败

### 4.2 方式二：Supabase SQL Migration

适合直接在 Supabase 后台执行，通常更稳定。

文件位置：

- [create_github_repo_table.sql](file:///Users/didi/Desktop/samples/GitHub_Repo_AI_Catalog/supabase/migrations/create_github_repo_table.sql)

建议流程：

1. 打开 Supabase SQL Editor
2. 复制该 SQL 文件内容
3. 执行建表语句
4. 确认 `public.GithubRepo` 表已创建

这是当前项目更推荐的远端初始化方式。

## 5. 本地部署验证

如果你想先在本地模拟部署环境，建议按下面流程检查：

### 5.1 安装依赖

```bash
pnpm install
```

### 5.2 配置环境变量

```bash
cp .env.example .env
```

然后填入真实值。

### 5.3 生成 Prisma Client

```bash
pnpm prisma:generate
```

### 5.4 初始化数据库

二选一：

```bash
pnpm prisma db push
```

或直接执行：

- `supabase/migrations/create_github_repo_table.sql`

### 5.5 启动开发服务

```bash
pnpm dev
```

### 5.6 验证关键路径

可以优先验证这几个页面和接口：

- `GET /`
- `GET /repos`
- `POST /api/repos/analyze`
- `GET /api/repos`
- `GET /api/repos/:id`

## 6. Vercel 部署建议

当前项目非常适合部署到 Vercel，但需要注意几个点。

### 6.1 推荐原因

- Next.js 原生支持最好
- 页面与 API 路由都能直接托管
- 与 GitHub 仓库联动顺畅

### 6.2 部署步骤

1. 将代码推送到 GitHub
2. 在 Vercel 导入仓库
3. 配置环境变量
4. 确认数据库表已创建
5. 触发首次部署

### 6.3 需要重点检查

- `DATABASE_URL` 是否填写为可用的 Supabase pooler
- `GITHUB_TOKEN` 是否有效
- `OPENAI_*` 是否已填写完整
- 数据库表 `GithubRepo` 是否已存在

### 6.4 当前项目中的注意事项

当前仓库包含 [vercel.json](file:///Users/didi/Desktop/samples/GitHub_Repo_AI_Catalog/vercel.json)：

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

这类重写规则更像静态站点配置，而当前项目是 Next.js App Router + API Route 的服务端应用。

建议：

- 如果使用 Vercel 正常部署 Next.js，通常不需要这条 rewrite
- 如果后续部署出现页面或 API 路由异常，优先检查这个文件是否影响了 Vercel 的默认 Next.js 路由行为

## 7. 非 Vercel 平台部署建议

如果暂时不使用 Vercel，也可以部署到支持 Node.js 的平台，例如：

- Railway
- Render
- 自建服务器

### 7.1 通用要求

- Node.js 版本满足 Next.js 16 需求
- 支持设置环境变量
- 能访问 Supabase 数据库
- 能访问 GitHub API 与 OpenAI 兼容接口

### 7.2 常见启动命令

构建：

```bash
pnpm build
```

启动：

```bash
pnpm start
```

## 8. 部署后检查清单

建议在部署完成后逐项检查：

- 首页能正常打开
- 列表页能正常打开
- 提交 GitHub URL 后分析成功
- 数据成功写入数据库
- 列表页能展示刚分析的仓库
- 详情页能打开并展示完整信息

## 9. 常见问题

### 9.1 `DIRECT_URL` 直连失败

现象：

- Prisma `db push` 报错
- 无法连通 `db.xxx.supabase.co:5432`

处理建议：

- 先确认数据库表是否已经通过 SQL migration 创建
- 生产运行优先保证 `DATABASE_URL` 可用
- 初始化数据库时优先使用 Supabase SQL Editor

### 9.2 GitHub API 被限流

现象：

- 分析接口返回 GitHub 相关 403/502

处理建议：

- 检查 `GITHUB_TOKEN` 是否已配置
- 确认 token 仍有效

### 9.3 AI 调用失败

现象：

- 返回 `OPENAI_CONFIG_ERROR`
- 返回 `OPENAI_API_ERROR`
- 返回 `OPENAI_INVALID_RESPONSE`

处理建议：

- 检查 `OPENAI_API_KEY`
- 检查 `OPENAI_BASE_URL`
- 检查 `OPENAI_MODEL`
- 确认模型确实支持当前接口与 JSON 输出场景

## 10. 推荐上线顺序

为了降低部署风险，推荐按以下顺序进行：

1. 本地环境联调通过
2. Supabase 建表成功
3. 代码推送到 GitHub
4. 部署平台配置环境变量
5. 首次部署
6. 用一个公开仓库做线上端到端验证

这样更容易快速定位问题属于：

- 代码问题
- 环境变量问题
- 数据库问题
- GitHub API 问题
- AI 服务问题
