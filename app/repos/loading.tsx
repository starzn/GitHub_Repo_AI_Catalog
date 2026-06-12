import { Navbar } from "@/components/Navbar";

export default function ReposLoading() {
  return (
    <>
      <Navbar />
      <main className="min-h-[100dvh] bg-background px-6 pb-20 text-foreground">
        <section className="mx-auto max-w-7xl pt-12">
          <div className="space-y-4">
            <div className="h-9 w-64 animate-shimmer rounded-xl" />
            <div className="h-6 w-96 animate-shimmer rounded-lg" />
          </div>

          <div className="mt-8 flex gap-3">
            <div className="h-10 w-64 animate-shimmer rounded-xl" />
            <div className="h-10 w-32 animate-shimmer rounded-xl" />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 animate-shimmer rounded-2xl" />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
