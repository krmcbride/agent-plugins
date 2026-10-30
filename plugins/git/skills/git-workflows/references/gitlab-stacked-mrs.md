# GitLab Stacked Merge Requests

Use for a selected `glab stack` workflow. Choose layers by dependent, independently reviewable concerns and place fixes on the lowest owning layer. The CLI manages a commit and generated branch per saved diff; arbitrary extra commits on a layer can make `sync` reject it as ahead. Do not assume GitHub's branch-adoption model applies.

## Establish the selected stack

Inspect `glab stack list`, `git config --get glab.currentstack`, Git worktree ownership, and remote MRs. Branch checkout alone does not select another stack. Resolve metadata through Git rather than assuming `.git` is a directory. Prefer the current worktree without rearranging other worktrees.

Check the installed version and help; consult matching source when behavior is unclear. For multiple remotes or forks, verify the actual fetch/push destination: `-R` selects the GitLab repository, but sync may still use `origin`. Do not rename remotes as a workaround.

## Create and update layers

- `create <name>` records the current branch as the base; start attached to the intended base. It has no `--base` selector. It and `switch` select the stack through repository Git config; if that write is refused, ask the user to run the command.
- `save -m <message>` creates the next layer's commit and branch from the top. Apply [commit preparation](creating-commits.md), including focused staging, but let `save` create the commit. Preserve unrelated staging; avoid stage-all shortcuts.
- `amend -m <message>` updates the owning layer's commit and description. It requires rewrite scope; `save` would create another layer instead.

For existing work, `infer --name <name> <base-branch>..HEAD` selects commits in an editor and cherry-picks them onto generated branches. It needs a TTY/editor even with a name, and appends to an already selected stack. Confirm the selection and range and retain the original branch for recovery; this is not adoption of existing branches or MRs.

Use explicit names/messages and deterministic navigation for unattended work. Leave editor-driven operations to an interactive workflow; discover supported commands and flags through installed help.

## Publish and synchronize

`glab stack sync` can rebase dependent layers, force-with-lease push, create MRs, and remove completed entries. Establish authorization for the full stack and these effects before running it. `--update-base` additionally rebases onto the latest remote base. `--skip-mr-creation` still mutates and publishes state.

Check draft support before publication: sync can use layer descriptions as titles without adding a draft prefix. When publication must be draft-only, establish a supported draft-creation path before syncing; converting ready MRs afterward does not satisfy that requirement.

Describe each layer using [pull request descriptions](pull-request-descriptions.md), including dependencies needed to review it.

Verify each MR's source/target project and branch, remote commit, draft state, title/body, and checks. Report MR links and unavailable checks.

## Recovery and landing

After a failure, inspect branch tips, stack metadata, and remote MRs before retrying. Use Git's rebase continuation or abort for an interrupted rebase; there is no `glab stack rebase --continue`. Aborting that rebase does not undo earlier publications or metadata changes.

When merging is explicitly authorized, inspect each bottom-up merge's retargeting and remaining history before another sync, especially with squash merges or a non-default base. There is no atomic `glab stack merge`. Verify merged/closed-entry cleanup rather than deleting extra branches or metadata to recover.
