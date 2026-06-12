import { Prisma } from "@prisma/client";

import prisma from "@/src/lib/prisma";
import type { RepoListItem, RepoListResponse } from "@/types/repo";

type RepoListQuery = {
  category?: string | null;
  keyword?: string | null;
};

function normalizeQueryValue(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function buildRepoListWhere({
  category,
  keyword,
}: {
  category?: string;
  keyword?: string;
}): Prisma.GithubRepoWhereInput {
  return {
    ...(category
      ? {
          category: {
            equals: category,
            mode: "insensitive" as const,
          },
        }
      : {}),
    ...(keyword
      ? {
          OR: [
            {
              owner: {
                contains: keyword,
                mode: "insensitive" as const,
              },
            },
            {
              name: {
                contains: keyword,
                mode: "insensitive" as const,
              },
            },
            {
              fullName: {
                contains: keyword,
                mode: "insensitive" as const,
              },
            },
            {
              description: {
                contains: keyword,
                mode: "insensitive" as const,
              },
            },
            {
              summary: {
                contains: keyword,
                mode: "insensitive" as const,
              },
            },
            {
              language: {
                contains: keyword,
                mode: "insensitive" as const,
              },
            },
            {
              tags: {
                has: keyword,
              },
            },
            {
              topics: {
                has: keyword,
              },
            },
          ],
        }
      : {}),
  };
}

function serializeRepoListItem(item: {
  id: string;
  owner: string;
  name: string;
  fullName: string;
  htmlUrl: string;
  description: string | null;
  summary: string;
  category: string;
  tags: string[];
  language: string;
  stars: number;
  updatedAt: Date;
}): RepoListItem {
  return {
    ...item,
    updatedAt: item.updatedAt.toISOString(),
  };
}

export async function getRepoList({
  category,
  keyword,
}: RepoListQuery = {}): Promise<RepoListResponse> {
  const normalizedCategory = normalizeQueryValue(category);
  const normalizedKeyword = normalizeQueryValue(keyword);

  const repos = await prisma.githubRepo.findMany({
    where: buildRepoListWhere({
      category: normalizedCategory,
      keyword: normalizedKeyword,
    }),
    orderBy: [{ stars: "desc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      owner: true,
      name: true,
      fullName: true,
      htmlUrl: true,
      description: true,
      summary: true,
      category: true,
      tags: true,
      language: true,
      stars: true,
      updatedAt: true,
    },
  });

  return {
    items: repos.map(serializeRepoListItem),
    total: repos.length,
  };
}
