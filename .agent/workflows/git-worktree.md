---
description: Create a new git worktree as a sibling to the current repository
---

This workflow helps you create a new git worktree as a sibling to the repository root directory (e.g., `../worktree-name`). This ensures worktrees are flat and not contained within the main repository.

// turbo-all
1. **Gather Worktree Information**
   - Check current branch: `git branch --show-current`
   - Prompt the user for:
     - **Branch Name**: The name of the new feature branch (e.g., `feature/cool-new-thing`).
     - **Base Reference**: The branch or commit to base the new worktree on (default: `main`).

2. **Create the Worktree**
   - The worktree will be created at `../<branch-name>` (replace `<branch-name>` with the slugified branch name).
   - If the branch already exists:
     `git worktree add ../<branch-name> <branch-name>`
   - If creating a new branch:
     `git worktree add ../<branch-name> -b <branch-name> <base-reference>`

3. **Verify and Setup**
   - Verify the worktree was created: `git worktree list`
   - Run installation in the new worktree: `cd ../<branch-name> && pnpm install --frozen-lockfile`
   - Inform the user that the new worktree is ready at `../<branch-name>`.
   - Recommend adding this path as a new workspace in the agent manager for dedicated control.
