export const REPO_CATEGORY_GROUPS = {
  技术开发: ["前端应用", "后端服务", "全栈项目", "移动应用", "开发工具", "基础设施"],
  "数据与AI": ["AI/LLM", "数据科学"],
  区块链与金融: ["区块链", "投资"],
  其他: ["游戏", "教育学习", "其他"],
} as const;

export type RepoCategoryGroup = keyof typeof REPO_CATEGORY_GROUPS;

type CategoryValue<G extends RepoCategoryGroup> = (typeof REPO_CATEGORY_GROUPS)[G][number];

export type RepoCategory = {
  [G in RepoCategoryGroup]: CategoryValue<G>;
}[RepoCategoryGroup];

export const CATEGORY_GROUPS_LIST = Object.keys(
  REPO_CATEGORY_GROUPS,
) as RepoCategoryGroup[];

export const REPO_CATEGORIES = Object.values(REPO_CATEGORY_GROUPS).flat() as readonly RepoCategory[];

const CATEGORY_TO_GROUP_MAP = new Map<string, RepoCategoryGroup>();

for (const [group, categories] of Object.entries(REPO_CATEGORY_GROUPS)) {
  for (const cat of categories) {
    CATEGORY_TO_GROUP_MAP.set(cat, group as RepoCategoryGroup);
  }
}

export function getCategoryGroup(category: string): RepoCategoryGroup {
  return CATEGORY_TO_GROUP_MAP.get(category) ?? "其他";
}

export function getCategoriesByGroup(group: RepoCategoryGroup): readonly string[] {
  return REPO_CATEGORY_GROUPS[group] ?? [];
}
