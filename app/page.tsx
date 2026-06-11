import Link from "next/link";

import { AnalyzeRepoForm } from "@/components/AnalyzeRepoForm";

const features = [
  {
    title: "输入 URL 即可分析",
    description:
      "提交公开 GitHub 仓库地址后，前端会调用现有分析接口，完成抓取、AI 总结、分类、标签与入库。",
  },
  {
    title: "列表筛选与检索",
    description:
      "支持按固定分类筛选，并基于仓库名、描述、总结、语言、标签进行关键词检索。",
  },
  {
    title: "查看完整详情",
    description:
      "详情页展示仓库基础信息、AI 分析结果、Topics、README 摘要以及最近分析时间。",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-14 text-zinc-50 sm:py-20">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-4xl border border-white/10 bg-white/4 p-8 shadow-2xl shadow-black/30 sm:p-10">
            <div className="space-y-6">
              <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-sm font-medium text-cyan-100">
                Task 4 前端页面已接入现有 API
              </span>

              <div className="space-y-4">
                <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  GitHub Repo AI Catalog
                </h1>
                <p className="max-w-3xl text-base leading-7 text-zinc-300 sm:text-lg">
                  输入公开 GitHub 仓库地址，触发分析接口完成抓取、AI
                  总结、分类、标签生成与持久化，然后在列表页和详情页浏览已归档的开源项目。
                </p>
              </div>

              <AnalyzeRepoForm />
            </div>
          </div>

          <aside className="rounded-4xl border border-white/10 bg-black/20 p-8">
            <p className="text-sm uppercase tracking-[0.28em] text-zinc-500">
              当前能力
            </p>

            <div className="mt-6 space-y-4">
              {features.map((feature) => (
                <article
                  key={feature.title}
                  className="rounded-3xl border border-white/10 bg-white/3 p-5"
                >
                  <h2 className="text-lg font-semibold text-white">
                    {feature.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-zinc-300">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-6 rounded-3xl border border-dashed border-white/15 bg-white/2 p-5">
              <p className="text-sm leading-6 text-zinc-400">
                分析完成后可直接跳转详情页，也可以前往仓库列表页继续按分类或关键词筛选浏览。
              </p>
              <Link
                href="/repos"
                className="mt-4 inline-flex rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-zinc-100 transition hover:border-white/20 hover:bg-white/5"
              >
                打开仓库列表
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
