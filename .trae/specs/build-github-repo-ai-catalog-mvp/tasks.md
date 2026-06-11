# Tasks
- [x] Task 1: 建立项目基础与数据模型
  - [x] SubTask 1.1: 初始化 Next.js App Router、Tailwind、TypeScript、ESLint 和 pnpm 基础项目
  - [x] SubTask 1.2: 配置 Prisma 与 Supabase PostgreSQL 连接，并定义 `GithubRepo` 数据模型
  - [x] SubTask 1.3: 补齐环境变量模板与 Prisma Client 单例封装

- [x] Task 2: 实现仓库分析后端链路
  - [x] SubTask 2.1: 编写 GitHub URL 解析与 Zod 参数校验
  - [x] SubTask 2.2: 封装 GitHub API，获取仓库基础信息、README 和根目录文件
  - [x] SubTask 2.3: 封装 OpenAI 兼容接口，输出结构化总结、分类、标签和理由
  - [x] SubTask 2.4: 实现 `analyzeAndSaveRepo` 主流程，完成 upsert 持久化
  - [x] SubTask 2.5: 提供 `POST /api/repos/analyze` 接口并处理错误返回

- [x] Task 3: 实现仓库查询接口
  - [x] SubTask 3.1: 提供 `GET /api/repos` 接口，支持 `category` 与 `keyword` 查询
  - [x] SubTask 3.2: 提供 `GET /api/repos/:id` 接口，支持仓库详情查询与未找到处理

- [x] Task 4: 实现前端页面与组件
  - [x] SubTask 4.1: 实现首页 URL 输入与分析提交流程
  - [x] SubTask 4.2: 实现仓库列表页与卡片、分类、标签组件
  - [x] SubTask 4.3: 实现仓库详情页与加载、空状态展示

- [x] Task 5: 完成联调与验证
  - [x] SubTask 5.1: 使用一个公开 GitHub 仓库完成端到端手工验证
  - [x] SubTask 5.2: 补充必要的类型、错误处理与空数据兼容
  - [x] SubTask 5.3: 运行 lint 或等价校验，确认核心路径可通过

- [x] Task 6: 修复联调阻塞的环境配置
  - [x] SubTask 6.1: 配置可用的 `DATABASE_URL`，确保 Prisma 可连接到 PostgreSQL 并完成查询
  - [x] SubTask 6.2: 配置 `GITHUB_TOKEN`，避免公开仓库抓取命中未认证速率限制
  - [x] SubTask 6.3: 配置 `OPENAI_API_KEY` 及相关 OpenAI 兼容参数，恢复 AI 分析链路
  - [x] SubTask 6.4: 环境修复后重新执行公开仓库端到端验收，并回填 Task 5 结果

# Task Dependencies
- `Task 2` depends on `Task 1`
- `Task 3` depends on `Task 1`
- `Task 4` depends on `Task 2` and `Task 3`
- `Task 5` depends on `Task 2`, `Task 3`, and `Task 4`
