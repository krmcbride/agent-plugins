# Amending Temporary Commits

This is a message-only rewrite: preserve commit content and unrelated staged or unstaged work. Select `HEAD` unless the user identifies a series by count, range, or another unambiguous boundary. A subject such as `tmp`, `wip`, or `checkpoint` is a candidate when the request identifies it as temporary.

## Establish the replacements

Inspect each selected commit's hash, message, and full diff. Record the original tip and tree hashes for preservation checks. For a series, require a clean index and worktree and stop for direction if the range contains merges.

Derive each replacement from [message guidelines](commit-message-guidelines.md). An explicit rewording request permits choosing the messages without another approval. Honor a requested preview or exact-message approval. In a series preview, show current and proposed messages chronologically with their hashes.

## Rewrite and verify

For `HEAD`, use `git commit --amend --only` to exclude staged changes. A dirty index or worktree can remain intact during this single message-only amendment.

For a series, use a non-interactive message-only rebase, oldest to newest, changing only the selected messages. Preserve other rebase actions. If it fails, abort and report rather than changing content to resolve it.

Verify the replacement messages, unchanged trees, and preservation of the original staged and unstaged work. For a series, inspect the rewritten range, not just the final tree. Report the resulting messages and commit IDs.

Published checkpoints still follow the entrypoint's rewrite and publication boundaries; completing this local rewrite does not authorize a force-push.
