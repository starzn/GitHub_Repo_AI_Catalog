export type RepoListItem = {
  id: string;
  owner: string;
  name: string;
  fullName: string;
  htmlUrl: string;
  description: string | null;
  summary: string;
  categoryGroup: string;
  category: string;
  tags: string[];
  language: string;
  stars: number;
  updatedAt: string;
};

export type RepoDetail = RepoListItem & {
  readmeText: string | null;
  forks: number;
  openIssues: number;
  license: string | null;
  topics: string[];
  analysisReason: string;
  analyzedAt: string;
  createdAt: string;
};

export type RepoListResponse = {
  items: RepoListItem[];
  total: number;
};

export type ApiErrorPayload = {
  code?: string;
  message?: string;
  details?: unknown;
};

export type ApiErrorResponse = {
  success?: false;
  error?: ApiErrorPayload;
};

export type AnalyzeRepoSuccessResponse = {
  success: true;
  data: RepoDetail;
};
