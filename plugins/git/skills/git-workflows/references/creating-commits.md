# Creating Commits

Choose one coherent unit from the intended diff and current staging. Stage explicit paths or hunks; preserve unrelated work, including existing staging. Inspect the complete staged diff before committing.

Run relevant project checks, reusing still-applicable results for this change. Draft the message using [message guidelines](commit-message-guidelines.md). Use a temporary file with `-F` for multiline messages, or `-m` for a subject. Create a new commit; message-only rewrites use [temporary amendments](amending-temporary-commits.md).

Verify the resulting commit's diff and message and the remaining index and worktree. Report the commit and any intentionally uncommitted work. If creation fails, preserve the index and worktree for recovery.
