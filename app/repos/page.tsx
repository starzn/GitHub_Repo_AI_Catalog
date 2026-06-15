import { Navbar } from "@/components/Navbar";
import { RepoList } from "@/components/RepoList";
import { getRepoList } from "@/src/lib/repo-list";

type ReposPageProps = {
  searchParams: Promise<{
    group?: string;
    category?: string;
    keyword?: string;
  }>;
};

export default async function ReposPage({ searchParams }: ReposPageProps) {
  const params = await searchParams;
  const initialData = await getRepoList({
    group: params.group,
    category: params.category,
    keyword: params.keyword,
  });

  return (
    <>
      <Navbar />
      <main className="min-h-[100dvh] bg-background px-6 pb-20 text-foreground">
        <section className="mx-auto max-w-7xl pt-12">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              浏览仓库列表
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-text-secondary">
              已通过 AI 分析并保存的 GitHub 仓库，支持分类筛选和关键词搜索。
            </p>
          </div>

          <RepoList items={initialData.items} total={initialData.total} />
        </section>
      </main>
    </>
  );
}
