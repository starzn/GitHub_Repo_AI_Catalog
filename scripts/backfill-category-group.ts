import { PrismaClient } from "@prisma/client";

import { getCategoryGroup } from "../src/lib/repo-categories";

const prisma = new PrismaClient();

async function main() {
  const repos = await prisma.githubRepo.findMany({
    select: { id: true, category: true, categoryGroup: true },
  });

  console.log(`Found ${repos.length} repos to process.`);

  let updated = 0;

  for (const repo of repos) {
    const correctGroup = getCategoryGroup(repo.category);

    if (repo.categoryGroup !== correctGroup) {
      await prisma.githubRepo.update({
        where: { id: repo.id },
        data: { categoryGroup: correctGroup },
      });
      updated++;
      console.log(`  ${repo.id}: ${repo.category} -> ${correctGroup}`);
    }
  }

  console.log(`Done. Updated ${updated}/${repos.length} repos.`);
}

main()
  .catch((err) => {
    console.error("Backfill failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
