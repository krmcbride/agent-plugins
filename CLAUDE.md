# agent-plugins

A Claude Code plugin marketplace. `.claude-plugin/marketplace.json` lists the plugins in `plugins/`.

`plugins/pstack` is generated from upstream by `node scripts/vendor.mjs build pstack`. Change it only through `vendor/pstack/`, with a rule in `claudify.mjs` or a patch made with `save-patch`, never by editing `plugins/pstack` alone. Never edit `vendor/*/upstream/`. The `sync-upstream` skill in `.claude/skills/` covers syncing with upstream and recording changes. CI fails when a generated plugin differs from what its `vendor/` directory builds.
