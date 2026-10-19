// Replaces vendor/<name>/upstream with upstream at a ref and updates the pin.

import { execFileSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { paths, readPin } from "./plugin.mjs";

const git = (cwd, ...args) => execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

function resolve(src, rev) {
  try {
    return git(src, "rev-parse", "--verify", "-q", `${rev}^{commit}`).trim();
  } catch {
    return "";
  }
}

export function sync(name, ref) {
  const p = paths(name);
  const pin = readPin(p);
  ref ??= pin.ref;
  const work = mkdtempSync(join(tmpdir(), `vendor-sync-${name}-`));
  try {
    const src = join(work, "src");
    git(work, "clone", "-q", "--filter=blob:none", "--no-checkout", pin.repo, src);
    const commit = resolve(src, `origin/${ref}`) || resolve(src, ref);
    if (!commit) throw new Error(`${pin.repo} has no branch, tag, or commit ${ref}`);
    if (commit === pin.commit) {
      console.log(`vendor/${name} is already at ${pin.repo}@${commit.slice(0, 7)} (${ref}).`);
      return 0;
    }
    git(src, "checkout", "-q", commit);
    const commitDate = git(src, "log", "-1", "--format=%cs", "--", pin.path).trim();
    let log;
    try {
      log = git(src, "log", "--format=%h %cs %s", `${pin.commit}..${commit}`, "--", pin.path).trim();
    } catch {
      log = `(the previous pin ${pin.commit} is not in upstream's history)`;
    }
    rmSync(p.upstream, { recursive: true, force: true });
    cpSync(join(src, pin.path), p.upstream, { recursive: true });
    const { version } = JSON.parse(readFileSync(join(p.upstream, "plugin.json"), "utf8"));
    writeFileSync(p.pin, `${JSON.stringify({ ...pin, ref, commit, commitDate, version }, null, 2)}\n`);
    console.log(`vendor/${name}/upstream: ${pin.commit.slice(0, 7)} (${pin.version}) -> ${commit.slice(0, 7)} (${version})`);
    console.log(`Upstream commits touching ${pin.path}/:\n${log || "(none)"}`);
    console.log(`Next: node scripts/vendor.mjs build ${name}`);
    return 0;
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}
