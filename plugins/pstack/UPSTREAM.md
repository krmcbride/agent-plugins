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
- `docs/harness`: Upstream's Claude Code adapter, which agents read at runtime to map Cursor names. This build translates them ahead of time, and the adapter's mappings differ from it.
- `skills/make-bot-ui`: Builds pages that wake a Grok Bot through a Cursor Automations webhook, which Claude Code lacks.

## Find-and-replace rules

Applied in order to `skills/**` and `agents/**` unless a rule names other files.

| Rule | Replacements | Why |
| --- | --- | --- |
| `model-families` | 2 in 2 files | Cursor groups slugs by vendor prefix. Claude Code models group by alias. |
| `model-grok` | 30 in 15 files | Grok is not available in Claude Code. Sonnet keeps a cheaper code model and a second family, so diverse panels stay diverse. Claude Code has no per-subagent fast mode, so `-fast` goes. |
| `model-claude` | 24 in 8 files | `claude-opus-5-5-xhigh` becomes `opus-xhigh`: the Agent tool's `model` alias, then its `effort`. |
| `model-speed` | 24 in 24 files | Claude Code has no per-subagent fast mode, so a subagent's effort is the only dial. |
| `model-notation` | 10 in 10 files | Skills that read model roles say how a `<model>-<effort>` value maps onto the Agent tool, so each skill works when run on its own. |
| `models-rule-path` | 12 in 9 files | Claude Code loads every `~/.claude/rules/*.md` file into each session, so the model rule lives there. It never reads `.mdc` files. |
| `task-tool` | 24 in 15 files | Cursor's `Task` tool is Claude Code's `Agent` tool. |
| `shell-tool` | 3 in 3 files | Cursor's shell tool is `Shell`. Claude Code's is `Bash`. |
| `ask-question` | 6 in 4 files | Cursor's `AskQuestion` is Claude Code's `AskUserQuestion`. |
| `readonly-true` | 2 in 2 files | The Agent tool has no `readonly` parameter, so read-only subagents are told not to edit. |
| `readonly-false` | 5 in 2 files | The Agent tool has no `readonly` parameter, and every Claude Code subagent keeps the session's MCP servers, so Cursor's MCP warnings go. |
| `readonly-judge` | 1 in 1 file | The Agent tool has no `readonly` parameter, so the arena judge is told not to edit. |
| `general-purpose` | 5 in 4 files | Cursor's `generalPurpose` subagent is Claude Code's built-in `general-purpose`. |
| `plugin-agents` | 4 in 4 files | Claude Code scopes plugin agents by plugin name. |
| `agent-background` | 1 in 1 file | Claude Code's subagent frontmatter field is `background`. |
| `mcp-discovery` | 1 in 1 file | Cursor lists MCP servers in an available-tools map and an `mcps/` folder. Claude Code names each MCP tool `mcp__<server>__<tool>`. |
| `loop-command` | 2 in 2 files | Claude Code bundles its own `/loop` command. |
| `cloud-agent-workers` | 2 in 2 files | Claude Code has no Cursor cloud agents. A subagent in its own worktree is the nearest equivalent. |
| `claude-dirs` | 21 in 7 files | Skills, plugins, and plugin manifests live under `.claude` in Claude Code. |
| `claude-worktrees` | 1 in 1 file | Claude Code puts the worktrees it creates in `<repo>/.claude/worktrees/<name>`. |
| `transcripts-dir` | 5 in 5 files | Cursor's system prompt names the workspace's `agent-transcripts/` directory. Claude Code's does not, so the skills spell out where Claude Code keeps transcripts. |
| `transcripts-paths` | 9 in 6 files | Claude Code keeps transcripts in `~/.claude/projects/<project>/`, with no `agent-transcripts/` folder. |
| `transcripts-layout` | 1 in 1 file | A Claude Code transcript is `<session>.jsonl`, with subagents in `<session>/subagents/`, and its folder name turns every character other than a letter or digit into `-`. |

## Patches

### [`0001-poteto-mode-claude-code.patch`](../../vendor/pstack/patches/0001-poteto-mode-claude-code.patch)

**Add a Claude Code paragraph to poteto-mode's Subagents section** (claudify)

Covers what a word-for-word rule cannot: how to run another pstack skill
when the Skill tool refuses it, what replaces the Agent fields Claude
Code lacks, how deep subagents nest, and what to do when a step needs
a Cursor-only feature. Effort is the only per-subagent dial, so the
fast-mode guidance goes. poteto-mode is the hub every playbook runs
under, so this one paragraph reaches all of them.

### [`0002-setup-pstack-claude-code.patch`](../../vendor/pstack/patches/0002-setup-pstack-claude-code.patch)

**Make setup-pstack detect models and write its rule for Claude Code** (claudify)

Claude Code has no models API, so setup-pstack reads the Agent tool's
`model` and `effort` values and treats each pair as a slug. Claude Code
loads every `~/.claude/rules/*.md` file into each session and needs no
frontmatter, so the Cursor `alwaysApply` header goes. The Grok ceiling
and the trailing `fast` token no longer exist, so the budget ladder
only moves the last token. The rule's comments say how a value maps
onto the Agent tool, since every session loads them.

### [`0003-swarm-worktrees.patch`](../../vendor/pstack/patches/0003-swarm-worktrees.patch)

**Run swarm workers in worktrees instead of Cursor cloud agents** (claudify)

Cursor gives each swarm worker its own cloud machine through
`environment: "cloud"` and `cloud_base_branch`. Claude Code's Agent
tool has neither, and its nearest equivalent is `isolation: "worktree"`,
which gives each worker its own checkout. A worker names its starting
branch in its brief.

### [`0004-worktree-audit-claude-transcripts.patch`](../../vendor/pstack/patches/0004-worktree-audit-claude-transcripts.patch)

**Point worktree-audit.sh at Claude Code's transcript folders** (claudify)

Cursor keeps one agent-transcripts folder per workspace. Claude Code
keeps one folder per working directory under ~/.claude/projects, named
with every non-alphanumeric character turned into `-`, so a chat in a
worktree lands in that worktree's own folder. The script now searches
the main worktree's folder and every folder whose name extends it.

### [`0005-poteto-help-claude-code.patch`](../../vendor/pstack/patches/0005-poteto-help-claude-code.patch)

**Answer poteto-help questions for this Claude Code build** (claudify)

poteto-help tells users how to install, start, and keep pstack on. Those
answers are Cursor UI, Cursor's own marketplace, and a runtime adapter
this build does not need. It now gives this marketplace's install
commands, the `/pstack:` prefix, links to this repository and to Claude
Code's docs, and names Claude Code's built-ins in place of Cursor's.
Its row for `/make-bot-ui` goes with that dropped skill. The README and guide
still describe Cursor, so poteto-help no longer defers to them on
installing, starting, or running pstack.

## Cursor terms left on purpose

| Terms | Files | Why |
| --- | --- | --- |
| `readonly`, `environment`, `cloud-agent`, `cursor-modes`, `cursor-team-kit`, `cursor` | `skills/poteto-mode/SKILL.md`, `skills/poteto-help/SKILL.md` | The Claude Code passages added by patches name the Cursor feature they replace, and the rest point at features the poteto-mode passage tells agents to skip. |
| `bugbot` | `skills/poteto-mode/**`, `skills/reflect/references/synthesizer.md` | Bugbot posts ordinary GitHub review threads, which the playbooks and the PR watcher triage through `gh`. Without Bugbot on a repo, these steps find nothing. |
| `cursor-team-kit` | `skills/poteto-mode/playbooks/*.md` | `deslop`, `control-ui`, and `control-cli` have no Claude Code equivalent yet. poteto-mode says to skip such a step with a note. A personal patch can point these at my own skills. |
| `cursor` | `skills/automate-me/SKILL.md`, `skills/reflect/SKILL.md`, `skills/poteto-mode/playbooks/authoring-a-skill.md` | These name Cursor's built-in `create-skill`. Claude Code has none, and poteto-mode says to write the skill by hand in the Agent Skills format. |
| `cursor` | `skills/poteto-mode/playbooks/babysit.md` | Says the playbook replaces Cursor's built-in babysit skill. Claude Code has no such skill, so the sentence is harmless. |
| `cursor` | `skills/poteto-mode/playbooks/worktree-cleanup.md` | Lists Cursor's macOS cache folder among disk space to reclaim. A missing folder costs nothing. |
| `environment`, `cloud-agent`, `cursor` | `skills/poteto-mode/playbooks/orchestrate.md` | Orchestrate is built on Cursor cloud agents and nested spawns. poteto-mode maps cloud workers to worktrees and runs nested coordinators in the chat. A closer port is a candidate patch. |
| `cursor-model` | `skills/reflect/references/synthesizer.md` | An example commit message that mentions `gpt-4`, not a model choice. |
