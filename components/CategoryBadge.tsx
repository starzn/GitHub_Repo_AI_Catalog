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
        "inline-flex items-center gap-1.5 rounded-md font-medium text-accent",
        compact
          ? "bg-accent-muted px-2 py-0.5 text-xs"
          : "bg-accent-muted px-2.5 py-1 text-sm",
      ].join(" ")}
    >
      <span
        className={[
          "rounded-full bg-accent",
          compact ? "h-1.5 w-1.5" : "h-2 w-2",
        ].join(" ")}
      />
      {category}
    </span>
  );
}
