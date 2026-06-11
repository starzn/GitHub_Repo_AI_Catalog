import { z } from "zod";

import { AppError } from "@/src/lib/errors";

const GITHUB_HOSTS = new Set(["github.com", "www.github.com"]);

export type ParsedGitHubRepoUrl = {
  owner: string;
  name: string;
  fullName: string;
  htmlUrl: string;
};

function normalizeGitHubUrl(input: string): string {
  if (/^https?:\/\//i.test(input)) {
    return input;
  }

  return `https://${input}`;
}

export function parseGitHubRepoUrl(input: string): ParsedGitHubRepoUrl {
  const value = input.trim();

  if (!value) {
    throw new AppError("GitHub 仓库地址不能为空。", 400, "INVALID_GITHUB_URL");
  }

  let url: URL;

  try {
    url = new URL(normalizeGitHubUrl(value));
  } catch {
    throw new AppError("GitHub 仓库地址格式无效。", 400, "INVALID_GITHUB_URL");
  }

  if (!GITHUB_HOSTS.has(url.hostname.toLowerCase())) {
    throw new AppError("仅支持 github.com 的公开仓库地址。", 400, "INVALID_GITHUB_URL");
  }

  const segments = url.pathname.split("/").filter(Boolean);

  if (segments.length !== 2) {
    throw new AppError(
      "请提供标准仓库地址，例如 https://github.com/vercel/next.js 。",
      400,
      "INVALID_GITHUB_URL",
    );
  }

  const [owner, rawRepoName] = segments;
  const name = rawRepoName.replace(/\.git$/i, "");
  const segmentPattern = /^[A-Za-z0-9._-]+$/;

  if (!segmentPattern.test(owner) || !segmentPattern.test(name)) {
    throw new AppError("GitHub 仓库地址包含非法字符。", 400, "INVALID_GITHUB_URL");
  }

  return {
    owner,
    name,
    fullName: `${owner}/${name}`,
    htmlUrl: `https://github.com/${owner}/${name}`,
  };
}

export const analyzeRepoRequestSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, "GitHub 仓库地址不能为空。")
    .superRefine((value, ctx) => {
      try {
        parseGitHubRepoUrl(value);
      } catch (error) {
        ctx.addIssue({
          code: "custom",
          message: error instanceof Error ? error.message : "GitHub 仓库地址无效。",
        });
      }
    }),
});

export type AnalyzeRepoRequest = z.infer<typeof analyzeRepoRequestSchema>;
