"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeftIcon,
  ArrowUpRightIcon,
  StarIcon,
  GitForkIcon,
  CircleIcon,
  CalendarIcon,
  ClockIcon,
  CodeIcon,
  ScalesIcon,
} from "@phosphor-icons/react";

import type { ApiErrorResponse, RepoDetail } from "@/types/repo";

import { CategoryBadge } from "./CategoryBadge";
import { TagList } from "./TagList";

type RepoDetailViewProps = {
  repoId: string;
};

const metricIcons: Record<string, typeof StarIcon> = {
  Stars: StarIcon,
  Forks: GitForkIcon,
  "Open Issues": CircleIcon,
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
      <div className="space-y-5">
        <div className="h-10 w-56 animate-shimmer rounded-xl" />
        <div className="h-44 animate-shimmer rounded-2xl" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 animate-shimmer rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="py-20 text-center">
        <p className="text-xl font-semibold text-white">仓库不存在</p>
        <p className="mt-2 text-sm text-text-secondary">
          当前 ID 没有对应的已分析仓库。
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/repos"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:opacity-90"
          >
            返回列表
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary transition hover:border-white/15 hover:text-white"
          >
            回到首页
          </Link>
        </div>
      </div>
    );
  }

  if (error || !repo) {
    return (
      <div className="rounded-xl border border-rose-500/20 bg-rose-500/8 p-5 text-sm text-rose-200">
        {error ?? "仓库详情暂时不可用。"}
      </div>
    );
  }

  const metrics = [
    { label: "主要语言", value: repo.language, icon: CodeIcon },
    {
      label: "Stars",
      value: repo.stars.toLocaleString("zh-CN"),
      icon: StarIcon,
    },
    {
      label: "Forks",
      value: repo.forks.toLocaleString("zh-CN"),
      icon: GitForkIcon,
    },
    {
      label: "Open Issues",
      value: repo.openIssues.toLocaleString("zh-CN"),
      icon: CircleIcon,
    },
    { label: "License", value: repo.license || "无", icon: ScalesIcon },
    {
      label: "最近分析",
      value: formatDate(repo.analyzedAt),
      icon: ClockIcon,
    },
    {
      label: "创建时间",
      value: formatDate(repo.createdAt),
      icon: CalendarIcon,
    },
    {
      label: "最近更新",
      value: formatDate(repo.updatedAt),
      icon: CalendarIcon,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <CategoryBadge category={repo.category} />
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {repo.fullName}
          </h1>
          <p className="max-w-3xl text-base leading-7 text-text-secondary">
            {repo.description || "该仓库暂未提供描述。"}
          </p>
        </div>

        <div className="flex gap-2">
          <a
            href={repo.htmlUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:opacity-90"
          >
            打开 GitHub
            <ArrowUpRightIcon size={14} weight="bold" />
          </a>
          <Link
            href="/repos"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary transition hover:border-white/15 hover:text-white"
          >
            <ArrowLeftIcon size={14} />
            返回列表
          </Link>
        </div>
      </div>

      <section className="rounded-2xl border border-border bg-surface p-6">
        <p className="text-sm font-medium text-text-tertiary">AI 总结</p>
        <p className="mt-3 text-base leading-8 text-white">{repo.summary}</p>

        <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:gap-8">
          <div>
            <p className="text-sm font-medium text-text-tertiary">分析标签</p>
            <div className="mt-2">
              <TagList tags={repo.tags} />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-text-tertiary">判断依据</p>
            <p className="mt-2 text-sm leading-7 text-text-secondary">
              {repo.analysisReason}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-xl border border-border bg-surface p-4 transition hover:border-accent/15 hover:bg-surface-elevated"
          >
            <div className="flex items-center gap-2">
              <Icon size={16} weight="duotone" className="text-accent" />
              <p className="text-xs text-text-tertiary">{label}</p>
            </div>
            <p className="mt-2 text-lg font-semibold text-white">{value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <p className="text-sm font-medium text-text-tertiary">Topics</p>
          <div className="mt-3">
            <TagList tags={repo.topics} emptyLabel="该仓库暂无 Topics。" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6">
          <p className="text-sm font-medium text-text-tertiary">README 摘要</p>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-text-secondary line-clamp-[12]">
            {repo.readmeText
              ? `${repo.readmeText.slice(0, 900)}${repo.readmeText.length > 900 ? "..." : ""}`
              : "该仓库未获取到 README 内容。"}
          </p>
        </div>
      </section>
    </div>
  );
}
