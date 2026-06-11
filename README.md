# GitHub Repo AI Catalog

一个基于 `Next.js + Prisma + Supabase + GitHub API + OpenAI 兼容模型` 的 GitHub 仓库分析与归档工具。

用户输入一个公开 GitHub 仓库地址后，系统会自动抓取仓库信息、README 与根目录文件，调用 AI 生成中文总结、分类和标签，并将结果保存到数据库中，最后在列表页和详情页中展示。

## 项目目标

本项目聚焦一个清晰的 MVP 闭环：

```text
输入 GitHub URL -> 抓取仓库信息 -> AI 总结分类 -> 入库 -> 列表/详情展示
```

适合用于：

- 搭建个人或团队的开源项目归档库
- 快速理解陌生 GitHub 仓库的用途与技术方向
- 为后续做标签检索、推荐系统、批量导入打基础

## 功能特性

- 支持输入公开 GitHub 仓库 URL 并发起分析
- 自动解析 `owner/repo`
- 自动抓取仓库基础信息、README 和根目录文件
- 调用 OpenAI 兼容模型生成：
  - 中文总结
  - 分类
  - 标签
  - 分析理由
- 使用 Prisma 将结果写入 Supabase PostgreSQL
- 支持仓库列表展示
- 支持分类筛选与关键词搜索
- 支持仓库详情页展示完整分析结果
- 重复分析同一仓库时使用 `upsert` 更新已有记录

## 技术栈

- 前端框架：Next.js App Router
- UI：Tailwind CSS
- 语言：TypeScript
- 数据库：Supabase PostgreSQL
- ORM：Prisma
- GitHub 数据源：GitHub REST API
- AI 能力：OpenAI 兼容 API
- 参数校验：Zod
- 包管理：pnpm

## 项目结构

```text
app/
  api/repos/              # 仓库分析、列表、详情接口
  repos/                  # 仓库列表页与详情页
  page.tsx                # 首页
components/               # UI 组件
src/lib/                  # GitHub、AI、Prisma、校验等业务逻辑
prisma/                   # Prisma schema
supabase/migrations/      # Supabase SQL migration
types/                    # 前后端共享类型
```

## 本地启动

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

复制 `.env.example`，并填写你自己的配置：

```bash
cp .env.example .env
```

至少需要这些变量：

```bash
DATABASE_URL=""
DIRECT_URL=""
GITHUB_TOKEN=""
OPENAI_API_KEY=""
OPENAI_BASE_URL=""
OPENAI_MODEL=""
```

说明：

- `DATABASE_URL`：应用运行时使用，建议走 Supabase pooler
- `DIRECT_URL`：Prisma 直连数据库时使用
- `GITHUB_TOKEN`：避免 GitHub API 未认证限流
- `OPENAI_*`：用于调用兼容 OpenAI 协议的大模型接口

### 3. 初始化数据库

如果本地 Prisma 可直连数据库：

```bash
pnpm prisma db push
```

如果你使用的是当前仓库里的 Supabase migration，也可以直接在 Supabase 中执行：

```text
supabase/migrations/create_github_repo_table.sql
```

### 4. 启动开发服务

```bash
pnpm dev
```

默认访问：

- 首页：<http://localhost:3000>
- 仓库列表：<http://localhost:3000/repos>

## 常用脚本

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:studio
```

## API 概览

### `POST /api/repos/analyze`

请求体：

```json
{
  "url": "https://github.com/vercel/next.js"
}
```

作用：

- 校验 GitHub URL
- 拉取 GitHub 仓库数据
- 调用 AI 生成总结、分类、标签
- 将结果入库并返回

### `GET /api/repos`

支持查询参数：

- `category`
- `keyword`

示例：

```text
/api/repos?category=开发工具
/api/repos?keyword=React
```

### `GET /api/repos/:id`

根据仓库主键返回详情数据。

## 当前状态

当前版本已经完成 MVP 主流程，包括：

- 仓库分析
- AI 入库
- 列表页
- 详情页
- GitHub 仓库创建与推送
- 提交信息 Git hook 校验

## 后续规划

- 批量导入多个 GitHub URL
- 更细粒度的分类体系
- 定时重新分析仓库
- 导出 Markdown / CSV
- 部署到 Vercel 并配置公开演示地址

## 仓库信息

- GitHub: <https://github.com/starzn/GitHub_Repo_AI_Catalog>
- 默认分支：`main`

## License

如需开源协议，可按你的实际需求补充 `LICENSE` 文件。
