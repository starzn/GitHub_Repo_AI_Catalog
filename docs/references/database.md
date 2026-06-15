# 数据库文档

本文档说明当前项目的数据存储设计、Prisma 模型结构、Supabase 连接方式、建表流程以及常见问题排查。

## 1. 数据库方案总览

当前项目使用：

- `Supabase PostgreSQL`
  - 作为远程托管数据库
- `Prisma`
  - 作为 ORM 与数据库访问层

项目当前只有一个核心数据表：

- `GithubRepo`

这张表用于保存：

- GitHub 仓库基础信息
- README 抓取结果
- AI 分析结果
- 时间戳与检索字段

## 2. 当前数据模型

Prisma 模型定义位于：

- [schema.prisma](file:///Users/didi/Desktop/samples/GitHub_Repo_AI_Catalog/prisma/schema.prisma)

核心模型：

```prisma
model GithubRepo {
  id             String   @id @default(cuid())
  owner          String
  name           String
  fullName       String   @unique
  htmlUrl        String   @unique
  description    String?  @db.Text
  readmeText     String?  @db.Text
  language       String
  stars          Int      @default(0)
  forks          Int      @default(0)
  openIssues     Int      @default(0)
  license        String?
  topics         String[] @default([])
  summary        String   @db.Text
  categoryGroup  String   @default("其他")
  category       String
  tags           String[] @default([])
  analysisReason String   @db.Text
  analyzedAt     DateTime
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([category])
  @@index([categoryGroup])
  @@index([owner, name])
  @@index([analyzedAt])
}
```

## 3. 字段说明

### 3.1 主键与唯一字段

- `id`
  - 主键，使用 `cuid()`
- `fullName`
  - GitHub 仓库全名，例如 `vercel/next.js`
  - 唯一约束
- `htmlUrl`
  - GitHub 仓库页面地址
  - 唯一约束

### 3.2 GitHub 基础信息

- `owner`
  - 仓库所属用户或组织
- `name`
  - 仓库名
- `description`
  - GitHub 仓库描述
- `language`
  - 主语言
- `stars`
  - Star 数
- `forks`
  - Fork 数
- `openIssues`
  - Open Issues 数
- `license`
  - 许可证标识或名称
- `topics`
  - GitHub Topics 数组

### 3.3 内容抓取结果

- `readmeText`
  - 抓取到的 README 原始文本

### 3.4 AI 分析结果

- `summary`
  - 中文总结
- `categoryGroup`
  - 分组名称，如"技术开发"、"数据与AI"等
- `category`
  - 固定候选集中的分类，必须属于对应的 categoryGroup
- `tags`
  - AI 生成的标签数组
- `analysisReason`
  - AI 输出的分类与标签判断理由

### 3.5 时间字段

- `analyzedAt`
  - 最近一次分析时间
- `createdAt`
  - 记录创建时间
- `updatedAt`
  - 记录更新时间

## 4. 索引设计

当前表定义了以下索引：

- `@@index([category])`
  - 用于分类筛选
- `@@index([categoryGroup])`
  - 用于分组筛选
- `@@index([owner, name])`
  - 用于仓库维度检索
- `@@index([analyzedAt])`
  - 用于最近分析时间维度排序或过滤

说明：

- 当前列表接口主要按 `stars` 和 `updatedAt` 排序
- 如果后续仓库规模继续扩大，可以考虑为高频查询字段补充更多索引

## 5. 写入策略

项目当前采用 `upsert`，而不是简单 `create`。

实现位于：

- [repo-analyzer.ts](file:///Users/didi/Desktop/samples/GitHub_Repo_AI_Catalog/src/lib/repo-analyzer.ts)

当前写入逻辑：

- 使用 `fullName` 作为唯一条件
- 仓库首次分析时创建记录
- 重复分析同一仓库时更新已有记录

这样做的好处：

- 避免重复仓库记录
- 保持仓库信息与 AI 总结为最新状态

## 6. Prisma 与连接方式

Prisma 数据源配置如下：

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

说明：

- `DATABASE_URL`
  - 应用运行时使用
  - 推荐走 Supabase pooler
- `DIRECT_URL`
  - Prisma 直连数据库时使用
  - 适合 migrate 或某些建表场景

## 7. 环境变量说明

数据库相关环境变量来自：

- [`.env.example`](file:///Users/didi/Desktop/samples/GitHub_Repo_AI_Catalog/.env.example)

关键配置：

```bash
DATABASE_URL="postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres"
```

### 7.1 `DATABASE_URL`

主要用于：

- Next.js 页面与 API 运行时
- PrismaClient 常规查询

特征：

- 走连接池
- 更适合线上运行场景

### 7.2 `DIRECT_URL`

主要用于：

- Prisma 直连数据库
- 迁移和建表场景

注意：

- 当前实际网络环境下，`5432` 直连可能不可达
- 因此本项目远端建表时，优先使用 Supabase SQL Editor 更稳定

## 8. 建表方式

当前项目支持两种建表方式。

### 8.1 使用 Prisma Schema

```bash
pnpm prisma db push
```

适用场景：

- 本地开发
- 网络能访问 `DIRECT_URL`

潜在问题：

- 如果直连端口不可达，`db push` 会失败

### 8.2 使用 Supabase SQL Migration

SQL 文件位置：

- [create_github_repo_table.sql](file:///Users/didi/Desktop/samples/GitHub_Repo_AI_Catalog/supabase/migrations/create_github_repo_table.sql)

内容会创建：

- `public.GithubRepo`
- 唯一约束
- 分类索引
- 仓库名索引
- 分析时间索引

推荐方式：

- 在 Supabase SQL Editor 中直接执行该文件内容

这是当前项目更推荐的远端建表方案。

## 9. Prisma Client 使用方式

Prisma 单例位于：

- [prisma.ts](file:///Users/didi/Desktop/samples/GitHub_Repo_AI_Catalog/src/lib/prisma.ts)

核心逻辑：

- 生产环境每次初始化一个 PrismaClient
- 开发环境挂到 `globalThis`
- 避免 Next.js 热更新导致多个连接实例

实现收益：

- 降低开发环境连接数膨胀风险
- 保持调用方式统一

## 10. 当前数据库在业务中的使用点

### 10.1 写入

写入入口：

- `POST /api/repos/analyze`

实际调用：

- GitHub 抓取
- AI 分析
- Prisma `upsert`

### 10.2 列表查询

查询入口：

- `GET /api/repos`

特点：

- 支持 `group`（按分组筛选）
- 支持 `category`（按分类筛选）
- 支持 `keyword`
- 返回摘要字段
- 排序按 `stars desc`, `updatedAt desc`

### 10.3 详情查询

查询入口：

- `GET /api/repos/:id`

特点：

- 按主键 `id` 查询
- 返回完整仓库数据

## 11. 数据一致性说明

当前项目是一套同步链路：

1. 抓取 GitHub 数据
2. 调用 AI
3. 写入数据库
4. 返回结果

这意味着：

- 如果 GitHub 抓取失败，不会入库
- 如果 AI 分析失败，不会入库
- 如果数据库写入失败，请求也会失败

优点：

- 不会写入半成品数据

缺点：

- 接口耗时受外部依赖影响较大

## 12. 常见问题

### 12.1 数据库表不存在

现象：

- Prisma 查询报 `The table public.GithubRepo does not exist`

处理方式：

- 先执行 `create_github_repo_table.sql`
- 或执行 `pnpm prisma db push`

### 12.2 直连端口不可用

现象：

- Prisma `db push` 报 `P1001`
- 无法访问 `db.xxx.supabase.co:5432`

处理方式：

- 优先走 Supabase SQL Editor 执行 migration
- 确保运行时 `DATABASE_URL` 正常

### 12.3 连接池账号错误

现象：

- 报 `tenant/user not found`

原因：

- Supabase pooler 连接串填写错误
- 用户名、项目标识或 region 不匹配

处理方式：

- 直接从 Supabase Dashboard 复制官方连接串
- 不要手动拼接和改写

## 13. 后续数据库演进建议

如果项目后续继续发展，建议考虑：

- 增加仓库分析任务表
  - 管理异步分析状态
- 增加分类统计表或视图
  - 支持 dashboard
- 增加标签统计能力
  - 支持标签聚合与趋势分析
- 增加更新时间策略
  - 区分“GitHub 数据更新时间”和“AI 分析更新时间”
- 增加全文搜索或向量索引
  - 支持语义检索和相似仓库推荐
