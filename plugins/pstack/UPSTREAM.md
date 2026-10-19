# Upstream

This plugin is generated from upstream by `node scripts/vendor.mjs build pstack`. Do not edit it by hand.
The pristine upstream copy and every change below live in [`vendor/pstack/`](../../vendor/pstack).

- Source: https://github.com/cursor/plugins/tree/main/pstack
- Commit: [`d457567332aa6989e753ea289f30ea2bfbc80bc0`](https://github.com/cursor/plugins/tree/d457567332aa6989e753ea289f30ea2bfbc80bc0/pstack) (2026-10-19)
- Upstream version: 0.15.28
- License: kept unchanged in [`LICENSE`](LICENSE).

## Dropped from upstream

- `.cursor-plugin`: Cursor's manifest. Claude Code reads the generated `.claude-plugin/plugin.json`.
- `plugin.json`: agent-plugins.org manifest, which Claude Code ignores. Its metadata moves to `.claude-plugin/plugin.json`.
- `automations`: Benny runs on Cursor Automations, which Claude Code lacks. Links to it point at upstream.

## Find-and-replace rules

Applied in order to `skills/**` and `agents/**` unless a rule names other files.

| Rule | Replacements | Why |
| --- | --- | --- |
| `model-families` | 2 in 2 files | Cursor groups slugs by vendor prefix. Claude Code models group by alias. |
| `model-grok` | 30 in 15 files | Grok is not available in Claude Code. Sonnet keeps a cheaper code model and a second family, so diverse panels stay diverse. Claude Code has no per-subagent fast mode, so `-fast` goes. |
| `model-claude` | 24 in 8 files | `claude-opus-5-5-xhigh` becomes `opus-xhigh`: the Agent tool's `model` alias, then its `effort`. |
| `model-notation` | 9 in 9 files | Skills that read model roles say how a `<model>-<effort>` value maps onto the Agent tool, so each skill works when run on its own. |
| `models-rule-path` | 12 in 9 files | Claude Code loads every `~/.claude/rules/*.md` file into each session, so the model rule lives there. It never reads `.mdc` files. |
| `task-tool` | 21 in 15 files | Cursor's `Task` tool is Claude Code's `Agent` tool. |
| `ask-question` | 6 in 4 files | Cursor's `AskQuestion` is Claude Code's `AskUserQuestion`. |
| `readonly-true` | 2 in 2 files | The Agent tool has no `readonly` parameter, so read-only subagents are told not to edit. |
| `readonly-false` | 5 in 2 files | The Agent tool has no `readonly` parameter, and every Claude Code subagent keeps the session's MCP servers, so Cursor's MCP warnings go. |
| `readonly-judge` | 1 in 1 file | The Agent tool has no `readonly` parameter, so the arena judge is told not to edit. |
| `general-purpose` | 5 in 4 files | Cursor's `generalPurpose` subagent is Claude Code's built-in `general-purpose`. |
| `plugin-agents` | 4 in 4 files | Claude Code scopes plugin agents by plugin name. |
| `agent-background` | 1 in 1 file | Claude Code's subagent frontmatter field is `background`. |
| `claude-dirs` | 21 in 7 files | Skills, plugins, and plugin manifests live under `.claude` in Claude Code. |
| `claude-worktrees` | 1 in 1 file | Claude Code puts the worktrees it creates in `<repo>/.claude/worktrees/<name>`. |
| `transcripts-dir` | 5 in 5 files | Cursor's system prompt names the workspace's `agent-transcripts/` directory. Claude Code's does not, so the skills spell out where Claude Code keeps transcripts. |
| `transcripts-paths` | 9 in 6 files | Claude Code keeps transcripts in `~/.claude/projects/<project>/`, with no `agent-transcripts/` folder. |
| `transcripts-layout` | 1 in 1 file | A Claude Code transcript is `<session>.jsonl`, with subagents in `<session>/subagents/`, and its folder name turns every character other than a letter or digit into `-`. |

## Patches

## Cursor terms left on purpose

| Term | Files | Why |
| --- | --- | --- |
