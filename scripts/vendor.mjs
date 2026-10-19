#!/usr/bin/env node
// Builds plugins/<name> from a pristine upstream copy in vendor/<name>/upstream plus the changes
// recorded in vendor/<name>. See USAGE below and .claude/skills/sync-upstream/SKILL.md.

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { build, LEDGER, treeBefore } from "./vendor/build.mjs";
import { diffTrees, header, KINDS, listPatches } from "./vendor/patches.mjs";
import { paths } from "./vendor/plugin.mjs";
import { sync } from "./vendor/sync.mjs";
import { readTree, writeTree } from "./vendor/tree.mjs";

const USAGE = `usage:
  node scripts/vendor.mjs build <name>               write plugins/<name>
  node scripts/vendor.mjs check <name>               fail if plugins/<name> is not what build writes
  node scripts/vendor.mjs sync <name> [ref]          replace vendor/<name>/upstream with upstream at ref
  node scripts/vendor.mjs save-patch <name> <patch> [--kind claudify|personal]
                                                     record edits made in plugins/<name> as a patch`;

const report = (problems) => problems.forEach((problem) => console.log(`FAIL ${problem}`));

async function cmdBuild(name) {
  const { tree, problems, failed } = await build(name);
  writeTree(tree, paths(name).out);
  report(problems);
  if (failed) console.log(`Stopped before patch ${failed.file}.`);
  console.log(problems.length ? `plugins/${name} written with ${problems.length} problem(s).` : `plugins/${name} built.`);
  return problems.length ? 1 : 0;
}

async function cmdCheck(name) {
  const { tree, problems } = await build(name);
  const out = paths(name).out;
  const onDisk = existsSync(out) ? readTree(out) : new Map();
  const drifted = [...new Set([...tree.keys(), ...onDisk.keys()])].sort().filter((path) => {
    const [want, have] = [tree.get(path), onDisk.get(path)];
    return !want || !have || !want.bytes.equals(have.bytes) || want.executable !== have.executable;
  });
  report(problems);
  for (const path of drifted) console.log(`DRIFT plugins/${name}/${path}`);
  if (drifted.length) console.log(`plugins/${name} differs from what vendor/${name} builds. Record hand edits with save-patch, then run build.`);
  if (!problems.length && !drifted.length) console.log(`plugins/${name} is up to date.`);
  return problems.length || drifted.length ? 1 : 0;
}

// Diffs plugins/<name> against the tree before the named patch, or after every patch for a new one.
async function cmdSavePatch(name, patchName, kind) {
  if (!patchName) throw new Error("save-patch needs a patch name");
  const p = paths(name);
  const patches = listPatches(p.patches);
  const short = patchName.replace(/\.patch$/, "");
  const existing = patches.find(({ file }) => file === `${short}.patch` || file.slice(5) === `${short}.patch`);
  const number = existing?.number ?? (patches.at(-1)?.number ?? 0) + 1;
  const file = existing?.file ?? `${String(number).padStart(4, "0")}-${short}.patch`;
  // plugins/<name> holds every later patch too, unless the build stopped at this one.
  if (existing && patches.some((patch) => patch.number > number) && (await build(name)).failed?.file !== file) {
    throw new Error(`${file} has later patches applied in plugins/${name}. Refresh a patch only when the build stops at it, or edit the last patch.`);
  }
  const edited = readTree(p.out);
  edited.delete(LEDGER);
  const diff = diffTrees(await treeBefore(name, number), edited);
  if (!diff) throw new Error(`plugins/${name} has no edits on top of the tree before ${file}`);
  const resolved = kind ?? existing?.kind ?? "claudify";
  mkdirSync(p.patches, { recursive: true });
  writeFileSync(join(p.patches, file), header({ ...existing, kind: resolved }) + diff);
  console.log(existing
    ? `Updated vendor/${name}/patches/${file}. Run: node scripts/vendor.mjs build ${name}`
    : `Wrote vendor/${name}/patches/${file}. Fill in its Subject and why, then run: node scripts/vendor.mjs build ${name}`);
  return 0;
}

const args = process.argv.slice(2);
const kindAt = args.indexOf("--kind");
const kind = kindAt === -1 ? undefined : args.splice(kindAt, 2)[1];
const [command, name, ...rest] = args;
const commands = {
  build: () => cmdBuild(name),
  check: () => cmdCheck(name),
  sync: () => sync(name, rest[0]),
  "save-patch": () => cmdSavePatch(name, rest[0], kind),
};
if (!commands[command] || !name || (kind !== undefined && !KINDS.includes(kind))) {
  console.log(USAGE);
  process.exit(2);
}
try {
  process.exit(await commands[command]());
} catch (error) {
  console.error(`error: ${error.message}`);
  process.exit(1);
}
