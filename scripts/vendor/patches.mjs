// Patch files: a header (Subject:, Kind:, a blank line, a why paragraph), then a git diff.

import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { git } from "./git.mjs";
import { readTree, walk, writeFiles, writeTree } from "./tree.mjs";

export const KINDS = ["claudify", "personal"];
const SUBJECT = "TODO one line saying what this patch changes";
const WHY = "TODO why this change exists, for someone redoing it after upstream moves.";

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
  if (subject && KINDS.includes(kind) && why && !header.includes(SUBJECT) && !header.includes(WHY)) return undefined;
  return `patch ${file}: header needs Subject:, Kind: (${KINDS.join(" or ")}), a blank line, and a why paragraph, with the TODO placeholders replaced`;
}

export function header({ subject, kind, why }) {
  return `Subject: ${subject ?? SUBJECT}\nKind: ${kind}\n\n${why ?? WHY}\n\n`;
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

// Applies patches in order, or reverts them in reverse order. Returns the resulting tree, the patches
// applied, and the first one that failed.
export function applyPatches(tree, patches, { reverse = false } = {}) {
  if (!patches.length) return { tree, applied: [] };
  return withTempRepo(tree, (dir) => {
    const applied = [];
    for (const patch of reverse ? [...patches].reverse() : patches) {
      try {
        git(dir, "apply", "--whitespace=nowarn", ...(reverse ? ["--reverse"] : []), patch.path);
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
    // --force, because the plugin's own .gitignore must not hide plugin files from the diff.
    git(dir, "add", "-A", "--force");
    git(dir, "-c", "user.name=vendor", "-c", "user.email=vendor@localhost", "commit", "-q", "--no-verify", "--no-gpg-sign", "-m", "base");
    for (const path of walk(dir)) rmSync(join(dir, path));
    writeFiles(edited, dir);
    git(dir, "add", "-A", "--force");
    return git(dir, "diff", "--cached", "--binary", "--no-ext-diff", "--no-color", "--src-prefix=a/", "--dst-prefix=b/");
  });
}
