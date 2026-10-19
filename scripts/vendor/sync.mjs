// Replaces vendor/<name>/upstream with upstream at a ref and updates the pin, or verifies the copy
// still matches the pin.

import { cpSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { git } from "./git.mjs";
import { paths, readPin } from "./plugin.mjs";
import { readTree } from "./tree.mjs";

function resolve(src, rev) {
  try {
    return git(src, "rev-parse", "--verify", "-q", `${rev}^{commit}`).trim();
  } catch {
    return "";
  }
}

// Clones the upstream repo into a temporary folder and runs fn with it.
function withClone(pin, fn) {
  const work = mkdtempSync(join(tmpdir(), "vendor-sync-"));
  try {
    const src = join(work, "src");
    git(work, "clone", "-q", "--filter=blob:none", "--no-checkout", pin.repo, src);
    return fn(src, work);
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

export function sync(name, ref) {
  const p = paths(name);
  const pin = readPin(p);
  return withClone(pin, (src, work) => {
    const branch = resolve(src, `origin/${ref ?? pin.ref}`);
    const commit = branch || resolve(src, ref ?? pin.ref);
    if (!commit) throw new Error(`${pin.repo} has no branch, tag, or commit ${ref ?? pin.ref}`);
    if (commit === pin.commit) {
      console.log(`vendor/${name} is already at ${pin.repo}@${commit.slice(0, 7)} (${ref ?? pin.ref}).`);
      return 0;
    }
    git(src, "checkout", "-q", commit);
    // Read everything that can fail before touching vendor/, so a failed sync leaves it as it was.
    const { version } = JSON.parse(readFileSync(join(src, pin.path, "plugin.json"), "utf8"));
    const commitDate = git(src, "log", "-1", "--format=%cs", "--", pin.path).trim();
    let log;
    try {
      log = git(src, "log", "--format=%h %cs %s", `${pin.commit}..${commit}`, "--", pin.path).trim();
    } catch {
      log = `(the previous pin ${pin.commit} is not in upstream's history)`;
    }
    const staged = join(work, "upstream");
    cpSync(join(src, pin.path), staged, { recursive: true });
    rmSync(p.upstream, { recursive: true, force: true });
    renameSync(staged, p.upstream);
    // Only a branch is worth following on the next sync. A tag or commit leaves the pinned ref as it was.
    const nextRef = ref && branch ? ref : pin.ref;
    writeFileSync(p.pin, `${JSON.stringify({ ...pin, ref: nextRef, commit, commitDate, version }, null, 2)}\n`);
    console.log(`vendor/${name}/upstream: ${pin.commit.slice(0, 7)} (${pin.version}) -> ${commit.slice(0, 7)} (${version})`);
    console.log(`Upstream commits touching ${pin.path}/:\n${log || "(none)"}`);
    console.log(`Next: node scripts/vendor.mjs build ${name}`);
    return 0;
  });
}

// Fails when vendor/<name>/upstream differs from upstream at the pinned commit.
export function verify(name) {
  const p = paths(name);
  const pin = readPin(p);
  return withClone(pin, (src) => {
    git(src, "checkout", "-q", pin.commit);
    const [want, have] = [readTree(join(src, pin.path)), readTree(p.upstream)];
    const differs = [...new Set([...want.keys(), ...have.keys()])].sort().filter((path) => {
      const [a, b] = [want.get(path), have.get(path)];
      return !a || !b || !a.bytes.equals(b.bytes) || a.executable !== b.executable;
    });
    for (const path of differs) console.log(`DIFFERS vendor/${name}/upstream/${path}`);
    console.log(differs.length ? `vendor/${name}/upstream was edited by hand. Restore it with: git checkout -- vendor/${name}/upstream` : `vendor/${name}/upstream matches ${pin.repo}@${pin.commit.slice(0, 7)}.`);
    return differs.length ? 1 : 0;
  });
}
