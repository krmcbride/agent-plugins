// The build pipeline: upstream, then drop, rules, generate, and links (transform), then patches, then the term scan.

import { matchesGlob, posix } from "node:path";
import { ledger } from "./ledger.mjs";
import { applyPatches, headerProblem, listPatches } from "./patches.mjs";
import { FILES, loadConfig, paths, readPin } from "./plugin.mjs";
import { isText, readTree, text, within } from "./tree.mjs";

export const LEDGER = "UPSTREAM.md";
const matches = (path, globs) => globs.some((glob) => matchesGlob(path, glob));

function count(rule, before) {
  if (typeof rule.find === "string") return before.split(rule.find).length - 1;
  return rule.find.global ? [...before.matchAll(rule.find)].length : Number(rule.find.test(before));
}

// Everything before the patches. Returns a new tree and leaves upstream untouched.
function transform(upstream, config, pin) {
  const problems = [];
  const keys = [...upstream.keys()];
  const tree = new Map(keys.filter((path) => !config.drop.some((d) => within(path, d.path))).map((path) => [path, { ...upstream.get(path) }]));
  for (const { path } of config.drop) {
    if (!keys.some((key) => within(key, path))) problems.push(`drop ${path}: nothing upstream at that path`);
  }
  for (const top of new Set(keys.map((key) => key.split("/")[0]))) {
    if (!config.layout.includes(top) && !config.drop.some((d) => d.path === top)) {
      problems.push(`upstream added ${top}: check whether Claude Code would load it, then drop it or add it to layout`);
    }
  }

  const rules = config.rules.map((rule) => {
    let hits = 0;
    const touched = [];
    for (const [path, entry] of tree) {
      if (!isText(entry) || !matches(path, rule.files ?? FILES)) continue;
      const before = text(entry);
      if (rule.when && !rule.when.test(before)) continue;
      const n = count(rule, before);
      if (n === 0) continue;
      const after = typeof rule.find === "string" ? before.split(rule.find).join(rule.replace) : before.replace(rule.find, rule.replace);
      tree.set(path, { ...entry, bytes: Buffer.from(after) });
      hits += n;
      touched.push(path);
    }
    if (hits === 0) problems.push(`rule ${rule.id}: matched nothing, so upstream no longer needs it. Remove or update it.`);
    return { ...rule, count: hits, touched };
  });

  for (const [path, content] of Object.entries(config.generate({ read: (path) => text(upstream.get(path)) }))) {
    tree.set(path, { bytes: Buffer.from(content), executable: false });
  }

  // A relative link to an upstream file this tree drops points at that file on GitHub, at the pinned commit.
  const inTree = (path) => [...tree.keys()].some((key) => within(key, path));
  for (const [path, entry] of tree) {
    if (!path.endsWith(".md")) continue;
    const linked = text(entry).replace(/\]\(([^)\s]+)\)/g, (link, href) => {
      const target = href.replace(/[#?].*/, "");
      if (!target || /^[a-z][a-z0-9+.-]*:/i.test(target)) return link;
      const resolved = posix.join(posix.dirname(path), target).replace(/\/$/, "");
      if (inTree(resolved) || !keys.some((key) => within(key, resolved))) return link;
      const kind = upstream.has(resolved) ? "blob" : "tree";
      return `](${pin.repo}/${kind}/${pin.commit}/${pin.path}/${resolved}${href.slice(href.search(/[#?]|$/))})`;
    });
    tree.set(path, { ...entry, bytes: Buffer.from(linked) });
  }
  return { tree, problems, rules };
}

// Every scan term left in the scanned files needs an allow entry saying why it is fine in Claude Code.
function scan(tree, { terms, allow }) {
  const problems = [];
  const used = new Set();
  for (const [path, entry] of tree) {
    if (!isText(entry) || !matches(path, FILES)) continue;
    text(entry).split("\n").forEach((line, index) => {
      for (const term of terms) {
        if (!term.re.test(line)) continue;
        const entry = allow.find((a) => a.terms.includes(term.id) && matches(path, a.files) && (!a.lines || a.lines.test(line)));
        if (entry) used.add(entry);
        else problems.push(`term ${term.id}: ${path}:${index + 1} is not translated or allowed\n    ${line.trim().slice(0, 200)}`);
      }
    });
  }
  for (const entry of allow) {
    const unknown = entry.terms.filter((id) => !terms.some((term) => term.id === id));
    if (unknown.length) problems.push(`allow ${unknown.join(", ")}: no scan term has that id`);
    else if (!used.has(entry)) problems.push(`allow ${entry.terms.join(", ")} in ${entry.files.join(", ")}: nothing left to allow. Remove it.`);
  }
  return problems;
}

async function load(name) {
  const p = paths(name);
  const pin = readPin(p);
  const config = await loadConfig(p);
  return { p, pin, config, ...transform(readTree(p.upstream), config, pin), patches: listPatches(p.patches) };
}

// Builds plugins/<name> in memory. If a patch fails, returns the tree from before it and `failed`.
export async function build(name) {
  const { pin, config, tree, problems, rules, patches } = await load(name);
  problems.push(...patches.map(headerProblem).filter(Boolean));
  const result = applyPatches(tree, patches);
  if (result.failed) {
    const { patch, error } = result.failed;
    problems.push(`patch ${patch.file}: does not apply. plugins/${name} now holds the tree before it. ` +
      `Redo its change by hand there, then run: node scripts/vendor.mjs save-patch ${name} ${patch.file}\n${error}`);
    return { tree: result.tree, problems, failed: patch };
  }
  problems.push(...scan(result.tree, config.scan));
  result.tree.set(LEDGER, { bytes: Buffer.from(ledger(name, { pin, drops: config.drop, rules, patches: result.applied, allows: config.scan.allow })), executable: false });
  return { tree: result.tree, problems };
}

// The tree a patch numbered `number` is diffed against: everything before it.
export async function treeBefore(name, number) {
  const { tree, patches } = await load(name);
  const result = applyPatches(tree, patches.filter((patch) => patch.number < number));
  if (result.failed) throw new Error(`patch ${result.failed.patch.file} does not apply. Fix that one first.`);
  return result.tree;
}
