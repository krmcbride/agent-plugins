# git

Git and forge workflows. `git-workflows` keeps authorization boundaries explicit: a request to implement does not
authorize a commit, a commit does not authorize a rewrite, and neither authorizes publishing.
`researching-github-repositories` reads upstream source and history without touching the user's checkouts.

## Contents

| Skill | What it does |
| --- | --- |
| `git:git-workflows` | Commits, temporary-commit message amendments, history rewrites, branch publication, GitHub pull requests and `gh stack` chains, and GitLab `glab stack` merge requests, each with its own reference loaded on demand |
| `git:researching-github-repositories` | Answers questions about GitHub repositories from `gh` metadata or a disposable shallow clone, read-only |

The skills expect `gh`, and `glab` for GitLab stacks. Publishing uses whatever credentials those tools already have.

## Install

```
/plugin install git@krmcbride
```
