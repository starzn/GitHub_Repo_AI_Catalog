export default function RepoDetailLoading() {
  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-14 text-zinc-50 sm:py-20">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="h-10 w-40 animate-pulse rounded-full bg-white/10" />
        <div className="h-48 animate-pulse rounded-[2rem] bg-white/[0.04]" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-3xl bg-white/[0.04]"
            />
          ))}
        </div>
      </section>
    </main>
  );
}
