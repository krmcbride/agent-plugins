---
name: git-workflows
description: >-
  Create explicitly requested Git commits, rewrite history, publish branches, or plan, inspect, publish, and update GitHub pull requests and stacked reviews using gh stack or GitLab glab stack.
---

# Git Workflows

Keep local Git work provider-neutral. Load provider or stack guidance only when that workflow is selected by the user or repository.

## Scope and authorization

Inspection, explanation, and planning are read-only. Implementation alone does not authorize a commit; commit authorization does not authorize rewriting history or publishing. Authorization to commit carries forward within a repository and branch: once the user approves committing there, commit later coherent units of work on that branch without asking again. It does not extend to another branch or repository, to amending or rewriting history, or to publishing. Reuse other authorization already given in the current conversation for the same action and target without asking again. A composed request can authorize several operations; identify which it actually covers.

Choose the branch by who the work is for. In the user's own repositories and personal forks, committing directly to the default branch is acceptable when the history shows that practice or the user asks for it. Work destined for a shared repository always uses a feature branch and a pull or merge request.

For a rewrite, establish the exact commits or branch range, explain which IDs will change, and preserve a recovery path. Permission for a new commit does not cover amendments or rebases. A message-only amendment must preserve trees and unrelated staged or unstaged work.

Remote writes must be within the authorized publication scope. Do not infer permission to force-push, merge, reply to feedback, submit a review, or resolve threads from permission to push or open a pull request. Leave merging to the user unless explicitly requested and permitted by the host.

For publication, use the host's approved provider workflow, such as one backed by `gh` or `glab`. Publish only the selected non-default feature branch or explicitly selected branch set; publishing to the default branch requires explicit authorization for that exact action. If policy or credentials block publication, complete independently authorized local work and report the blocker. Do not bypass it with another credential, remote, or transport.

Read local branch names from Git immediately before publishing. Tools may rename a branch after the current context recorded it, and the current name governs. For ordinary single-branch publication, push the intended commit to an explicit remote ref, such as `git push <remote> HEAD:refs/heads/<feature-branch>`, and select explicit source and target branches when creating a pull or merge request. For a multi-branch workflow, follow its selected guidance and verify every affected branch and request; do not rely on local upstream tracking.

Create a branch from a remote-tracking branch with `git switch --no-track -c <branch> <remote>/<base>`; publication does not need upstream tracking. Sandboxes may keep repository Git configuration and hooks read-only. When a Git or provider command fails writing them, report the command and error and let the user run it rather than working around the refusal.

## Load the selected workflow

- **New commit:** read [creating commits](references/creating-commits.md) and [message guidelines](references/commit-message-guidelines.md).
- **Temporary message amendment:** read [amending temporary commits](references/amending-temporary-commits.md) and [message guidelines](references/commit-message-guidelines.md).
- **GitHub pull request:** read [GitHub pull requests](references/github-pull-requests.md). Also read [stacked pull requests](references/github-stacked-prs.md) for a gh stack chain, and the commit references if a new commit is authorized.
- **GitLab stacked merge requests:** read [stacked merge requests](references/gitlab-stacked-mrs.md) for a glab stack chain, and the commit references when creating layer commits is authorized.

Paths here are relative to this skill directory. Read the relevant guidance before the corresponding action; unrelated modes need not be loaded.

## Verify and stop at the authorized boundary

Inspect the complete intended diff and preserve unrelated user work. Ask only when the file, commit, or remote boundary cannot be resolved from the request and evidence. Verify the resulting commit or remote state before reporting success. After partial failure, inspect what succeeded before retrying; do not discard work or rewrite additional history as a shortcut.
