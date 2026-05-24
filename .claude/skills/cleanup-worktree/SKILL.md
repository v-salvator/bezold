---
name: cleanup-worktree
description: Removes the git worktree that the current session is running in, and optionally deletes its branch. Use when the user says "cleanup worktree", "remove worktree", "delete this worktree", "clean up the branch", or similar phrases at the end of a session.
---

## Goal

Remove the current session's worktree from the main repo and optionally delete its branch.

## Steps

1. **Detect the current worktree path** — the working directory of this session is the worktree root.

2. **Find the main repo** — run `git worktree list` from the worktree to identify the main repo path (the first entry).

3. **Check for uncommitted changes** — run `git status`. If any exist, warn the user and stop. Never remove a worktree with uncommitted work.

4. **Remove the worktree** — from the main repo directory, run:

   ```bash
   git worktree remove <worktree-path> --force
   ```

5. **Offer to delete the branch** — ask the user if they also want to delete the branch. If yes:

   ```bash
   git branch -d <branch-name>
   ```

   Use `-D` only if the branch is unmerged and the user explicitly confirms.

6. **Confirm** — report what was removed.
