# GitHub Pull Requests

## Establish the publication target

Resolve the canonical base repository/branch and exact source repository/branch from the intended diff, remotes, and existing PRs. Confirm the remote head matches the intended local commit before creating or updating the PR.

Reuse a matching PR. Create new PRs as drafts unless the user requests ready for review. For a selected `gh stack` chain, also read [stacked PRs](github-stacked-prs.md); each layer targets the branch below it.

## Describe and verify the change

Write the title and body using [pull request descriptions](pull-request-descriptions.md), which defines the audience, template precedence, default body, and optional sections.

Verify URL, base/head, remote commit, draft state, title/body, and checks for each affected PR. Distinguish passed checks from unrun or unavailable ones. Inspect actionable GitHub Actions logs; for inaccessible external checks, report the provider and link.

## Follow up on review

Read authoritative inline threads, including resolved and outdated ones, and compare them with the current patch. Outdated does not mean addressed. Place authorized fixes on the branch or lowest stack layer that owns them.

An authorized reply should state what changed and its verification. Resolve a thread only when its fix is verified and resolution is within scope. Apply the entrypoint's separate boundaries for fixes, publication, and review actions.
