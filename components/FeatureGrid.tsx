"use client";

import { LightningIcon, ListBulletsIcon, EyeIcon } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";

const features: { icon: Icon; title: string; description: string }[] = [
  {
    icon: LightningIcon,
    title: "一键分析",
    description:
      "粘贴 GitHub 仓库地址，自动抓取信息并调用 AI 生成中文总结、分类和标签。",
  },
  {
    icon: ListBulletsIcon,
    title: "筛选检索",
    description:
      "按固定分类筛选，基于名称、描述、语言和标签进行关键词检索。",
  },
  {
    icon: EyeIcon,
    title: "完整详情",
    description:
      "查看仓库基础信息、AI 分析结果、Topics 和 README 摘要。",
  },
];

export function FeatureGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {features.map((feature) => (
        <div
          key={feature.title}
          className="group rounded-2xl border border-border bg-surface p-6 transition hover:border-accent/20 hover:bg-surface-elevated"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-muted text-accent transition group-hover:bg-accent/20">
            <feature.icon size={20} weight="duotone" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-white">
            {feature.title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  );
}
