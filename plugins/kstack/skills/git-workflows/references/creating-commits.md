# Creating Commits

Choose one coherent unit from the intended diff and current staging. Stage explicit paths or hunks; preserve unrelated work, including existing staging. Inspect the complete staged diff before committing.

Run relevant project checks, reusing still-applicable results for this change. Draft the message using [message guidelines](commit-message-guidelines.md). Use `-m` only for a subject-only message. For a message with a body, write it to a temporary file, wrap the body at 72 characters, by hand or with `fmt -w 72` on the body alone, and commit with `-F`. Never pass a body with `-m`: git stores the message exactly as given, so the body stays unwrapped. Create a new commit rather than amending an existing one, unless the change belongs in a commit you created in this session and have not pushed.

Verify the resulting commit's diff and message and the remaining index and worktree. Report the commit and any intentionally uncommitted work. If creation fails, preserve the index and worktree for recovery.
