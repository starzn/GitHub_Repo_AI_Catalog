import Link from "next/link";
import { ArrowUpRightIcon, StarIcon } from "@phosphor-icons/react";

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
    <article className="group relative flex h-full flex-col rounded-2xl border border-border bg-surface p-6 transition hover:border-accent/15 hover:bg-surface-elevated">
      <div className="flex items-start justify-between gap-3">
        <CategoryBadge category={repo.category} compact />
        <a
          href={repo.htmlUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-text-tertiary transition hover:text-accent"
        >
          GitHub
          <ArrowUpRightIcon size={12} />
        </a>
      </div>

      <div className="mt-4">
        <Link
          href={`/repos/${repo.id}`}
          className="text-lg font-semibold text-white transition hover:text-accent"
        >
          {repo.fullName}
        </Link>
        <p className="mt-2 text-sm leading-6 text-text-secondary line-clamp-2">
          {repo.description || "该仓库暂未提供描述。"}
        </p>
      </div>

      <p className="mt-4 text-sm leading-6 text-text-primary line-clamp-3">
        {repo.summary}
      </p>

      <div className="mt-4">
        <TagList tags={repo.tags} compact />
      </div>

      <div className="mt-auto flex items-center gap-4 pt-5 text-xs text-text-tertiary">
        <span className="flex items-center gap-1">
          <StarIcon size={13} weight="fill" className="text-amber-400" />
          {repo.stars.toLocaleString("zh-CN")}
        </span>
        <span>{repo.language}</span>
        <span className="ml-auto">{formatDate(repo.updatedAt)}</span>
      </div>
    </article>
  );
}
