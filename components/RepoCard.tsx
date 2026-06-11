import Link from "next/link";

import type { RepoListItem } from "@/types/repo";

import { CategoryBadge } from "./CategoryBadge";
import { TagList } from "./TagList";

type RepoCardProps = {
  repo: RepoListItem;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function RepoCard({ repo }: RepoCardProps) {
  return (
    <article className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:border-cyan-400/30 hover:bg-white/[0.05]">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <CategoryBadge category={repo.category} compact />
          <div>
            <Link
              href={`/repos/${repo.id}`}
              className="text-xl font-semibold text-white transition hover:text-cyan-200"
            >
              {repo.fullName}
            </Link>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              {repo.description || "该仓库暂未提供描述。"}
            </p>
          </div>
        </div>

        <a
          href={repo.htmlUrl}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-zinc-300 transition hover:border-cyan-400/30 hover:text-cyan-100"
        >
          GitHub
        </a>
      </div>

      <p className="mt-5 text-sm leading-6 text-zinc-200">{repo.summary}</p>

      <div className="mt-5">
        <TagList tags={repo.tags} compact />
      </div>

      <div className="mt-auto flex flex-wrap gap-3 pt-6 text-xs text-zinc-400">
        <span className="rounded-full border border-white/10 px-3 py-1">
          语言: {repo.language}
        </span>
        <span className="rounded-full border border-white/10 px-3 py-1">
          Stars: {repo.stars.toLocaleString("zh-CN")}
        </span>
        <span className="rounded-full border border-white/10 px-3 py-1">
          更新于 {formatDate(repo.updatedAt)}
        </span>
      </div>
    </article>
  );
}
