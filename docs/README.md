# 文档目录

本目录用于存放当前项目的补充说明文档，当前采用“总览 + references”的结构：

- `docs/README.md`
  - 作为文档入口与导航页
- `docs/references/`
  - 存放详细参考文档，覆盖架构、技术、接口、部署和数据库说明

## 文档列表

- `references/architecture.md`
  - 说明系统整体结构、核心数据流、模块职责与关键约束。
- `references/technology.md`
  - 说明技术选型、依赖职责、运行环境与开发命令。
- `references/api.md`
  - 说明接口清单、请求响应结构、错误码与联调示例。
- `references/deployment.md`
  - 说明环境变量、数据库初始化与 Vercel / 其他平台部署建议。
- `references/database.md`
  - 说明 Prisma 模型、Supabase 连接、建表方式与数据库排障思路。

## 阅读建议

如果你是第一次接手这个项目，推荐按照下面顺序阅读：

1. 先看 `references/architecture.md`，了解系统全貌与核心闭环。
2. 再看 `references/technology.md`，了解项目为什么这样选型以及本地如何运行。
3. 再看 `references/api.md`，方便直接联调接口或对接前端页面。
4. 再看 `references/deployment.md`，用于本地验证、上线前检查和部署排错。
5. 最后看 `references/database.md`，用于理解数据模型、建表方式和数据库相关问题排查。

## 项目一句话

GitHub Repo AI Catalog 是一个面向公开 GitHub 仓库的分析与归档工具，核心流程为：

```text
输入 URL -> 拉取 GitHub 数据 -> AI 分析 -> 入库 -> 列表/详情展示
```
