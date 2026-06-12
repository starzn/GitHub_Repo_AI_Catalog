"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRightIcon, LightningIcon } from "@phosphor-icons/react";

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
        headers: { "Content-Type": "application/json" },
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
    <div className="space-y-5">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <input
              type="url"
              inputMode="url"
              placeholder={DEFAULT_URL}
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 pr-12 text-sm text-white outline-none transition placeholder:text-text-tertiary focus:border-accent/40 focus:ring-1 focus:ring-accent/20"
            />
            <LightningIcon
              size={18}
              weight="fill"
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:opacity-90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-950/30 border-t-zinc-950" />
                分析中
              </>
            ) : (
              <>
                开始分析
                <ArrowRightIcon size={16} weight="bold" />
              </>
            )}
          </button>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setUrl(DEFAULT_URL)}
            className="text-sm text-text-tertiary transition hover:text-text-secondary"
          >
            填入示例地址
          </button>
          <Link
            href="/repos"
            className="text-sm text-text-tertiary transition hover:text-text-secondary"
          >
            浏览仓库目录
          </Link>
        </div>
      </form>

      {error && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/8 p-4 text-sm text-rose-200">
          {error}
        </div>
      )}

      {result && (
        <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-6 animate-fade-in">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-emerald-300">
                分析完成并已保存
              </p>
              <h3 className="text-2xl font-semibold text-white">
                {result.fullName}
              </h3>
              <p className="max-w-2xl text-sm leading-6 text-text-secondary">
                {result.summary}
              </p>
            </div>

            <div className="flex gap-2">
              <Link
                href={`/repos/${result.id}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:opacity-90"
              >
                查看详情
                <ArrowRightIcon size={14} weight="bold" />
              </Link>
              <a
                href={result.htmlUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary transition hover:border-white/15 hover:text-white"
              >
                GitHub
              </a>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs text-text-tertiary">
            <span className="rounded-md border border-border bg-surface px-2.5 py-1">
              {result.category}
            </span>
            <span className="rounded-md border border-border bg-surface px-2.5 py-1">
              {result.tags.join(" / ")}
            </span>
            <span className="rounded-md border border-border bg-surface px-2.5 py-1">
              {formatDate(result.analyzedAt)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
