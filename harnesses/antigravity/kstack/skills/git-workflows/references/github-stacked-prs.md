# GitHub Stacked Pull Requests

Use for a selected `github/gh-stack` workflow, alongside [PR guidance](github-pull-requests.md). A layer may contain several commits; choose boundaries by dependent, independently reviewable concerns. Keep independent work separate and place fixes on the lowest owning layer.

## Establish the chain

Inspect the trunk, ordered branches, worktree ownership, and remote PRs with `gh stack view --json` and Git. Keep every layer in one worktree, preferably the current one: gh stack switches branches in place, cannot check out or rebase a layer checked out in another worktree, and does not see a stack initialized in a different worktree. Do not rearrange other worktrees to overcome branch ownership. Select the publication remote explicitly with `--remote` when ambiguous, rather than changing Git config.

Use installed `gh stack <command> --help` for syntax and noninteractive options. Explicit branch arguments and `view --json` avoid prompts and terminal UIs. The [upstream reference](https://github.com/github/gh-stack#commands) covers navigation and less common operations; check it when installed help is insufficient.

## Create and update layers

`gh stack init --base <trunk> <bottom> <next>` adopts existing branches in bottom-to-top order. Missing branches start at the trunk or previous layer, not detached `HEAD`: place branch pointers at intended review boundaries before adopting detached work. Initialization also tries to enable repository `rerere`, and continues if that config write is refused.

Add dependent layers from the current top with `gh stack add <branch>`, using [normal commits](creating-commits.md) for their content. Uncommitted changes carry onto the new branch; choose their layer deliberately instead of using combined stage-all/commit shortcuts.

After a lower-layer fix, cascade the authorized rewrite upward with `gh stack rebase --upstack`. Use `--no-trunk` when only inter-layer rebasing is intended. Rewriting locally and publishing rewritten branches remain separate scopes.

## Publication effects

These commands operate across the active stack. Establish the complete branch set and authorized effects, including any rewritten remote history:

| Command | Effect |
| --- | --- |
| `submit --auto` | Push branches, create missing draft PRs, and link the stack. `--open` also marks existing PRs ready for review. |
| `push` | Push active branches without creating PRs. |
| `sync` | Fetch, reconcile stack membership, rebase, push, and refresh remote stack state. It does not open missing PRs. |

Keep draft-by-default publication through `submit --auto`; bare interactive submission has different defaults. Pruning merged local branches requires separate deletion scope. Linking or unstacking on GitHub is also a remote write, even when no commits change.

## Recovery

- For a paused rebase, resolve and stage only conflicts, then use `gh stack rebase --continue`; `--abort` restores the stack.
- A sync conflict restores the stack before returning. Use a separate authorized rebase to resolve it.
- Divergent local/remote membership can make noninteractive sync report `Sync aborted` with a successful exit code. Check output and fresh state.
- Push or submission may update only part of the stack. Inspect local state and every affected remote branch/PR before retrying; preserve successful work.

Report the resulting chain, PR links/checks, and any unpublished rewrites or remaining recovery work.
