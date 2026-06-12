import { Navbar } from "@/components/Navbar";
import { AnalyzeRepoForm } from "@/components/AnalyzeRepoForm";
import { FeatureGrid } from "@/components/FeatureGrid";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-[100dvh] bg-background px-6 pb-20 text-foreground">
        <div className="mx-auto max-w-6xl pt-20 lg:pt-28">
          <div className="animate-fade-in stagger-1">
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              GitHub 仓库
              <br />
              <span className="text-accent">AI 智能目录</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-text-secondary sm:text-lg">
              输入公开 GitHub 仓库地址，自动完成抓取、AI 总结、分类标签生成与持久化，然后在列表页浏览已归档的开源项目。
            </p>
          </div>

          <div className="mt-10 animate-fade-in stagger-2">
            <AnalyzeRepoForm />
          </div>

          <div className="mt-20 animate-fade-in stagger-3">
            <FeatureGrid />
          </div>
        </div>
      </main>
    </>
  );
}
