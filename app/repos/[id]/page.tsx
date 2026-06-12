import { Navbar } from "@/components/Navbar";
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
    <>
      <Navbar />
      <main className="min-h-[100dvh] bg-background px-6 pb-20 text-foreground">
        <section className="mx-auto max-w-7xl pt-12">
          <RepoDetailView repoId={id} />
        </section>
      </main>
    </>
  );
}
