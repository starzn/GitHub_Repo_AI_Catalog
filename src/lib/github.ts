import { AppError } from "./errors";
import type { ParsedGitHubRepoUrl } from "./validators";

type GitHubRepoApiResponse = {
  full_name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  topics?: string[];
  license?: {
    spdx_id: string | null;
    name: string | null;
  } | null;
};

type GitHubReadmeApiResponse = {
  content?: string;
  encoding?: string;
};

type GitHubContentApiResponse = Array<{
  name: string;
  type: "file" | "dir" | "symlink" | "submodule";
}>;

export type GitHubRepoInfo = {
  owner: string;
  name: string;
  fullName: string;
  htmlUrl: string;
  description: string | null;
  language: string;
  stars: number;
  forks: number;
  openIssues: number;
  license: string | null;
  topics: string[];
};

export type GitHubRepoSnapshot = {
  repo: GitHubRepoInfo;
  readmeText: string | null;
  rootFiles: string[];
};

function getGitHubHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "User-Agent": "github-repo-ai-catalog",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

async function fetchGitHub<T>(path: string): Promise<T> {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: getGitHubHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    let message = "GitHub API 请求失败。";

    try {
      const payload = (await response.json()) as { message?: string };
      if (payload.message) {
        message = payload.message;
      }
    } catch {
      // Ignore JSON parse failure and keep default message.
    }

    if (response.status === 404) {
      throw new AppError("GitHub 仓库不存在，或 README/目录不可访问。", 404, "GITHUB_NOT_FOUND");
    }

    if (response.status === 403) {
      throw new AppError(
        `GitHub API 访问受限：${message}`,
        502,
        "GITHUB_RATE_LIMITED",
      );
    }

    throw new AppError(`GitHub API 请求失败：${message}`, 502, "GITHUB_API_ERROR");
  }

  return (await response.json()) as T;
}

function decodeBase64(content: string): string {
  return Buffer.from(content.replace(/\n/g, ""), "base64").toString("utf8");
}

export async function getGitHubRepoInfo(
  parsedUrl: ParsedGitHubRepoUrl,
): Promise<GitHubRepoInfo> {
  const data = await fetchGitHub<GitHubRepoApiResponse>(
    `/repos/${parsedUrl.owner}/${parsedUrl.name}`,
  );

  return {
    owner: parsedUrl.owner,
    name: parsedUrl.name,
    fullName: data.full_name ?? parsedUrl.fullName,
    htmlUrl: data.html_url ?? parsedUrl.htmlUrl,
    description: data.description,
    language: data.language ?? "Unknown",
    stars: data.stargazers_count ?? 0,
    forks: data.forks_count ?? 0,
    openIssues: data.open_issues_count ?? 0,
    license: data.license?.spdx_id ?? data.license?.name ?? null,
    topics: data.topics ?? [],
  };
}

export async function getGitHubReadme(
  parsedUrl: ParsedGitHubRepoUrl,
): Promise<string | null> {
  const response = await fetch(
    `https://api.github.com/repos/${parsedUrl.owner}/${parsedUrl.name}/readme`,
    {
      headers: getGitHubHeaders(),
      cache: "no-store",
    },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    let message = "README 获取失败。";

    try {
      const payload = (await response.json()) as { message?: string };
      if (payload.message) {
        message = payload.message;
      }
    } catch {
      // Ignore JSON parse failure and keep default message.
    }

    throw new AppError(`GitHub README 获取失败：${message}`, 502, "GITHUB_API_ERROR");
  }

  const payload = (await response.json()) as GitHubReadmeApiResponse;

  if (!payload.content || payload.encoding !== "base64") {
    return null;
  }

  return decodeBase64(payload.content);
}

export async function getGitHubRootFiles(
  parsedUrl: ParsedGitHubRepoUrl,
): Promise<string[]> {
  const entries = await fetchGitHub<GitHubContentApiResponse>(
    `/repos/${parsedUrl.owner}/${parsedUrl.name}/contents`,
  );

  return entries.map((entry) => (entry.type === "dir" ? `${entry.name}/` : entry.name));
}

export async function getGitHubRepoSnapshot(
  parsedUrl: ParsedGitHubRepoUrl,
): Promise<GitHubRepoSnapshot> {
  const [repo, readmeText, rootFiles] = await Promise.all([
    getGitHubRepoInfo(parsedUrl),
    getGitHubReadme(parsedUrl),
    getGitHubRootFiles(parsedUrl),
  ]);

  return {
    repo,
    readmeText,
    rootFiles,
  };
}
