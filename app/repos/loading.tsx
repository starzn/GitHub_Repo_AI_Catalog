export default function ReposLoading() {
  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-14 text-zinc-50 sm:py-20">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <div className="space-y-3">
          <div className="h-7 w-32 animate-pulse rounded-full bg-white/10" />
          <div className="h-12 w-80 animate-pulse rounded-2xl bg-white/10" />
          <div className="h-6 w-full max-w-3xl animate-pulse rounded-2xl bg-white/[0.06]" />
        </div>

        <div className="h-28 animate-pulse rounded-[2rem] bg-white/[0.04]" />

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-72 animate-pulse rounded-3xl bg-white/[0.04]"
            />
          ))}
        </div>
      </section>
    </main>
  );
}
