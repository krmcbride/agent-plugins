# agent-plugins

A Claude Code plugin marketplace (`.claude-plugin/marketplace.json` lists the plugins in `plugins/`) plus harness-native kstack variants under `harnesses/`.

`plugins/kstack` is the primary Claude Code edition. `harnesses/antigravity/kstack` is the Antigravity-native variant (for Gemini models in `agy`, Antigravity App/IDE, and T3 Code): port the intent of `plugins/kstack` changes using Antigravity's native primitives rather than copying Claude-specific syntax, keep `agents/<role>.md` (minus frontmatter) aligned with `skills/code-review/references/roles/<role>.md`, and check it with `agy plugin validate harnesses/antigravity/kstack`.

`plugins/pstack` is generated from upstream by `node scripts/vendor.mjs build pstack`. Change it only through `vendor/pstack/`, with a rule in `claudify.mjs` or a patch made with `save-patch`, never by editing `plugins/pstack` alone. Never edit `vendor/*/upstream/`. The `sync-upstream` skill in `.claude/skills/` covers syncing with upstream and recording changes. CI fails when a generated plugin differs from what its `vendor/` directory builds.
