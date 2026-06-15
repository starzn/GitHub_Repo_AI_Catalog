import type { GithubRepo } from "@prisma/client";

import { analyzeRepoWithAi } from "./ai";
import { getGitHubRepoSnapshot } from "./github";
import prisma from "./prisma";
import { parseGitHubRepoUrl } from "./validators";

type AnalyzeAndSaveRepoInput = {
  url: string;
};

export async function analyzeAndSaveRepo(
  input: AnalyzeAndSaveRepoInput,
): Promise<GithubRepo> {
  const parsedUrl = parseGitHubRepoUrl(input.url);
  const snapshot = await getGitHubRepoSnapshot(parsedUrl);
  const aiAnalysis = await analyzeRepoWithAi(snapshot);
  const analyzedAt = new Date();

  return prisma.githubRepo.upsert({
    where: {
      fullName: snapshot.repo.fullName,
    },
    create: {
      owner: snapshot.repo.owner,
      name: snapshot.repo.name,
      fullName: snapshot.repo.fullName,
      htmlUrl: snapshot.repo.htmlUrl,
      description: snapshot.repo.description,
      readmeText: snapshot.readmeText,
      language: snapshot.repo.language,
      stars: snapshot.repo.stars,
      forks: snapshot.repo.forks,
      openIssues: snapshot.repo.openIssues,
      license: snapshot.repo.license,
      topics: snapshot.repo.topics,
      summary: aiAnalysis.summary,
      categoryGroup: aiAnalysis.categoryGroup,
      category: aiAnalysis.category,
      tags: aiAnalysis.tags,
      analysisReason: aiAnalysis.analysisReason,
      analyzedAt,
    },
    update: {
      htmlUrl: snapshot.repo.htmlUrl,
      description: snapshot.repo.description,
      readmeText: snapshot.readmeText,
      language: snapshot.repo.language,
      stars: snapshot.repo.stars,
      forks: snapshot.repo.forks,
      openIssues: snapshot.repo.openIssues,
      license: snapshot.repo.license,
      topics: snapshot.repo.topics,
      summary: aiAnalysis.summary,
      categoryGroup: aiAnalysis.categoryGroup,
      category: aiAnalysis.category,
      tags: aiAnalysis.tags,
      analysisReason: aiAnalysis.analysisReason,
      analyzedAt,
    },
  });
}
