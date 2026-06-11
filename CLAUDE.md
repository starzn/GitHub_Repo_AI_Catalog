# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GitHub repository analysis and cataloging tool. Users submit a public GitHub repo URL, the system fetches repo info + README + root directory files, calls an OpenAI-compatible model to generate a Chinese-language summary, category, and tags, persists results to Supabase PostgreSQL, and displays them in list and detail pages. Core loop: **Submit URL → Fetch data → AI analysis → Persist → Display**.

## Commands

```bash
pnpm install              # Install dependencies
pnpm dev                  # Dev server (localhost:3000)
pnpm build                # Production build
pnpm lint                 # ESLint check
pnpm prisma:generate      # Generate Prisma Client
pnpm prisma:migrate       # Run Prisma migrations
pnpm prisma:studio        # Open Prisma Studio
pnpm prisma db push       # Push schema to DB (no migration files)
```

## Architecture

### Four-Layer Structure

1. **Page layer** (`app/`) — Next.js App Router pages with client components
2. **API layer** (`app/api/`) — Route handlers that call business logic
3. **Business logic layer** (`src/lib/`) — GitHub fetching, AI calls, validation, DB orchestration
4. **Data layer** (`prisma/`, `supabase/`) — Prisma schema, Supabase migrations

### API Routes

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/repos/analyze` | Analyze a GitHub repo and upsert into DB |
| `GET` | `/api/repos` | List repos, supports `category` and `keyword` query params |
| `GET` | `/api/repos/:id` | Single repo detail by ID |

### Backend Modules (`src/lib/`)

- **validators.ts** — GitHub URL parsing (auto-prepends `https://`, only allows `github.com`) and Zod request body validation
- **github.ts** — GitHub REST API wrapper. Fetches repo info, README (base64 decoded), and root file listing concurrently via `Promise.all`. All requests use `cache: "no-store"`.
- **ai.ts** — Calls OpenAI-compatible `chat/completions` with `response_format: { type: "json_object" }`. Zod validates AI output structure. AI must choose category from a fixed set defined in `repo-categories.ts`.
- **repo-analyzer.ts** — Orchestrates the full pipeline: parse URL → GitHub snapshot → AI analysis → Prisma upsert (uses `fullName` as the unique key)
- **repo-categories.ts** — Fixed category enum (`REPO_CATEGORIES`) that constrains AI classification output
- **prisma.ts** — PrismaClient singleton (pinned to `globalThis` in dev to prevent hot-reload connection leaks)
- **errors.ts** — `AppError` class with `message`, `statusCode`, and `code` for unified error responses

### Frontend Components (`components/`)

All UI uses Tailwind CSS v4 with a dark zinc/cyan theme. Client components are marked with `"use client"`.

- **AnalyzeRepoForm** — URL input form, submits to `/api/repos/analyze`, shows inline success/error
- **RepoList** — Fetches `/api/repos` with search params, renders `RepoCard` grid with category/keyword filtering
- **RepoCard** — Summary card for list view
- **RepoDetailView** — Full detail view for individual repos
- **CategoryBadge** / **TagList** — Display helpers for category and tags

### Database

Single `GithubRepo` table (Prisma model + Supabase SQL migration):
- Unique constraints on `fullName` and `htmlUrl`
- Indexes on `category`, `[owner, name]`, `analyzedAt`
- Upsert on `fullName` prevents duplicate records when re-analyzing the same repo

### Key Design Decisions

- AI output is forced to JSON mode and validated with Zod — the system never saves unstructured or invalid AI responses
- Category must come from the fixed `REPO_CATEGORIES` set — no free-form classification
- `GET /api/repos/:id` error response format (`{ error: string }`) is not yet unified with the analyze endpoint's `{ success: false, error: { code, message } }` format
- No pagination on the list endpoint yet — returns all matching results

## Environment Variables

Copy `.env.example` to `.env`. Required:

- `DATABASE_URL` — Supabase pooler connection (for runtime)
- `DIRECT_URL` — Supabase direct connection (for Prisma migrations)
- `GITHUB_TOKEN` — GitHub API auth (avoids unauthenticated rate limits)
- `OPENAI_API_KEY` / `OPENAI_BASE_URL` / `OPENAI_MODEL` — AI model config

## Git Commit Convention

Commit messages must follow Conventional Commits with a **Chinese** summary:

```
feat: 新增批量发布功能
fix: 修复路由路径
```

Allowed prefixes: `feat | fix | refactor | docs | chore | test | build | ci | perf | revert`. `Merge` and `Revert` commits are exempt. Enforced by `.githooks/commit-msg`.

## Documentation (`docs/`)

Detailed reference docs for deeper context beyond the summaries below:

- `docs/references/architecture.md` — Full system structure, data flows, module responsibilities, and architectural constraints
- `docs/references/technology.md` — Tech stack rationale, dependency roles, runtime environment, and dev commands
- `docs/references/api.md` — API reference: request/response formats, error codes, and curl examples for testing
- `docs/references/deployment.md` — Environment variables, DB initialization, and Vercel deployment guide
- `docs/references/database.md` — Prisma model details, Supabase connection setup, table creation, and troubleshooting

Recommended reading order: architecture → technology → api → deployment → database.

## Path Alias

`@/*` maps to the project root directory.
