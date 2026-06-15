import { NextRequest, NextResponse } from "next/server";

import { getRepoList } from "@/src/lib/repo-list";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const payload = await getRepoList({
    group: searchParams.get("group"),
    category: searchParams.get("category"),
    keyword: searchParams.get("keyword"),
  });

  return NextResponse.json(payload);
}
