---
description: Create a new git worktree in the trees/ directory
---

This workflow helps you create a new git worktree inside the `trees/` directory, which is locally ignored. This allows for isolated development environments that can be managed as separate workspaces.

// turbo-all
1. **Gather Worktree Information**
   - Check current branch: `git branch --show-current`
   - Prompt the user for:
     - **Branch Name**: The name of the new feature branch (e.g., `feature/cool-new-thing`).
     - **Base Reference**: The branch or commit to base the new worktree on (default: `main`).

2. **Create the Worktree**
   - If the branch already exists:
     `git worktree add trees/<branch-name> <branch-name>`
   - If creating a new branch:
     `git worktree add trees/<branch-name> -b <branch-name> <base-reference>`

3. **Verify and Setup**
   - Verify the worktree was created: `git worktree list`
   - Inform the user that the new worktree is ready at `/Users/charlbotha/repos/cyberCharl/aissa-mono/trees/<branch-name>`.
   - Recommend adding this path as a new workspace in the agent manager for dedicated control.
