create table if not exists public."GithubRepo" (
  "id" text primary key,
  "owner" text not null,
  "name" text not null,
  "fullName" text not null unique,
  "htmlUrl" text not null unique,
  "description" text,
  "readmeText" text,
  "language" text not null,
  "stars" integer not null default 0,
  "forks" integer not null default 0,
  "openIssues" integer not null default 0,
  "license" text,
  "topics" text[] not null default '{}',
  "summary" text not null,
  "category" text not null,
  "tags" text[] not null default '{}',
  "analysisReason" text not null,
  "analyzedAt" timestamptz not null,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create index if not exists "GithubRepo_category_idx"
  on public."GithubRepo" ("category");

create index if not exists "GithubRepo_owner_name_idx"
  on public."GithubRepo" ("owner", "name");

create index if not exists "GithubRepo_analyzedAt_idx"
  on public."GithubRepo" ("analyzedAt");
