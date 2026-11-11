# agent-plugins

The home of **kstack**, a personal set of skills and review agents for [Claude Code](https://code.claude.com),
published as a [plugin marketplace](https://code.claude.com/docs/en/plugin-marketplaces).

kstack is how one engineer works with coding agents day to day: how to plan substantial work, which decisions stay
with the user, how a change gets reviewed and its findings verified, and how commits and pull requests are made. Those
skills have been in daily use and revision for more than a year. kstack joins them with the engineering principles and
playbooks from Lauren Tan's [pstack](https://github.com/cursor/plugins/tree/main/pstack).

The marketplace also carries pstack itself, translated for Claude Code, for anyone who wants the original.

## Install

In Claude Code:

```
/plugin marketplace add krmcbride/agent-plugins
/plugin install kstack@krmcbride
```

Or from a shell:

```
claude plugin marketplace add krmcbride/agent-plugins
claude plugin install kstack@krmcbride
```

Every skill and agent is then available under the `kstack:` prefix. Claude picks most of them up from their
descriptions; any can also be run as a slash command, such as `/kstack:code-review`.

## What kstack covers

| Area | Skills and agents | What you get |
| --- | --- | --- |
| Engineering method | `engineering-principles`, `debugging`, `performance`, `refactoring`, `prototyping` | 22 principles indexed by the situation each applies to, and playbooks that apply them to whole tasks |
| Planning | `implementation-workflow`, `decision-interview` | Substantial work agreed with the user as an outcome-level contract, with the user's decisions settled one question at a time |
| Review | `code-review`, `code-shape`, and the `code-reviewer`, `review-critic`, and `shape-reviewer` agents | Independent and adversarial review, findings verified and risk-scored before anyone acts on them, and a separate pass for module size and dead weight |
| Git | `git-workflows`, `researching-github-repositories` | Commits, history rewrites, pull requests, and stacked reviews with clear rules for what needs the user's authorization, and read-only research of upstream repositories |
| Visualize | `show-me` | A quick sketch, table, or rendered diagram of the topic at hand |

[`plugins/kstack/README.md`](plugins/kstack/README.md) describes each skill, the review design, the plugin's settings,
and how kstack differs from pstack.

### Where it comes from

- **Planning, review, Git, and research** are kstack's own. They began as standalone skills and have been reshaped
  through regular use.
- **The engineering principles and the debugging, performance, refactoring, and prototyping playbooks** are adapted
  from pstack. kstack keeps the method and leaves out pstack's orchestration layer: its router skill, model and effort
  routing, subagent rules, and reply format. Claude Code decides how to use its own harness.
- **`show-me`** is adapted from HumanLayer's
  [show-me](https://github.com/humanlayer/skills/tree/main/plugins/show-me) skill.

## pstack

[`plugins/pstack`](plugins/pstack) is Lauren Tan's poteto-mode workflows, principles, and review skills, built from
[cursor/plugins](https://github.com/cursor/plugins/tree/main/pstack) and translated for Claude Code. It is generated
from a pinned upstream commit, and the scripts below bring in upstream changes.

```
/plugin install pstack@krmcbride
```

kstack does not need it. Install pstack to use the original workflows as their author wrote them.

## Repository layout

```
.claude-plugin/marketplace.json   marketplace catalog (name: krmcbride)
plugins/kstack/                   written here and edited in place
plugins/pstack/                   generated from vendor/pstack; never edited directly
vendor/pstack/                    the pristine upstream copy and its pin, plus the rules and patches
                                  that turn it into plugins/pstack
scripts/vendor.mjs                builds, checks, and syncs vendored plugins (Node 24)
```

A vendored plugin is changed through `vendor/<name>/`, never by editing `plugins/<name>/` alone.
[`.claude/skills/sync-upstream/SKILL.md`](.claude/skills/sync-upstream/SKILL.md) is the procedure for pulling in
upstream changes, which an agent can follow on its own:

```
node scripts/vendor.mjs sync pstack     # replace vendor/pstack/upstream with upstream main
node scripts/vendor.mjs build pstack    # regenerate plugins/pstack, failing on anything left to translate
node scripts/vendor.mjs check pstack    # what CI runs: plugins/pstack must match what vendor/pstack builds
node scripts/vendor.mjs verify pstack   # also in CI: vendor/pstack/upstream must match its pinned commit
```

## Attribution

`plugins/pstack` is the work of Lauren Tan ([@poteto](https://github.com/poteto)), built from
[cursor/plugins](https://github.com/cursor/plugins/tree/main/pstack) under the MIT license and translated for Claude
Code. Its original `LICENSE` is kept in that directory, and [`plugins/pstack/UPSTREAM.md`](plugins/pstack/UPSTREAM.md)
records the exact upstream commit and every change made to it.

`plugins/kstack` adapts principles and playbooks from the same pstack source under the MIT license. Its `LICENSE` keeps
Lauren Tan's copyright notice.

The `show-me` skill in `plugins/kstack` adapts HumanLayer's
[show-me](https://github.com/humanlayer/skills/tree/main/plugins/show-me) skill under the MIT license. kstack's
`LICENSE` also keeps HumanLayer's copyright notice.

## License

This repo's own files are MIT ([LICENSE](LICENSE)). Imported plugins keep their own licenses in their directories.
