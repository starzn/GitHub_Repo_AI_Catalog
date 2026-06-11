"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { ApiErrorResponse, RepoDetail } from "@/types/repo";

import { CategoryBadge } from "./CategoryBadge";
import { TagList } from "./TagList";

type RepoDetailViewProps = {
  repoId: string;
};

function getErrorMessage(payload: ApiErrorResponse | null) {
  return payload?.error?.message ?? "仓库详情加载失败，请稍后重试。";
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

export function RepoDetailView({ repoId }: RepoDetailViewProps) {
  const [repo, setRepo] = useState<RepoDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadRepo() {
      setLoading(true);
      setError(null);
      setNotFound(false);

      try {
        const response = await fetch(`/api/repos/${repoId}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const payload = (await response.json()) as RepoDetail | ApiErrorResponse;

        if (response.status === 404) {
          setRepo(null);
          setNotFound(true);
          return;
        }

        if (!response.ok || !("id" in payload)) {
          setRepo(null);
          setError(getErrorMessage(payload as ApiErrorResponse));
          return;
        }

        setRepo(payload);
      } catch (fetchError) {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
          return;
        }

        setRepo(null);
        setError("网络异常，暂时无法获取仓库详情。");
      } finally {
        setLoading(false);
      }
    }

    void loadRepo();

    return () => controller.abort();
  }, [repoId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-12 w-48 animate-pulse rounded-2xl bg-white/10" />
        <div className="h-40 animate-pulse rounded-3xl bg-white/4" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-3xl bg-white/4"
            />
          ))}
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="rounded-3xl border border-dashed border-white/15 bg-black/20 p-10 text-center">
        <h1 className="text-2xl font-semibold text-white">仓库不存在</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          当前 ID 没有对应的已分析仓库，可以返回列表页重新选择。
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/repos"
            className="rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-300"
          >
            返回列表
          </Link>
          <Link
            href="/"
            className="rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-white/20 hover:bg-white/5"
          >
            回到首页
          </Link>
        </div>
      </div>
    );
  }

  if (error || !repo) {
    return (
      <div className="rounded-3xl border border-rose-400/30 bg-rose-400/10 p-6 text-sm text-rose-100">
        {error ?? "仓库详情暂时不可用。"}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-4">
          <CategoryBadge category={repo.category} />
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight text-white">
              {repo.fullName}
            </h1>
            <p className="max-w-3xl text-base leading-7 text-zinc-300">
              {repo.description || "该仓库暂未提供描述。"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href={repo.htmlUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-300"
          >
            打开 GitHub
          </a>
          <Link
            href="/repos"
            className="rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-white/20 hover:bg-white/5"
          >
            返回列表
          </Link>
        </div>
      </div>

      <section className="rounded-3xl border border-white/10 bg-white/3 p-6">
        <p className="text-sm uppercase tracking-[0.24em] text-zinc-500">
          AI 总结
        </p>
        <p className="mt-4 text-base leading-8 text-zinc-100">{repo.summary}</p>

        <div className="mt-6">
          <p className="text-sm font-medium text-zinc-200">分析标签</p>
          <div className="mt-3">
            <TagList tags={repo.tags} />
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm font-medium text-zinc-200">判断依据</p>
          <p className="mt-3 text-sm leading-7 text-zinc-300">
            {repo.analysisReason}
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["主要语言", repo.language],
          ["Stars", repo.stars.toLocaleString("zh-CN")],
          ["Forks", repo.forks.toLocaleString("zh-CN")],
          ["Open Issues", repo.openIssues.toLocaleString("zh-CN")],
          ["License", repo.license || "无"],
          ["最近分析", formatDate(repo.analyzedAt)],
          ["创建时间", formatDate(repo.createdAt)],
          ["最近更新", formatDate(repo.updatedAt)],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-3xl border border-white/10 bg-white/3 p-5"
          >
            <p className="text-sm text-zinc-500">{label}</p>
            <p className="mt-3 text-lg font-semibold text-white">{value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-white/10 bg-white/3 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-zinc-500">
            Topics
          </p>
          <div className="mt-4">
            <TagList tags={repo.topics} emptyLabel="该仓库暂无 Topics。" />
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/3 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-zinc-500">
            README 摘要
          </p>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-zinc-300">
            {repo.readmeText
              ? `${repo.readmeText.slice(0, 900)}${repo.readmeText.length > 900 ? "..." : ""}`
              : "该仓库未获取到 README 内容。"}
          </p>
        </div>
      </section>
    </div>
  );
}
