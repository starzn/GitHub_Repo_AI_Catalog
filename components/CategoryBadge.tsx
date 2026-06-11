type CategoryBadgeProps = {
  category: string;
  compact?: boolean;
};

export function CategoryBadge({
  category,
  compact = false,
}: CategoryBadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-400/10 font-medium text-cyan-100",
        compact ? "px-2.5 py-1 text-xs" : "px-3 py-1 text-sm",
      ].join(" ")}
    >
      {category}
    </span>
  );
}
