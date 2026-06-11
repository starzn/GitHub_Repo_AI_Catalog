"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

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
    <div className="space-y-8">
      <form
        className="grid gap-4 rounded-3xl border border-white/10 bg-white/3 p-5 md:grid-cols-[1fr_220px_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          updateSearchParams(category, String(formData.get("keyword") ?? ""));
        }}
      >
        <label className="space-y-2">
          <span className="text-sm font-medium text-zinc-200">关键词搜索</span>
          <input
            key={keyword}
            ref={keywordInputRef}
            name="keyword"
            defaultValue={keyword}
            placeholder="搜索仓库名、描述、总结、语言或标签"
            className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-zinc-200">分类筛选</span>
          <select
            value={category}
            onChange={(event) =>
              updateSearchParams(
                event.target.value,
                keywordInputRef.current?.value ?? keyword,
              )
            }
            className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
          >
            <option value="">全部分类</option>
            {REPO_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-end gap-3">
          <button
            type="submit"
            className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-300"
          >
            搜索
          </button>

          {hasFilters ? (
            <button
              type="button"
              onClick={() => {
                if (keywordInputRef.current) {
                  keywordInputRef.current.value = "";
                }
                updateSearchParams("", "");
              }}
              className="rounded-full border border-white/10 px-5 py-3 text-sm font-medium text-zinc-200 transition hover:border-white/20 hover:bg-white/5"
            >
              清空
            </button>
          ) : null}
        </div>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-400">
        <p>共收录 {total} 个已分析仓库，默认按 Stars 降序展示。</p>
        <p>支持分类筛选与关键词检索。</p>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-72 animate-pulse rounded-3xl border border-white/10 bg-white/3"
            />
          ))}
        </div>
      ) : null}

      {!loading && error ? (
        <div className="rounded-3xl border border-rose-400/30 bg-rose-400/10 p-6 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/15 bg-black/20 p-10 text-center">
          <h2 className="text-xl font-semibold text-white">暂无匹配仓库</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            {hasFilters
              ? "当前筛选条件下没有结果，请尝试更换分类或关键词。"
              : "还没有分析过仓库，先回到首页提交一个 GitHub 地址吧。"}
          </p>
        </div>
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((repo) => (
            <RepoCard key={repo.id} repo={repo} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
