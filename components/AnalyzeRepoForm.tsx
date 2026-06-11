"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type {
  AnalyzeRepoSuccessResponse,
  ApiErrorResponse,
  RepoDetail,
} from "@/types/repo";

const DEFAULT_URL = "https://github.com/vercel/next.js";

function getErrorMessage(payload: ApiErrorResponse | null) {
  return payload?.error?.message ?? "分析失败，请稍后重试。";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function AnalyzeRepoForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RepoDetail | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/repos/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const payload = (await response.json()) as
        | AnalyzeRepoSuccessResponse
        | ApiErrorResponse;

      if (!response.ok || !("success" in payload) || !payload.success) {
        setResult(null);
        setError(getErrorMessage(payload as ApiErrorResponse));
        return;
      }

      setResult(payload.data);
      router.refresh();
    } catch {
      setResult(null);
      setError("网络异常，请检查本地服务或稍后重试。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-zinc-200">
            输入公开 GitHub 仓库地址
          </span>
          <input
            type="url"
            inputMode="url"
            placeholder={DEFAULT_URL}
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
          />
        </label>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "分析中..." : "开始分析并入库"}
          </button>

          <button
            type="button"
            onClick={() => setUrl(DEFAULT_URL)}
            className="rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-white/20 hover:bg-white/5"
          >
            填入示例地址
          </button>

          <Link
            href="/repos"
            className="rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-white/20 hover:bg-white/5"
          >
            浏览仓库目录
          </Link>
        </div>
      </form>

      {error ? (
        <div className="rounded-3xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="rounded-3xl border border-emerald-400/30 bg-emerald-400/10 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-emerald-200">
                分析完成并已保存
              </p>
              <h3 className="text-2xl font-semibold text-white">
                {result.fullName}
              </h3>
              <p className="max-w-3xl text-sm leading-6 text-emerald-50/90">
                {result.summary}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/repos/${result.id}`}
                className="inline-flex items-center justify-center rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-zinc-950 shadow-sm shadow-cyan-950/20 transition hover:bg-cyan-200"
              >
                查看详情
              </Link>
              <a
                href={result.htmlUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
              >
                打开 GitHub
              </a>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-xs text-emerald-50/85">
            <span className="rounded-full border border-white/15 px-3 py-1">
              分类: {result.category}
            </span>
            <span className="rounded-full border border-white/15 px-3 py-1">
              标签: {result.tags.join(" / ")}
            </span>
            <span className="rounded-full border border-white/15 px-3 py-1">
              分析时间: {formatDate(result.analyzedAt)}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
