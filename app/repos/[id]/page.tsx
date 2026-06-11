import { RepoDetailView } from "@/components/RepoDetailView";

type RepoDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function RepoDetailPage({
  params,
}: RepoDetailPageProps) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-14 text-zinc-50 sm:py-20">
      <section className="mx-auto w-full max-w-7xl">
        <RepoDetailView repoId={id} />
      </section>
    </main>
  );
}
