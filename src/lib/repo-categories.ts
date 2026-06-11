export const REPO_CATEGORIES = [
  "前端应用",
  "后端服务",
  "全栈项目",
  "移动应用",
  "AI/LLM",
  "数据科学",
  "开发工具",
  "基础设施",
  "游戏",
  "教育学习",
  "区块链",
  "其他",
] as const;

export type RepoCategory = (typeof REPO_CATEGORIES)[number];
