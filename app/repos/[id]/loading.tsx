import { Navbar } from "@/components/Navbar";

export default function RepoDetailLoading() {
  return (
    <>
      <Navbar />
      <main className="min-h-[100dvh] bg-background px-6 pb-20 text-foreground">
        <section className="mx-auto max-w-7xl pt-12">
          <div className="space-y-5">
            <div className="h-10 w-56 animate-shimmer rounded-xl" />
            <div className="h-44 animate-shimmer rounded-2xl" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-24 animate-shimmer rounded-xl" />
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
