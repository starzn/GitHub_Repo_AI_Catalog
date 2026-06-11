import { NextResponse } from "next/server";

import prisma from "@/src/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  const repo = await prisma.githubRepo.findUnique({
    where: { id },
  });

  if (!repo) {
    return NextResponse.json(
      {
        error: "仓库不存在",
      },
      {
        status: 404,
      }
    );
  }

  return NextResponse.json(repo);
}
