// UPSTREAM.md: the generated ledger of a plugin's pin and every change made to upstream.

import { FILES } from "./plugin.mjs";

export function ledger(name, { pin, drops, rules, patches, allows }) {
  const lines = [
    `# Upstream`,
    ``,
    `This plugin is generated from upstream by \`node scripts/vendor.mjs build ${name}\`. Do not edit it by hand.`,
    `The pristine upstream copy and every change below live in [\`vendor/${name}/\`](../../vendor/${name}).`,
    ``,
    `- Source: ${pin.repo}/tree/${pin.ref}/${pin.path}`,
    `- Commit: [\`${pin.commit}\`](${pin.repo}/tree/${pin.commit}/${pin.path}) (${pin.commitDate})`,
    `- Upstream version: ${pin.version}`,
    `- License: kept unchanged in [\`LICENSE\`](LICENSE).`,
    ``,
    `## Dropped from upstream`,
    ``,
    ...drops.map(({ path, why }) => `- \`${path}\`: ${why}`),
    ``,
    `## Find-and-replace rules`,
    ``,
    `Applied in order to ${FILES.map((g) => `\`${g}\``).join(" and ")} unless a rule names other files.`,
    ``,
    `| Rule | Replacements | Why |`,
    `| --- | --- | --- |`,
    ...rules.map(({ id, count, touched, why }) => `| \`${id}\` | ${count} in ${touched.length} file${touched.length === 1 ? "" : "s"} | ${why} |`),
    ``,
    `## Patches`,
    ``,
    ...patches.flatMap(({ file, subject, kind, why }) => [
      `### [\`${file}\`](../../vendor/${name}/patches/${file})`,
      ``,
      `**${subject}** (${kind})`,
      ``,
      why,
      ``,
    ]),
    `## Cursor terms left on purpose`,
    ``,
    `| Terms | Files | Why |`,
    `| --- | --- | --- |`,
    ...allows.map(({ terms, files, why }) => `| ${terms.map((t) => `\`${t}\``).join(", ")} | ${files.map((f) => `\`${f}\``).join(", ")} | ${why} |`),
    ``,
  ];
  return lines.join("\n");
}
