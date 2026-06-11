# 技术栈说明

## 1. 技术选型总览

当前项目围绕“快速完成 GitHub 仓库分析 MVP”来做选型，重点是：

- 前后端统一在一个仓库内开发
- 直接使用 GitHub API 获取公开仓库数据
- 使用 OpenAI 兼容模型做结构化分析
- 使用 Prisma + Supabase 快速完成持久化

## 2. 核心技术栈

### 2.1 前端

- `Next.js 16`
  - 使用 App Router
  - 负责页面渲染、API 路由、开发体验
- `React 19`
  - 负责组件与交互逻辑
- `Tailwind CSS 4`
  - 负责界面样式与快速布局

选择原因：

- Next.js 适合一体化开发页面和接口
- App Router 与当前项目结构天然匹配
- Tailwind 能快速完成后台工具类产品的界面搭建

### 2.2 后端与接口

- `Next.js Route Handlers`
  - 用于实现 `/api/repos/*` 接口
- `Zod`
  - 用于请求参数和 AI 输出结构校验

选择原因：

- 不需要额外引入独立后端框架
- Zod 与 TypeScript 组合简洁，适合小而清晰的接口层

### 2.3 数据库与 ORM

- `Supabase PostgreSQL`
  - 作为主数据库
- `Prisma`
  - 作为 ORM 和数据库访问层

选择原因：

- Supabase 提供托管 PostgreSQL，适合快速上线
- Prisma 提供类型安全和较好的开发体验
- `upsert`、数组字段、索引定义都比较直接

### 2.4 外部服务

- `GitHub REST API`
  - 获取仓库基础信息、README、根目录文件
- `OpenAI 兼容 API`
  - 输出中文总结、分类、标签和分析理由

选择原因：

- GitHub REST API 足够覆盖当前 MVP 所需数据
- OpenAI 兼容协议支持范围广，后续替换模型成本低

## 3. 依赖说明

来自 `package.json` 的主要依赖如下。

### 3.1 运行时依赖

- `next`
  - 应用框架
- `react`
  - 组件运行时
- `react-dom`
  - 前端渲染
- `@prisma/client`
  - Prisma 运行时客户端
- `zod`
  - 数据校验

### 3.2 开发依赖

- `typescript`
  - 类型系统
- `eslint`
  - 代码检查
- `eslint-config-next`
  - Next.js 官方 ESLint 规则
- `tailwindcss`
  - 原子化样式
- `@tailwindcss/postcss`
  - Tailwind PostCSS 适配
- `prisma`
  - Prisma CLI
- `dotenv`
  - 让 Prisma 配置读取本地环境变量

## 4. 目录与技术映射

### 4.1 `app/`

对应 Next.js App Router。

- 页面定义
- Route Handlers
- 路由级 loading 文件

### 4.2 `components/`

对应前端 UI 组件层。

- 表单组件
- 列表组件
- 详情组件
- 样式辅助组件

### 4.3 `src/lib/`

对应核心业务逻辑层。

- GitHub 抓取
- AI 调用
- Prisma 访问
- 业务错误
- 分类常量
- 参数校验

### 4.4 `prisma/`

对应 Prisma schema 与数据库模型定义。

### 4.5 `supabase/migrations/`

对应 Supabase SQL migration 文件，用于直接在远端数据库建表。

### 4.6 `types/`

用于维护前后端交互的类型定义。

## 5. 环境变量设计

当前项目依赖以下关键环境变量：

### 5.1 数据库

- `DATABASE_URL`
  - 应用运行时连接数据库，通常使用 Supabase pooler
- `DIRECT_URL`
  - Prisma 直连数据库时使用

### 5.2 GitHub

- `GITHUB_TOKEN`
  - GitHub API token，用于避免未认证限流

### 5.3 AI

- `OPENAI_API_KEY`
  - OpenAI 兼容 API 密钥
- `OPENAI_BASE_URL`
  - OpenAI 兼容服务地址
- `OPENAI_MODEL`
  - 当前使用的模型名

## 6. 运行命令

常用命令如下：

```bash
pnpm install
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:studio
pnpm prisma db push
```

说明：

- `pnpm dev`
  - 启动本地开发服务
- `pnpm build`
  - 做生产构建验证
- `pnpm lint`
  - 做静态检查
- `pnpm prisma db push`
  - 适合快速将 schema 推到数据库
- `supabase/migrations/create_github_repo_table.sql`
  - 适合在 Supabase 远端直接执行建表

## 7. 技术约束

### 7.1 路径别名

项目使用：

```text
@/*
```

映射到项目根目录，用于减少相对路径层级。

### 7.2 AI 输出必须结构化

AI 接口要求：

- 使用 JSON mode
- 返回固定字段
- 分类必须命中固定候选集
- 最终还要经过 Zod 校验

### 7.3 Prisma 使用单例

开发环境使用 Prisma 单例，避免 Next.js 热更新时出现多个数据库连接实例。

## 8. 为什么当前方案适合 MVP

从 MVP 角度看，这套方案的优点是：

- 技术栈收敛，前后端统一
- 上手快，开发成本低
- GitHub + AI + 数据库三段式链路清晰
- 后续迁移和扩展空间充足

它并不是一个复杂分布式系统方案，但非常适合先把“输入 URL 后得到结构化结果”这个最小可用闭环做完整。

## 9. 后续技术演进建议

如果项目继续扩展，建议考虑：

- 增加任务队列
  - 避免分析接口同步阻塞过久
- 增加缓存层
  - 降低重复分析成本
- 增加重新分析策略
  - 结合 README 变化或时间窗口做增量更新
- 增加监控与日志
  - 方便定位 GitHub / AI / 数据库异常
- 增加部署文档
  - 明确 Vercel、Railway、Render 等平台部署差异
