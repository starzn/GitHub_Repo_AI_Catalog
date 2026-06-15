# 接口文档

本文档描述当前项目的接口设计、请求参数、响应格式、错误处理和联调示例。

## 1. 接口清单

当前共有 3 个核心接口：

| 方法 | 路径 | 说明 |
|---|---|---|
| `POST` | `/api/repos/analyze` | 分析 GitHub 仓库并写入数据库 |
| `GET` | `/api/repos` | 获取仓库列表，支持分类和关键词筛选 |
| `GET` | `/api/repos/:id` | 获取单个仓库详情 |

## 2. 通用说明

### 2.1 Content-Type

- `POST /api/repos/analyze`
  - 请求体必须是 JSON

### 2.2 成功响应

分析接口当前成功响应格式：

```json
{
  "success": true,
  "data": {}
}
```

列表和详情接口当前直接返回 JSON 数据对象。

### 2.3 错误响应

当前项目中的错误响应有两种实现状态：

- `POST /api/repos/analyze`
  - 已统一为：

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误信息"
  }
}
```

- `GET /api/repos/:id`
  - 未命中时当前返回：

```json
{
  "error": "仓库不存在"
}
```

说明：

- 这代表当前详情接口还没有完全统一到错误包装格式
- 若后续要统一 API 风格，建议优先改这个接口

## 3. 分析仓库

### 3.1 `POST /api/repos/analyze`

根据 GitHub URL 分析一个公开仓库，并将结果持久化。

### 3.2 请求体

```json
{
  "url": "https://github.com/vercel/next.js"
}
```

### 3.3 参数说明

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `url` | `string` | 是 | GitHub 仓库地址，仅支持公开仓库 |

支持的地址形式：

- `https://github.com/vercel/next.js`
- `http://github.com/vercel/next.js`
- `github.com/vercel/next.js`

不支持：

- 非 GitHub 域名
- 不完整路径
- 非标准 `owner/repo` 格式

### 3.4 处理流程

服务端内部处理步骤如下：

1. 校验请求体是否为合法 JSON
2. 使用 Zod 校验 `url`
3. 解析仓库 URL
4. 并发请求 GitHub API：
   - 仓库基础信息
   - README
   - 根目录文件
5. 调用 OpenAI 兼容接口生成：
   - `summary`
   - `categoryGroup`
   - `category`
   - `tags`
   - `analysisReason`
6. 使用 Prisma `upsert` 入库
7. 返回保存后的仓库详情

### 3.5 成功响应示例

```json
{
  "success": true,
  "data": {
    "id": "cmq953xtk00009kv6jfo2ycgs",
    "owner": "vercel",
    "name": "next.js",
    "fullName": "vercel/next.js",
    "htmlUrl": "https://github.com/vercel/next.js",
    "description": "The React Framework",
    "readmeText": "...",
    "language": "JavaScript",
    "stars": 139929,
    "forks": 31203,
    "openIssues": 4038,
    "license": "MIT",
    "topics": ["nextjs", "react"],
    "summary": "Next.js 是一个基于 React 的全栈 Web 框架...",
    "categoryGroup": "技术开发",
    "category": "开发工具",
    "tags": ["React", "服务端渲染", "静态站点生成", "全栈框架"],
    "analysisReason": "Next.js 是一个用于构建 Web 应用的框架...",
    "analyzedAt": "2026-06-11T06:52:08.168Z",
    "createdAt": "2026-06-11T06:52:08.176Z",
    "updatedAt": "2026-06-11T06:52:08.176Z"
  }
}
```

### 3.6 常见错误响应

#### 请求体不是合法 JSON

```json
{
  "success": false,
  "error": {
    "code": "INVALID_JSON",
    "message": "请求体必须是合法 JSON。"
  }
}
```

#### URL 校验失败

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "请求参数校验失败。"
  }
}
```

#### GitHub 仓库不存在

```json
{
  "success": false,
  "error": {
    "code": "GITHUB_NOT_FOUND",
    "message": "GitHub 仓库不存在，或 README/目录不可访问。"
  }
}
```

#### GitHub API 限流

```json
{
  "success": false,
  "error": {
    "code": "GITHUB_RATE_LIMITED",
    "message": "GitHub API 访问受限：..."
  }
}
```

#### AI 配置错误

```json
{
  "success": false,
  "error": {
    "code": "OPENAI_CONFIG_ERROR",
    "message": "缺少 OPENAI_API_KEY，无法执行 AI 仓库分析。"
  }
}
```

#### AI 响应不合法

```json
{
  "success": false,
  "error": {
    "code": "OPENAI_INVALID_RESPONSE",
    "message": "AI 返回结构不符合预期。"
  }
}
```

## 4. 获取仓库列表

### 4.1 `GET /api/repos`

查询已分析的仓库列表。

### 4.2 查询参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `group` | `string` | 否 | 按分组精确筛选，不区分大小写 |
| `category` | `string` | 否 | 按分类精确筛选，不区分大小写 |
| `keyword` | `string` | 否 | 关键词搜索 |

### 4.3 搜索范围

`keyword` 会匹配以下字段：

- `owner`
- `name`
- `fullName`
- `description`
- `summary`
- `language`
- `tags`
- `topics`

### 4.4 排序规则

当前固定排序：

1. `stars desc`
2. `updatedAt desc`

### 4.5 请求示例

```text
GET /api/repos
GET /api/repos?keyword=React
GET /api/repos?group=技术开发
GET /api/repos?category=开发工具
GET /api/repos?group=技术开发&category=开发工具&keyword=React
```

### 4.6 成功响应示例

```json
{
  "items": [
    {
      "id": "cmq953xtk00009kv6jfo2ycgs",
      "owner": "vercel",
      "name": "next.js",
      "fullName": "vercel/next.js",
      "htmlUrl": "https://github.com/vercel/next.js",
      "description": "The React Framework",
      "summary": "Next.js 是一个基于 React 的全栈 Web 框架...",
      "categoryGroup": "技术开发",
      "category": "开发工具",
      "tags": ["React", "服务端渲染", "静态站点生成", "全栈框架"],
      "language": "JavaScript",
      "stars": 139929,
      "updatedAt": "2026-06-11T06:52:08.176Z"
    }
  ],
  "total": 1
}
```

## 5. 获取仓库详情

### 5.1 `GET /api/repos/:id`

根据仓库主键 ID 查询详情。

### 5.2 路径参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `id` | `string` | 是 | `GithubRepo.id` |

### 5.3 成功响应示例

```json
{
  "id": "cmq953xtk00009kv6jfo2ycgs",
  "owner": "vercel",
  "name": "next.js",
  "fullName": "vercel/next.js",
  "htmlUrl": "https://github.com/vercel/next.js",
  "description": "The React Framework",
  "readmeText": "...",
  "language": "JavaScript",
  "stars": 139929,
  "forks": 31203,
  "openIssues": 4038,
  "license": "MIT",
  "topics": ["nextjs", "react"],
  "summary": "Next.js 是一个基于 React 的全栈 Web 框架...",
  "categoryGroup": "技术开发",
  "category": "开发工具",
  "tags": ["React", "服务端渲染", "静态站点生成", "全栈框架"],
  "analysisReason": "Next.js 是一个用于构建 Web 应用的框架...",
  "analyzedAt": "2026-06-11T06:52:08.168Z",
  "createdAt": "2026-06-11T06:52:08.176Z",
  "updatedAt": "2026-06-11T06:52:08.176Z"
}
```

### 5.4 未命中响应示例

```json
{
  "error": "仓库不存在"
}
```

状态码：

```text
404 Not Found
```

## 6. 业务错误码

当前代码中可见的主要错误码如下：

| 错误码 | 场景 |
|---|---|
| `INVALID_JSON` | 请求体不是合法 JSON |
| `VALIDATION_ERROR` | 请求参数校验失败 |
| `INVALID_GITHUB_URL` | GitHub URL 不合法 |
| `GITHUB_NOT_FOUND` | GitHub 仓库或 README 不存在 |
| `GITHUB_RATE_LIMITED` | GitHub API 访问受限或限流 |
| `GITHUB_API_ERROR` | GitHub API 其他异常 |
| `OPENAI_CONFIG_ERROR` | AI 配置缺失 |
| `OPENAI_API_ERROR` | AI 接口调用失败 |
| `OPENAI_INVALID_RESPONSE` | AI 返回 JSON 结构不合法 |
| `INTERNAL_ERROR` | 未知服务端异常 |

## 7. 联调建议

### 7.1 本地联调前提

需要先配置：

- `DATABASE_URL`
- `DIRECT_URL`
- `GITHUB_TOKEN`
- `OPENAI_API_KEY`
- `OPENAI_BASE_URL`
- `OPENAI_MODEL`

### 7.2 启动本地服务

```bash
pnpm dev
```

### 7.3 快速测试命令

#### 分析仓库

```bash
curl -X POST http://localhost:3000/api/repos/analyze \
  -H "Content-Type: application/json" \
  -d '{"url":"https://github.com/vercel/next.js"}'
```

#### 获取列表

```bash
curl "http://localhost:3000/api/repos"
```

#### 关键词搜索

```bash
curl "http://localhost:3000/api/repos?keyword=React"
```

#### 分类筛选

```bash
curl --get --data-urlencode "category=开发工具" \
  "http://localhost:3000/api/repos"
```

#### 分组筛选

```bash
curl --get --data-urlencode "group=技术开发" \
  "http://localhost:3000/api/repos"
```

#### 获取详情

```bash
curl "http://localhost:3000/api/repos/<repo-id>"
```

## 8. 后续优化建议

- 统一所有接口的错误响应结构
- 为列表接口增加分页参数
- 为详情接口增加缓存控制策略
- 为分析接口增加任务队列或异步化能力
- 增加 OpenAPI 或 JSON Schema 导出
