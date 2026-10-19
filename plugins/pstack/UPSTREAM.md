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

## Patches

## Cursor terms left on purpose

| Term | Files | Why |
| --- | --- | --- |
