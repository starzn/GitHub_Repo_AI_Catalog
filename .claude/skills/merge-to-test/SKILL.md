---
name: merge-to-test
description: Use when the user asks to merge a branch (feature/hotfix/fix/feat/etc.) into the test branch (pre), or says things like "合并到test", "合并到测试分支", "合并到pre", "merge into test", "merge into pre", "把这个分支合到pre/test"
---

# Merge Branch to Test (pre)

## When to Use

- User asks to merge a branch into `pre` (the test/integration branch)
- User says "合并到test", "合并到pre", "合并到测试分支", "合到pre", "合到测试" or similar Chinese phrases
- User says "merge to pre", "merge into test", or similar English phrases
- User asks to push the current work to the test integration branch
- Works with any source branch type: `feature/`, `hotfix/`, `fix/`, `feat/`, or any other branch name

**Important**: The test branch is named `pre` in all repos under this project (`open-miniprogram-client` and `open-miniprogram-server`). Whether the user says "test", "测试分支", or "pre", the target branch is always `pre`.

**Repository Structure**: The root directory `open-miniapp/` is NOT a git repository. `open-miniprogram-client/` and `open-miniprogram-server/` are two independent git repositories. All git commands MUST be executed inside one of these subdirectories, never at the root level. Before running any git command, `cd` into the correct subdirectory based on which repo the user is working on.

## Merge Steps

### Step 1: Pre-merge Verification

**CRITICAL**: This project has TWO independent git repos: `open-miniprogram-client` and `open-miniprogram-server`. Both must be checked for uncommitted changes before merging. Process each repo one at a time (check → commit if dirty → move to next).

**Determine the source branch to merge:**

- Both repos should be on the same branch name (e.g. both on `hotfix_opti_0515`).
- If user explicitly named a branch → use that branch for both repos.
- If user didn't name a branch → use `git branch --show-current` as the source — check which repo has changes first, then use the same branch name for the other repo.
- Any branch type is valid: `feature/`, `hotfix/`, `fix/`, `feat/`, or any other naming pattern.

Do NOT proceed if the source branch is `pre` or `master` — ask the user to specify which branch to merge.

**Handle uncommitted changes on both repos:**

For each repo (`open-miniprogram-server` and `open-miniprogram-client`):

```bash
cd <repo-dir>
git status --porcelain
```

- If working tree is clean → skip this repo, no action needed. Move to the next repo.
- If there are uncommitted changes:
  1. Run `git branch --show-current` to check current branch
  2. If not already on `<source-branch>`, run `git checkout <source-branch>`
  3. Run `git diff --stat` and `git diff` to understand what changed
  4. Generate a reasonable commit message (Chinese, following the project's `feat:` / `fix:` convention, e.g. `feat: 新增批量发布功能`, `fix: 修复路由路径`)
  5. Show the commit message to the user and present options: **"检测到 [repo-name] 有未提交的改动，建议 commit: `<message>`，请选择：1. 是，提交  2. 否，停止"**
  6. If user picks 1 → commit:
     ```bash
     git add -A
     git commit -m "<message>"
     ```
     The commit message MUST be plain and clean — only the `<type>: <description>` line, e.g. `feat: 新增批量发布功能`. Do NOT use HEREDOC, do NOT append `Co-Authored-By`, signatures, or any extra lines.
  7. If user picks 2 → **STOP**, let the user handle manually

After both repos are handled (clean repos skipped, dirty repos committed), proceed to Step 2.

### Step 2: Check Which Repos Need Merging

Before confirming, check each repo to see if `<source-branch>` actually has new commits:

```bash
cd <repo-dir>
git fetch origin
git branch -r --contains origin/<source-branch> | grep -q "origin/pre" && echo "ALREADY_MERGED" || echo "NEEDS_MERGE"
```

Or equivalently:
```bash
git log origin/pre..origin/<source-branch> --oneline
```

- If the log is empty (source branch already contained in pre) → this repo has nothing to merge, **skip it entirely**.
- If the log shows commits → this repo needs merging.

### Step 3: Confirm

If neither repo needs merging, tell the user: **"两个仓库的 `<source-branch>` 都已包含在 pre 中，无需合并"** — STOP.

Otherwise, summarize what will be merged and ask: **"即将把 `<source-branch>` 合并到 pre。需要合并的仓库：<repo-list>。已是最新：<skipped-list>。请选择：1. 是，确认合并  2. 否，取消"**

Only after user confirms, continue to Step 4.

### Step 4: Merge (only for repos that need it)

For each repo that needs merging:

```bash
cd <repo-dir>
git checkout pre
git pull origin pre
```

```bash
# Regular merge, preserving commit history
git merge <source-branch>
```

```bash
git push origin pre
```

**IMPORTANT**: Always use **regular merge** (not squash). This project uses long-lived branches that are merged multiple times. Preserving commit history is mandatory.

## Conflict Handling

If `git merge` reports conflicts:

1. **STOP** — do not attempt automatic resolution (`-X ours`/`-X theirs`)
2. List conflicting files with `git status`
3. Tell the user which files have conflicts and let them resolve manually
4. Do NOT use `git mergetool` or any auto-resolution strategy

After the user resolves conflicts, continue with:
```bash
git add <resolved-files>
git merge --continue  # or git commit if already staged
git push origin pre
```

## Post-merge

For each repo **that was merged**:

```bash
# Switch back to source branch
git checkout <source-branch>

# Push source branch to origin (set upstream if first push)
git push -u origin <source-branch>
```

- **Do NOT delete the source branch** — branches in this project are long-lived and may be merged again
- Repos that were skipped (no new commits) do not need post-merge steps

## Rules Summary

| Rule | Behavior |
|------|----------|
| Target branch | `pre` (test/integration branch) |
| Merge strategy | Regular merge (preserve all commits) |
| Push after merge | Yes, `git push origin pre` |
| Delete source branch | Never |
| Conflict resolution | Stop, let user manually resolve |