import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { AppError, isAppError } from "@/src/lib/errors";
import { analyzeAndSaveRepo } from "@/src/lib/repo-analyzer";
import { analyzeRepoRequestSchema } from "@/src/lib/validators";

export const runtime = "nodejs";

function createErrorResponse(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "请求参数校验失败。",
          details: error.flatten(),
        },
      },
      { status: 400 },
    );
  }

  if (isAppError(error)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      },
      { status: error.statusCode },
    );
  }

  return NextResponse.json(
    {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "服务器内部错误，请稍后重试。",
      },
    },
    { status: 500 },
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsedBody = analyzeRepoRequestSchema.parse(body);
    const repo = await analyzeAndSaveRepo(parsedBody);

    return NextResponse.json({
      success: true,
      data: repo,
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return createErrorResponse(
        new AppError("请求体必须是合法 JSON。", 400, "INVALID_JSON"),
      );
    }

    return createErrorResponse(error);
  }
}
