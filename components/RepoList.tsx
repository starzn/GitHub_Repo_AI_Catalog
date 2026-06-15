"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XIcon,
  CaretDownIcon,
  CheckIcon,
} from "@phosphor-icons/react";

import {
  CATEGORY_GROUPS_LIST,
  REPO_CATEGORY_GROUPS,
  type RepoCategoryGroup,
  getCategoriesByGroup,
} from "@/src/lib/repo-categories";
import type { RepoListItem } from "@/types/repo";

import { RepoCard } from "./RepoCard";

function GroupSelect({
  value,
  onChange,
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={[
          "flex items-center gap-2 rounded-xl border py-2.5 pl-3.5 pr-3 text-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-70",
          open
            ? "border-accent/40 ring-1 ring-accent/20 bg-surface text-white"
            : "border-border bg-surface text-text-secondary hover:border-white/15 hover:text-white",
        ].join(" ")}
      >
        <FunnelIcon
          size={16}
          weight="duotone"
          className="text-accent shrink-0"
        />
        <span className="whitespace-nowrap">{value || "全部分组"}</span>
        <CaretDownIcon
          size={14}
          className={[
            "shrink-0 transition-transform duration-200",
            open && "rotate-180",
          ].join(" ")}
        />
      </button>

      {open && (
        <div className="absolute left-0 z-50 mt-1.5 w-44 origin-top animate-fade-in rounded-xl border border-border bg-surface-elevated py-1 shadow-xl shadow-black/30 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 px-3.5 py-2 text-sm transition-colors hover:bg-white/5"
          >
            <span className="flex h-4 w-4 shrink-0 items-center justify-center">
              {!value && (
                <CheckIcon size={14} weight="bold" className="text-accent" />
              )}
            </span>
            全部分组
          </button>
          {CATEGORY_GROUPS_LIST.map((group) => (
            <button
              key={group}
              type="button"
              onClick={() => {
                onChange(group);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3.5 py-2 text-sm transition-colors hover:bg-white/5"
            >
              <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                {value === group && (
                  <CheckIcon size={14} weight="bold" className="text-accent" />
                )}
              </span>
              {group}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CategorySelect({
  value,
  onChange,
  group,
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  group: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const categories = useMemo(() => {
    if (!group) return null;
    return getCategoriesByGroup(group as RepoCategoryGroup);
  }, [group]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={[
          "flex items-center gap-2 rounded-xl border py-2.5 pl-3.5 pr-3 text-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-70",
          open
            ? "border-accent/40 ring-1 ring-accent/20 bg-surface text-white"
            : "border-border bg-surface text-text-secondary hover:border-white/15 hover:text-white",
        ].join(" ")}
      >
        <FunnelIcon
          size={16}
          weight="duotone"
          className="text-accent shrink-0"
        />
        <span className="whitespace-nowrap">{value || "全部分类"}</span>
        <CaretDownIcon
          size={14}
          className={[
            "shrink-0 transition-transform duration-200",
            open && "rotate-180",
          ].join(" ")}
        />
      </button>

      {open && (
        <div className="absolute left-0 z-50 mt-1.5 w-44 origin-top animate-fade-in rounded-xl border border-border bg-surface-elevated py-1 shadow-xl shadow-black/30 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 px-3.5 py-2 text-sm transition-colors hover:bg-white/5"
          >
            <span className="flex h-4 w-4 shrink-0 items-center justify-center">
              {!value && (
                <CheckIcon size={14} weight="bold" className="text-accent" />
              )}
            </span>
            全部分类
          </button>
          {(categories ?? Object.values(REPO_CATEGORY_GROUPS).flat()).map(
            (cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  onChange(cat);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3.5 py-2 text-sm transition-colors hover:bg-white/5"
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                  {value === cat && (
                    <CheckIcon
                      size={14}
                      weight="bold"
                      className="text-accent"
                    />
                  )}
                </span>
                {cat}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}

type RepoListProps = {
  items: RepoListItem[];
  total: number;
};

export function RepoList({ items, total }: RepoListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const group = searchParams.get("group") ?? "";
  const category = searchParams.get("category") ?? "";
  const keyword = searchParams.get("keyword") ?? "";

  const keywordInputRef = useRef<HTMLInputElement | null>(null);

  const hasFilters = useMemo(
    () => Boolean(group || category || keyword.trim()),
    [group, category, keyword],
  );

  function updateSearchParams(
    nextGroup: string,
    nextCategory: string,
    nextKeyword: string,
  ) {
    const params = new URLSearchParams();

    if (nextGroup) {
      params.set("group", nextGroup);
    }

    if (nextCategory) {
      params.set("category", nextCategory);
    }

    if (nextKeyword.trim()) {
      params.set("keyword", nextKeyword.trim());
    }

    const query = params.toString();
    const currentQuery = searchParams.toString();

    if (query === currentQuery) {
      return;
    }

    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname);
    });
  }

  return (
    <div className="space-y-6">
      <div
        className={[
          "rounded-2xl p-2 transition-colors duration-200",
          isPending ? "repo-filter-pending" : "",
        ].join(" ")}
      >
        <form
          aria-busy={isPending}
          className={[
            "flex flex-wrap gap-3 transition-opacity duration-200",
            isPending ? "opacity-90" : "opacity-100",
          ].join(" ")}
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            updateSearchParams(
              group,
              category,
              String(formData.get("keyword") ?? ""),
            );
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
              disabled={isPending}
              className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-text-tertiary focus:border-accent/40 focus:ring-1 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-70"
            />
          </div>

          <GroupSelect
            key={`group-${group}-${isPending ? "pending" : "idle"}`}
            value={group}
            disabled={isPending}
            onChange={(v) => {
              const nextKeyword =
                keywordInputRef.current?.value ?? keyword;
              updateSearchParams(v, "", nextKeyword);
            }}
          />

          <CategorySelect
            key={`cat-${group}-${category}-${isPending ? "pending" : "idle"}`}
            value={category}
            group={group}
            disabled={isPending}
            onChange={(v) =>
              updateSearchParams(
                group,
                v,
                keywordInputRef.current?.value ?? keyword,
              )
            }
          />

          {hasFilters && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                if (keywordInputRef.current) {
                  keywordInputRef.current.value = "";
                }
                updateSearchParams("", "", "");
              }}
              className="flex items-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-sm text-text-secondary transition hover:border-white/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              <XIcon size={14} />
              清空筛选
            </button>
          )}
        </form>

        <div
          aria-live="polite"
          className="min-h-5 px-1 pt-2 text-sm text-text-tertiary"
        >
          {isPending ? "正在更新筛选结果..." : null}
        </div>
      </div>

      <p className="text-sm text-text-tertiary">
        共 {total} 个仓库，按 Stars 降序
      </p>

      {items.length === 0 && (
        <div className="rounded-xl border border-dashed border-border py-20 text-center">
          <p className="text-lg font-medium text-white">暂无匹配仓库</p>
          <p className="mt-2 text-sm text-text-tertiary">
            {hasFilters
              ? "当前筛选条件下没有结果，请尝试更换分组、分类或关键词。"
              : "还没有分析过仓库，先回到首页提交一个 GitHub 地址吧。"}
          </p>
        </div>
      )}

      {items.length > 0 && (
        <div
          className={[
            "grid gap-4 transition-opacity duration-200 sm:grid-cols-2 lg:grid-cols-3",
            isPending ? "opacity-85" : "opacity-100",
          ].join(" ")}
        >
          {items.map((repo) => (
            <RepoCard key={repo.id} repo={repo} />
          ))}
        </div>
      )}
    </div>
  );
}
