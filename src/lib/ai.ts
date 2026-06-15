import { z } from "zod";

import { AppError } from "./errors";
import type { GitHubRepoInfo } from "./github";
import {
  CATEGORY_GROUPS_LIST,
  REPO_CATEGORIES,
  REPO_CATEGORY_GROUPS,
  type RepoCategory,
  type RepoCategoryGroup,
  getCategoryGroup,
} from "./repo-categories";

const aiAnalysisSchema = z.object({
  summary: z.string().trim().min(20).max(600),
  categoryGroup: z.enum(CATEGORY_GROUPS_LIST),
  category: z.enum(REPO_CATEGORIES),
  tags: z.array(z.string().trim().min(1).max(24)).min(3).max(6),
  analysisReason: z.string().trim().min(20).max(500),
});

export type RepoAiAnalysis = {
  summary: string;
  categoryGroup: RepoCategoryGroup;
  category: RepoCategory;
  tags: string[];
  analysisReason: string;
};

type OpenAICompatibleResponse = {
  choices?: Array<{
    message?: {
      content?:
        | string
        | Array<{
            type?: string;
            text?: string;
          }>;
    };
  }>;
  error?: {
    message?: string;
  };
};

type AnalyzeRepoWithAiInput = {
  repo: GitHubRepoInfo;
  readmeText: string | null;
  rootFiles: string[];
};

function getOpenAIConfig() {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL?.replace(/\/+$/, "") || "https://api.openai.com/v1";
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

  if (!apiKey) {
    throw new AppError("缺少 OPENAI_API_KEY，无法执行 AI 仓库分析。", 500, "OPENAI_CONFIG_ERROR");
  }

  return {
    apiKey,
    baseUrl,
    model,
  };
}

function truncate(value: string | null, maxLength: number): string {
  if (!value) {
    return "";
  }

  return value.length > maxLength ? `${value.slice(0, maxLength)}\n...[truncated]` : value;
}

function extractMessageContent(payload: OpenAICompatibleResponse): string {
  const content = payload.choices?.[0]?.message?.content;

  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .filter((item) => item.type === "text" && typeof item.text === "string")
      .map((item) => item.text)
      .join("\n");
  }

  throw new AppError("AI 响应缺少可解析的内容。", 502, "OPENAI_INVALID_RESPONSE");
}

function extractJson(content: string): unknown {
  try {
    return JSON.parse(content);
  } catch {
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");

    if (start >= 0 && end > start) {
      return JSON.parse(content.slice(start, end + 1));
    }
  }

  throw new AppError("AI 返回内容不是合法 JSON。", 502, "OPENAI_INVALID_RESPONSE");
}

function normalizeAnalysis(data: RepoAiAnalysis): RepoAiAnalysis {
  const tags = Array.from(
    new Set(
      data.tags
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  ).slice(0, 6);

  const categoryGroup = getCategoryGroup(data.category);

  return {
    summary: data.summary.trim(),
    categoryGroup,
    category: data.category,
    tags: tags.length >= 3 ? tags : ["GitHub", "开源", "仓库"],
    analysisReason: data.analysisReason.trim(),
  };
}

export async function analyzeRepoWithAi(
  input: AnalyzeRepoWithAiInput,
): Promise<RepoAiAnalysis> {
  const { apiKey, baseUrl, model } = getOpenAIConfig();

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: {
        type: "json_object",
      },
      messages: [
        {
          role: "system",
          content:
            "你是一个资深开源仓库分析助手。你必须只返回 JSON，不要输出 Markdown、解释文字或代码块。",
        },
        {
          role: "user",
          content: [
            "请根据以下 GitHub 仓库信息输出中文分析结果。",
            `分组与分类映射：${Object.entries(REPO_CATEGORY_GROUPS)
              .map(([group, cats]) => `${group}(${cats.join("/")})`)
              .join("、")}。`,
            `分类候选集：${REPO_CATEGORIES.join("、")}。`,
            `分组候选集：${CATEGORY_GROUPS_LIST.join("、")}。`,
            "输出 JSON 结构必须为：",
            '{"summary":"中文总结","categoryGroup":"分组之一","category":"该分组下的分类之一","tags":["标签1","标签2","标签3"],"analysisReason":"分类与标签判断理由"}',
            "要求：",
            "1. summary 使用 2 到 4 句中文，总结项目用途、适用场景和主要特点。",
            "2. category 必须严格来自给定候选集，categoryGroup 必须是该 category 所属的分组。",
            "3. tags 输出 3 到 6 个简洁中文标签，避免重复。",
            "4. analysisReason 用中文解释为何归入该分组和分类，以及标签判断依据。",
            `仓库全名：${input.repo.fullName}`,
            `仓库描述：${input.repo.description ?? "无"}`,
            `主语言：${input.repo.language}`,
            `Stars：${input.repo.stars}`,
            `Forks：${input.repo.forks}`,
            `Open Issues：${input.repo.openIssues}`,
            `License：${input.repo.license ?? "无"}`,
            `Topics：${input.repo.topics.join(", ") || "无"}`,
            `根目录文件：${input.rootFiles.join(", ") || "无"}`,
            `README 摘要：\n${truncate(input.readmeText, 12000) || "无 README"}`,
          ].join("\n"),
        },
      ],
    }),
  });

  const payload = (await response.json()) as OpenAICompatibleResponse;

  if (!response.ok) {
    throw new AppError(
      `AI 分析请求失败：${payload.error?.message ?? "未知错误"}`,
      502,
      "OPENAI_API_ERROR",
    );
  }

  const content = extractMessageContent(payload);
  const parsed = aiAnalysisSchema.safeParse(extractJson(content));

  if (!parsed.success) {
    throw new AppError("AI 返回结构不符合预期。", 502, "OPENAI_INVALID_RESPONSE");
  }

  return normalizeAnalysis(parsed.data);
}
