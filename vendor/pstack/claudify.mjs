// How plugins/pstack differs from upstream. scripts/vendor.mjs applies, in order: drop, rules,
// generate, then patches/*.patch. Afterward every scan term left in skills/ and agents/ needs an
// allow entry. See .claude/skills/sync-upstream/SKILL.md.

export const drop = [
  { path: ".cursor-plugin", why: "Cursor's manifest. Claude Code reads the generated `.claude-plugin/plugin.json`." },
  { path: "plugin.json", why: "agent-plugins.org manifest, which Claude Code ignores. Its metadata moves to `.claude-plugin/plugin.json`." },
  { path: "automations", why: "Benny runs on Cursor Automations, which Claude Code lacks. Links to it point at upstream." },
];

// Claude Code reads .claude-plugin/plugin.json. Upstream's plugin.json carries the same metadata.
export function generate({ read }) {
  const { $schema, ...manifest } = JSON.parse(read("plugin.json"));
  return { ".claude-plugin/plugin.json": `${JSON.stringify(manifest, null, 2)}\n` };
}
