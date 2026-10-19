// Patch files: a header (Subject:, Kind:, a blank line, a why paragraph), then a git diff.

import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readTree, walk, writeFiles, writeTree } from "./tree.mjs";

export const KINDS = ["claudify", "personal"];
const PLACEHOLDER = "TODO";

const git = (cwd, ...args) => execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

export function listPatches(dir) {
  // Git cannot track an empty folder, so a plugin with no patches has no patches/ folder.
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((file) => /^\d{4}-.+\.patch$/.test(file))
    .sort()
    .map((file) => ({ file, path: join(dir, file), number: Number(file.slice(0, 4)), ...parsePatch(readFileSync(join(dir, file), "utf8")) }));
}

function parsePatch(content) {
  const start = content.search(/^diff --git /m);
  const header = start === -1 ? content : content.slice(0, start);
  const field = (key) => header.match(new RegExp(`^${key}:[ \\t]*(.*)$`, "m"))?.[1].trim() ?? "";
  const why = header.split(/\n\s*\n/).slice(1).join("\n\n").trim();
  return { subject: field("Subject"), kind: field("Kind"), why, header };
}

export function headerProblem({ file, subject, kind, why, header }) {
  if (subject && KINDS.includes(kind) && why && !header.includes(PLACEHOLDER)) return undefined;
  return `patch ${file}: header needs Subject:, Kind: (${KINDS.join(" or ")}), a blank line, and a why paragraph, with no ${PLACEHOLDER} left`;
}

export function header({ subject, kind, why }) {
  return `Subject: ${subject ?? `${PLACEHOLDER} one line saying what this patch changes`}\nKind: ${kind}\n\n${why ?? `${PLACEHOLDER} why this change exists, for someone redoing it after upstream moves.`}\n\n`;
}

// Runs fn in a temporary git repository that holds tree, and removes it afterward.
function withTempRepo(tree, fn) {
  const dir = mkdtempSync(join(tmpdir(), "vendor-"));
  try {
    writeTree(tree, dir);
    git(dir, "init", "-q");
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// Applies patches in order. Returns the patched tree, the patches applied, and the first one that failed.
export function applyPatches(tree, patches) {
  if (!patches.length) return { tree, applied: [] };
  return withTempRepo(tree, (dir) => {
    const applied = [];
    for (const patch of patches) {
      try {
        git(dir, "apply", "--whitespace=nowarn", patch.path);
      } catch (error) {
        return { tree: readTree(dir), applied, failed: { patch, error: error.stderr } };
      }
      applied.push(patch);
    }
    return { tree: readTree(dir), applied };
  });
}

// The git diff that turns base into edited.
export function diffTrees(base, edited) {
  return withTempRepo(base, (dir) => {
    git(dir, "add", "-A");
    git(dir, "-c", "user.name=vendor", "-c", "user.email=vendor@localhost", "commit", "-qm", "base");
    for (const path of walk(dir)) rmSync(join(dir, path));
    writeFiles(edited, dir);
    git(dir, "add", "-A");
    return git(dir, "diff", "--cached", "--binary");
  });
}
