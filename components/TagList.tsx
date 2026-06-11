type TagListProps = {
  tags: string[];
  compact?: boolean;
  emptyLabel?: string;
};

export function TagList({
  tags,
  compact = false,
  emptyLabel = "暂无标签",
}: TagListProps) {
  if (tags.length === 0) {
    return <span className="text-sm text-zinc-500">{emptyLabel}</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className={[
            "inline-flex items-center rounded-full border border-white/10 bg-white/5 text-zinc-200",
            compact ? "px-2 py-1 text-xs" : "px-2.5 py-1 text-sm",
          ].join(" ")}
        >
          #{tag}
        </span>
      ))}
    </div>
  );
}
