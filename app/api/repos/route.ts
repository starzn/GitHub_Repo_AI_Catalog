import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/src/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get("category")?.trim();
  const keyword = searchParams.get("keyword")?.trim();

  const where: Prisma.GithubRepoWhereInput = {
    ...(category
      ? {
          category: {
            equals: category,
            mode: "insensitive",
          },
        }
      : {}),
    ...(keyword
      ? {
          OR: [
            {
              owner: {
                contains: keyword,
                mode: "insensitive",
              },
            },
            {
              name: {
                contains: keyword,
                mode: "insensitive",
              },
            },
            {
              fullName: {
                contains: keyword,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: keyword,
                mode: "insensitive",
              },
            },
            {
              summary: {
                contains: keyword,
                mode: "insensitive",
              },
            },
            {
              language: {
                contains: keyword,
                mode: "insensitive",
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

  const repos = await prisma.githubRepo.findMany({
    where,
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

  return NextResponse.json({
    items: repos,
    total: repos.length,
  });
}
