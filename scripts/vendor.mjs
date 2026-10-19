#!/usr/bin/env node
// Builds plugins/<name> from a pristine upstream copy in vendor/<name>/upstream plus the
// changes recorded in vendor/<name>: drops, find-and-replace rules, generated files, and
// patches. See .claude/skills/sync-upstream/SKILL.md for the workflow.
//
//   node scripts/vendor.mjs build <name>               write plugins/<name>
//   node scripts/vendor.mjs check <name>               fail if plugins/<name> is not what build writes
//   node scripts/vendor.mjs sync <name> [ref]          replace vendor/<name>/upstream with upstream at ref
//   node scripts/vendor.mjs save-patch <name> <patch> [--kind claudify|personal]
//                                                      record edits made in plugins/<name> as a patch

import { execFileSync } from "node:child_process";
import {
  chmodSync, cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync,
  rmSync, statSync, writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, matchesGlob, posix, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LEDGER = "UPSTREAM.md";
const KINDS = ["claudify", "personal"];
const DEFAULT_FILES = ["skills/**", "agents/**"];

function walk(dir, base = dir) {
  return readdirSync(dir).flatMap((name) => {
    if (name === ".git") return [];
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path, base) : [relative(base, path)];
  });
}

function readTree(dir) {
  const tree = new Map();
  for (const path of walk(dir)) {
    const full = join(dir, path);
    tree.set(path, { bytes: readFileSync(full), executable: (statSync(full).mode & 0o111) !== 0 });
  }
  return tree;
}

function writeTree(tree, dir) {
  rmSync(dir, { recursive: true, force: true });
  for (const [path, { bytes, executable }] of tree) {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), bytes);
    chmodSync(join(dir, path), executable ? 0o755 : 0o644);
  }
}

const isText = ({ bytes }) => !bytes.includes(0);
const text = (entry) => entry.bytes.toString("utf8");
const matches = (path, globs) => globs.some((glob) => matchesGlob(path, glob));
const git = (cwd, ...args) => execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

function paths(name) {
  const dir = join(ROOT, "vendor", name);
  if (!existsSync(join(dir, "upstream.json"))) throw new Error(`vendor/${name}/upstream.json not found`);
  return {
    dir,
    upstream: join(dir, "upstream"),
    pin: join(dir, "upstream.json"),
    config: join(dir, "claudify.mjs"),
    patches: join(dir, "patches"),
    out: join(ROOT, "plugins", name),
  };
}

function listPatches(p) {
  if (!existsSync(p.patches)) return [];
  return readdirSync(p.patches)
    .filter((file) => /^\d{4}-.+\.patch$/.test(file))
    .sort()
    .map((file) => ({ file, number: Number(file.slice(0, 4)), ...parsePatch(readFileSync(join(p.patches, file), "utf8")) }));
}

// A patch file is a header, then a git diff. The header has `Subject:` and `Kind:` lines,
// a blank line, and a paragraph saying why the change exists.
function parsePatch(content) {
  const start = content.search(/^diff --git /m);
  const header = start === -1 ? content : content.slice(0, start);
  const field = (key) => header.match(new RegExp(`^${key}:[ \\t]*(.*)$`, "m"))?.[1].trim() ?? "";
  const why = header.split(/\n\s*\n/).slice(1).join("\n\n").trim();
  return { subject: field("Subject"), kind: field("Kind"), why, header, diff: start === -1 ? "" : content.slice(start) };
}

async function loadConfig(p) {
  if (!existsSync(p.config)) return { drop: [], rules: [], generate: () => ({}), scan: { files: DEFAULT_FILES, terms: [], allow: [] } };
  const config = await import(`${pathToFileURL(p.config).href}?${Date.now()}`);
  return {
    drop: config.drop ?? [],
    rules: config.rules ?? [],
    generate: config.generate ?? (() => ({})),
    scan: { files: DEFAULT_FILES, terms: [], allow: [], ...config.scan },
  };
}

// Builds the plugin tree in memory. With `stopBefore`, stops before that patch number and
// returns the tree a new or refreshed patch is diffed against.
async function build(name, { stopBefore = Infinity } = {}) {
  const p = paths(name);
  const pin = JSON.parse(readFileSync(p.pin, "utf8"));
  const config = await loadConfig(p);
  const upstream = readTree(p.upstream);
  const problems = [];
  const report = { pin, drops: config.drop, rules: [], patches: [], allows: [] };

  const tree = new Map([...upstream].filter(([path]) => !config.drop.some(({ path: d }) => path === d || path.startsWith(`${d}/`))));
  for (const { path } of config.drop) {
    if (![...upstream.keys()].some((key) => key === path || key.startsWith(`${path}/`))) problems.push(`drop ${path}: nothing upstream at that path`);
  }

  for (const rule of config.rules) {
    const files = rule.files ?? DEFAULT_FILES;
    let count = 0;
    const touched = [];
    for (const [path, entry] of tree) {
      if (!isText(entry) || !matches(path, files)) continue;
      const before = text(entry);
      if (rule.when && !rule.when.test(before)) continue;
      const hits = typeof rule.find === "string" ? before.split(rule.find).length - 1
        : rule.find.global ? [...before.matchAll(rule.find)].length
        : Number(rule.find.test(before));
      if (hits === 0) continue;
      const after = typeof rule.find === "string" ? before.split(rule.find).join(rule.replace) : before.replace(rule.find, rule.replace);
      entry.bytes = Buffer.from(after);
      count += hits;
      touched.push(path);
    }
    if (count === 0) problems.push(`rule ${rule.id}: matched nothing, so upstream no longer needs it. Remove or update it.`);
    report.rules.push({ ...rule, count, touched });
  }

  for (const [path, content] of Object.entries(config.generate({ upstream, pin, read: (path) => text(upstream.get(path)) }))) {
    tree.set(path, { bytes: Buffer.from(content), executable: false });
  }

  // A relative link to an upstream file this tree drops points at that file on GitHub, at the pinned commit.
  for (const [path, entry] of tree) {
    if (!path.endsWith(".md")) continue;
    entry.bytes = Buffer.from(text(entry).replace(/\]\(([^)\s]+)\)/g, (link, href) => {
      const target = href.replace(/[#?].*/, "");
      if (!target || /^[a-z][a-z0-9+.-]*:/i.test(target)) return link;
      const resolved = posix.join(posix.dirname(path), target).replace(/\/$/, "");
      if (tree.has(resolved) || [...tree.keys()].some((k) => k.startsWith(`${resolved}/`))) return link;
      const isDir = [...upstream.keys()].some((k) => k.startsWith(`${resolved}/`));
      if (!upstream.has(resolved) && !isDir) return link;
      return `](${pin.repo}/${isDir ? "tree" : "blob"}/${pin.commit}/${pin.path}/${resolved}${href.slice(href.search(/[#?]|$/))})`;
    }));
  }

  const patches = listPatches(p);
  let stoppedAt;
  if (patches.some(({ number }) => number < stopBefore)) {
    const work = mkdtempSync(join(tmpdir(), `vendor-${name}-`));
    try {
      writeTree(tree, work);
      git(work, "init", "-q");
      for (const patch of patches) {
        if (patch.number >= stopBefore) break;
        if (!patch.subject || !KINDS.includes(patch.kind) || !patch.why || /\bTODO\b/.test(patch.header)) {
          problems.push(`patch ${patch.file}: header needs Subject:, Kind: (${KINDS.join(" or ")}), a blank line, and a why paragraph`);
        }
        try {
          git(work, "apply", "--whitespace=nowarn", join(p.patches, patch.file));
        } catch (error) {
          problems.push(`patch ${patch.file}: does not apply. plugins/${name} now holds the tree before it. ` +
            `Redo its change by hand there, then run: node scripts/vendor.mjs save-patch ${name} ${patch.file}\n${error.stderr}`);
          stoppedAt = patch.number;
          break;
        }
        report.patches.push(patch);
      }
      const patched = readTree(work);
      tree.clear();
      for (const [path, entry] of patched) tree.set(path, entry);
    } finally {
      rmSync(work, { recursive: true, force: true });
    }
  }
  if (stoppedAt !== undefined) return { tree, problems, report, stoppedAt };
  if (stopBefore !== Infinity) return { tree, problems, report };

  // Every Cursor term left in scanned files needs an allow entry saying why it is fine in Claude Code.
  const used = new Set();
  for (const [path, entry] of tree) {
    if (!isText(entry) || !matches(path, config.scan.files)) continue;
    text(entry).split("\n").forEach((line, index) => {
      for (const term of config.scan.terms) {
        if (!term.re.test(line)) continue;
        const allow = config.scan.allow.find((a) => a.terms.includes(term.id) && matches(path, a.files));
        if (allow) used.add(allow);
        else problems.push(`term ${term.id}: ${path}:${index + 1} is not translated or allowed\n    ${line.trim().slice(0, 200)}`);
      }
    });
  }
  for (const allow of config.scan.allow) {
    const unknown = allow.terms.filter((id) => !config.scan.terms.some((term) => term.id === id));
    if (unknown.length) problems.push(`allow ${unknown.join(", ")}: no scan term has that id`);
    else if (!used.has(allow)) problems.push(`allow ${allow.terms.join(", ")} in ${allow.files.join(", ")}: nothing left to allow. Remove it.`);
  }
  report.allows = config.scan.allow;
  tree.set(LEDGER, { bytes: Buffer.from(ledger(name, report)), executable: false });
  return { tree, problems, report };
}

function ledger(name, { pin, drops, rules, patches, allows }) {
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
    `Applied in order to ${DEFAULT_FILES.map((g) => `\`${g}\``).join(" and ")} unless a rule names other files.`,
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

function printProblems(problems) {
  for (const problem of problems) console.log(`FAIL ${problem}`);
}

async function cmdBuild(name) {
  const { tree, problems, stoppedAt } = await build(name);
  writeTree(tree, paths(name).out);
  printProblems(problems);
  if (stoppedAt !== undefined) console.log(`Stopped before patch ${String(stoppedAt).padStart(4, "0")}.`);
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
  printProblems(problems);
  for (const path of drifted) console.log(`DRIFT plugins/${name}/${path}`);
  if (drifted.length) console.log(`plugins/${name} differs from what vendor/${name} builds. Record hand edits with save-patch, then run build.`);
  if (!problems.length && !drifted.length) console.log(`plugins/${name} is up to date.`);
  return problems.length || drifted.length ? 1 : 0;
}

async function cmdSync(name, ref) {
  const p = paths(name);
  const pin = JSON.parse(readFileSync(p.pin, "utf8"));
  ref ??= pin.ref;
  const work = mkdtempSync(join(tmpdir(), `vendor-sync-${name}-`));
  try {
    git(work, "clone", "-q", "--filter=blob:none", "--no-checkout", pin.repo, "src");
    const src = join(work, "src");
    const resolve = (rev) => { try { return git(src, "rev-parse", "--verify", "-q", `${rev}^{commit}`).trim(); } catch { return ""; } };
    const target = resolve(`origin/${ref}`) || resolve(ref);
    if (!target) throw new Error(`${pin.repo} has no branch, tag, or commit ${ref}`);
    git(src, "checkout", "-q", target);
    const commit = git(src, "rev-parse", "HEAD").trim();
    if (commit === pin.commit) {
      console.log(`vendor/${name} is already at ${pin.repo}@${commit.slice(0, 7)} (${ref}).`);
      return 0;
    }
    const last = git(src, "log", "-1", "--format=%H %cs", "--", pin.path).trim().split(" ");
    let log;
    try {
      log = git(src, "log", "--format=%h %cs %s", `${pin.commit}..${commit}`, "--", pin.path).trim();
    } catch {
      log = `(the previous pin ${pin.commit} is not in upstream's history)`;
    }
    rmSync(p.upstream, { recursive: true, force: true });
    cpSync(join(src, pin.path), p.upstream, { recursive: true });
    const manifest = join(p.upstream, "plugin.json");
    const version = existsSync(manifest) ? JSON.parse(readFileSync(manifest, "utf8")).version : pin.version;
    writeFileSync(p.pin, `${JSON.stringify({ ...pin, ref, commit, commitDate: last[1], version }, null, 2)}\n`);
    console.log(`vendor/${name}/upstream: ${pin.commit.slice(0, 7)} (${pin.version}) -> ${commit.slice(0, 7)} (${version})`);
    console.log(`Upstream commits touching ${pin.path}/:\n${log || "(none)"}`);
    console.log(`Next: node scripts/vendor.mjs build ${name}`);
    return 0;
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

async function cmdSavePatch(name, patchName, kind) {
  const p = paths(name);
  if (!patchName) throw new Error("save-patch needs a patch name");
  const existing = listPatches(p).find(({ file }) => file === patchName || file.slice(5) === patchName || file.slice(5) === `${patchName}.patch`);
  const patches = listPatches(p);
  const number = existing?.number ?? (patches.length ? patches.at(-1).number + 1 : 1);
  const file = existing?.file ?? `${String(number).padStart(4, "0")}-${patchName.replace(/\.patch$/, "")}.patch`;
  const { tree, problems } = await build(name, { stopBefore: number });
  if (problems.some((problem) => problem.startsWith("patch "))) {
    printProblems(problems);
    throw new Error("an earlier patch does not apply. Fix that one first.");
  }
  const work = mkdtempSync(join(tmpdir(), `vendor-patch-${name}-`));
  try {
    writeTree(tree, work);
    git(work, "init", "-q");
    git(work, "add", "-A");
    git(work, "-c", "user.name=vendor", "-c", "user.email=vendor@localhost", "commit", "-qm", "base");
    for (const path of walk(work)) rmSync(join(work, path));
    const edited = readTree(p.out);
    edited.delete(LEDGER);
    for (const [path, { bytes, executable }] of edited) {
      mkdirSync(dirname(join(work, path)), { recursive: true });
      writeFileSync(join(work, path), bytes);
      chmodSync(join(work, path), executable ? 0o755 : 0o644);
    }
    git(work, "add", "-A");
    const diff = git(work, "diff", "--cached", "--binary");
    if (!diff) throw new Error(`plugins/${name} has no edits on top of the tree before ${file}`);
    const header = existing?.header ?? `Subject: TODO one line saying what this patch changes\nKind: ${kind}\n\nTODO why this change exists, for someone redoing it after upstream moves.\n\n`;
    mkdirSync(p.patches, { recursive: true });
    writeFileSync(join(p.patches, file), header.replace(/^Kind:.*$/m, existing && !kindGiven ? "$&" : `Kind: ${kind}`) + diff);
    console.log(`${existing ? "Updated" : "Wrote"} vendor/${name}/patches/${file}. ${existing ? "" : "Fill in its Subject and why, then "}run: node scripts/vendor.mjs build ${name}`);
    return 0;
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

const [command, name, ...rest] = process.argv.slice(2);
const kindIndex = rest.indexOf("--kind");
const kindGiven = kindIndex !== -1;
const kind = kindGiven ? rest.splice(kindIndex, 2)[1] : "claudify";
const commands = { build: cmdBuild, check: cmdCheck, sync: cmdSync, "save-patch": cmdSavePatch };
if (!commands[command] || !name || !KINDS.includes(kind)) {
  console.log(readFileSync(fileURLToPath(import.meta.url), "utf8").split("\n").slice(1, 11).map((l) => l.replace(/^\/\/ ?/, "")).join("\n"));
  process.exit(2);
}
try {
  process.exit(await commands[command](name, ...(command === "save-patch" ? [rest[0], kind] : rest)));
} catch (error) {
  console.error(`error: ${error.message}`);
  process.exit(1);
}
