# agent-plugins

My plugins for coding agents, published as a [Claude Code plugin marketplace](https://code.claude.com/docs/en/plugin-marketplaces).

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
```

## Plugins

| Plugin | What it is | Upstream |
| --- | --- | --- |
| [`pstack`](plugins/pstack) | Lauren Tan's poteto-mode workflows, principles, and review skills | [cursor/plugins/pstack](https://github.com/cursor/plugins/tree/main/pstack) |

## Attribution

`plugins/pstack` is the work of Lauren Tan ([@poteto](https://github.com/poteto)), imported from
[cursor/plugins](https://github.com/cursor/plugins/tree/main/pstack) under the MIT license. Its
original `LICENSE` is kept in that directory, and [`plugins/pstack/UPSTREAM.md`](plugins/pstack/UPSTREAM.md)
records the exact upstream commit.

## License

This repo's own files are MIT ([LICENSE](LICENSE)). Imported plugins keep their own licenses in their directories.
