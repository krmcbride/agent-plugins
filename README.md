# agent-plugins

Plugins for coding agents, published as a [Claude Code plugin marketplace](https://code.claude.com/docs/en/plugin-marketplaces).

## Install

In Claude Code:

```
/plugin marketplace add krmcbride/agent-plugins
/plugin install pstack@krmcbride
```

Or from a shell:

```
claude plugin marketplace add krmcbride/agent-plugins
claude plugin install pstack@krmcbride
```

## Layout

```
.claude-plugin/marketplace.json   marketplace catalog (name: krmcbride)
plugins/<name>/                   one directory per plugin
vendor/<name>/                    for a plugin built from upstream: the pristine upstream copy and its pin,
                                  plus the rules and patches that turn it into plugins/<name>
scripts/vendor.mjs                builds, checks, and syncs vendored plugins (Node 24)
```

A plugin with no `vendor/<name>/` directory, such as `review`, `kstack`, `git`, or `show-me`, is written here and
edited in place.

A vendored plugin is generated, so change it through `vendor/<name>/` and never edit `plugins/<name>/` alone.
[`.claude/skills/sync-upstream/SKILL.md`](.claude/skills/sync-upstream/SKILL.md) is the procedure for pulling in
upstream changes, which an agent can follow on its own:

```
node scripts/vendor.mjs sync pstack     # replace vendor/pstack/upstream with upstream main
node scripts/vendor.mjs build pstack    # regenerate plugins/pstack, failing on anything left to translate
node scripts/vendor.mjs check pstack    # what CI runs: plugins/pstack must match what vendor/pstack builds
node scripts/vendor.mjs verify pstack   # also in CI: vendor/pstack/upstream must match its pinned commit
```

## Plugins

| Plugin | What it is | Upstream |
| --- | --- | --- |
| [`pstack`](plugins/pstack) | Lauren Tan's poteto-mode workflows, principles, and review skills | [cursor/plugins/pstack](https://github.com/cursor/plugins/tree/main/pstack) |
| [`review`](plugins/review) | Ordinary and adversarial code review with a code-shape pass, run by read-only review agents | This repo |
| [`kstack`](plugins/kstack) | Engineering principles, playbooks for debugging, performance, refactoring, and prototyping, and a planning workflow | This repo, partly adapted from pstack |
| [`git`](plugins/git) | Git and forge workflows with explicit authorization boundaries, plus read-only GitHub repository research | This repo |
| [`show-me`](plugins/show-me) | Visual explanations: code-shape sketches, trees, small Mermaid diagrams, and throwaway HTML pages | This repo, adapted from [humanlayer/skills/show-me](https://github.com/humanlayer/skills/tree/main/plugins/show-me) |

## Attribution

`plugins/pstack` is the work of Lauren Tan ([@poteto](https://github.com/poteto)), built from
[cursor/plugins](https://github.com/cursor/plugins/tree/main/pstack) under the MIT license and
translated for Claude Code. Its original `LICENSE` is kept in that directory, and
[`plugins/pstack/UPSTREAM.md`](plugins/pstack/UPSTREAM.md) records the exact upstream commit and
every change made to it.

`plugins/kstack` adapts principles and playbooks from the same pstack source under the MIT license. Its
`LICENSE` keeps Lauren Tan's copyright notice.

`plugins/show-me` adapts HumanLayer's [show-me](https://github.com/humanlayer/skills/tree/main/plugins/show-me)
skill under the MIT license. Its `LICENSE` keeps HumanLayer's copyright notice.

## License

This repo's own files are MIT ([LICENSE](LICENSE)). Imported plugins keep their own licenses in their directories.
