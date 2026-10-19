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
scripts/vendor.mjs                builds, checks, and syncs vendored plugins
```

A vendored plugin is generated, so change it through `vendor/<name>/` and never edit `plugins/<name>/` alone.
[`.claude/skills/sync-upstream/SKILL.md`](.claude/skills/sync-upstream/SKILL.md) is the procedure for pulling in
upstream changes, which an agent can follow on its own:

```
node scripts/vendor.mjs sync pstack     # replace vendor/pstack/upstream with upstream main
node scripts/vendor.mjs build pstack    # regenerate plugins/pstack, failing on anything left to translate
node scripts/vendor.mjs check pstack    # what CI runs: plugins/pstack must match what vendor/pstack builds
```

## Plugins

| Plugin | What it is | Upstream |
| --- | --- | --- |
| [`pstack`](plugins/pstack) | Lauren Tan's poteto-mode workflows, principles, and review skills | [cursor/plugins/pstack](https://github.com/cursor/plugins/tree/main/pstack) |

## Attribution

`plugins/pstack` is the work of Lauren Tan ([@poteto](https://github.com/poteto)), built from
[cursor/plugins](https://github.com/cursor/plugins/tree/main/pstack) under the MIT license and
translated for Claude Code. Its original `LICENSE` is kept in that directory, and
[`plugins/pstack/UPSTREAM.md`](plugins/pstack/UPSTREAM.md) records the exact upstream commit and
every change made to it.

## License

This repo's own files are MIT ([LICENSE](LICENSE)). Imported plugins keep their own licenses in their directories.
