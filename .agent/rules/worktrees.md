# Git Worktree Rules

When working in a git worktree of this project:

- **Dependency Management**: Always use `pnpm install --frozen-lockfile` to install dependencies. This ensures that the lockfile is not modified and dependencies are consistent across environments.
- **Workflow**: If you are tasked with creating a worktree, always use the `/git-worktree` workflow. This workflow ensures worktrees are created **outside** the root directory as siblings (e.g., `../worktree-name`), keeping the structure flat.
