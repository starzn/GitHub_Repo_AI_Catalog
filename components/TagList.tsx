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
    return <span className="text-sm text-text-tertiary">{emptyLabel}</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <span
          key={tag}
          className={[
            "inline-flex items-center rounded-md border border-border bg-surface text-text-secondary",
            compact ? "px-1.5 py-0.5 text-xs" : "px-2 py-0.5 text-sm",
          ].join(" ")}
        >
          #{tag}
        </span>
      ))}
    </div>
  );
}
