"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MagnifyingGlassIcon, FunnelIcon, XIcon } from "@phosphor-icons/react";

import { REPO_CATEGORIES } from "@/src/lib/repo-categories";
import type { ApiErrorResponse, RepoListItem, RepoListResponse } from "@/types/repo";

import { RepoCard } from "./RepoCard";

function getErrorMessage(payload: ApiErrorResponse | null) {
  return payload?.error?.message ?? "仓库列表加载失败，请稍后重试。";
}

export function RepoList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const category = searchParams.get("category") ?? "";
  const keyword = searchParams.get("keyword") ?? "";

  const [items, setItems] = useState<RepoListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const keywordInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadRepos() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();

        if (category) {
          params.set("category", category);
        }

        if (keyword) {
          params.set("keyword", keyword);
        }

        const query = params.toString();
        const response = await fetch(`/api/repos${query ? `?${query}` : ""}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const payload = (await response.json()) as RepoListResponse | ApiErrorResponse;

        if (!response.ok || !("items" in payload)) {
          setItems([]);
          setTotal(0);
          setError(getErrorMessage(payload as ApiErrorResponse));
          return;
        }

        setItems(payload.items);
        setTotal(payload.total);
      } catch (fetchError) {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
          return;
        }

        setItems([]);
        setTotal(0);
        setError("网络异常，暂时无法获取仓库列表。");
      } finally {
        setLoading(false);
      }
    }

    void loadRepos();

    return () => controller.abort();
  }, [category, keyword]);

  const hasFilters = useMemo(
    () => Boolean(category || keyword.trim()),
    [category, keyword],
  );

  function updateSearchParams(nextCategory: string, nextKeyword: string) {
    const params = new URLSearchParams();

    if (nextCategory) {
      params.set("category", nextCategory);
    }

    if (nextKeyword.trim()) {
      params.set("keyword", nextKeyword.trim());
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="space-y-6">
      <form
        className="flex flex-wrap gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          updateSearchParams(category, String(formData.get("keyword") ?? ""));
        }}
      >
        <div className="relative min-w-[240px] flex-1">
          <MagnifyingGlassIcon
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary"
          />
          <input
            key={keyword}
            ref={keywordInputRef}
            name="keyword"
            defaultValue={keyword}
            placeholder="搜索仓库名、描述、总结、语言或标签"
            className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-text-tertiary focus:border-accent/40 focus:ring-1 focus:ring-accent/20"
          />
        </div>

        <div className="relative">
          <FunnelIcon
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary"
          />
          <select
            value={category}
            onChange={(event) =>
              updateSearchParams(
                event.target.value,
                keywordInputRef.current?.value ?? keyword,
              )
            }
            className="appearance-none rounded-xl border border-border bg-surface py-2.5 pl-10 pr-10 text-sm text-white outline-none transition focus:border-accent/40 focus:ring-1 focus:ring-accent/20"
          >
            <option value="">全部分类</option>
            {REPO_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              if (keywordInputRef.current) {
                keywordInputRef.current.value = "";
              }
              updateSearchParams("", "");
            }}
            className="flex items-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-sm text-text-secondary transition hover:border-white/15 hover:text-white"
          >
            <XIcon size={14} />
            清空筛选
          </button>
        )}
      </form>

      <p className="text-sm text-text-tertiary">
        共 {total} 个仓库，按 Stars 降序
      </p>

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-64 animate-shimmer rounded-2xl border border-border"
            />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/8 p-5 text-sm text-rose-200">
          {error}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="rounded-xl border border-dashed border-border py-20 text-center">
          <p className="text-lg font-medium text-white">暂无匹配仓库</p>
          <p className="mt-2 text-sm text-text-tertiary">
            {hasFilters
              ? "当前筛选条件下没有结果，请尝试更换分类或关键词。"
              : "还没有分析过仓库，先回到首页提交一个 GitHub 地址吧。"}
          </p>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((repo) => (
            <RepoCard key={repo.id} repo={repo} />
          ))}
        </div>
      )}
    </div>
  );
}
