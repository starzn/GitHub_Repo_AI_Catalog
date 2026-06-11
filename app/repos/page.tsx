import Link from "next/link";

import { RepoList } from "@/components/RepoList";

export default function ReposPage() {
  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-14 text-zinc-50 sm:py-20">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-3">
            <span className="inline-flex rounded-full border border-white/10 bg-white/4 px-4 py-1 text-sm font-medium text-zinc-200">
              已分析仓库目录
            </span>
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-white">
                浏览 GitHub 仓库列表
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-zinc-300">
                这里展示已通过 AI 分析并保存的 GitHub 仓库，支持分类筛选、关键词搜索，并按 Stars 排序展示。
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-white/20 hover:bg-white/5"
          >
            回到首页继续分析
          </Link>
        </div>

        <RepoList />
      </section>
    </main>
  );
}
