// A plugin tree in memory: a Map from relative path to { bytes, executable }.

import { chmodSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";

export function walk(dir, base = dir) {
  return readdirSync(dir).flatMap((name) => {
    if (name === ".git") return [];
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path, base) : [relative(base, path)];
  });
}

export function readTree(dir) {
  const tree = new Map();
  for (const path of walk(dir)) {
    const full = join(dir, path);
    tree.set(path, { bytes: readFileSync(full), executable: (statSync(full).mode & 0o111) !== 0 });
  }
  return tree;
}

// Writes every entry into dir, leaving anything else there in place.
export function writeFiles(tree, dir) {
  for (const [path, { bytes, executable }] of tree) {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), bytes);
    chmodSync(join(dir, path), executable ? 0o755 : 0o644);
  }
}

export function writeTree(tree, dir) {
  rmSync(dir, { recursive: true, force: true });
  writeFiles(tree, dir);
}

export const isText = ({ bytes }) => !bytes.includes(0);
export const text = (entry) => entry.bytes.toString("utf8");
// Whether path is dir itself or a file under it.
export const within = (path, dir) => path === dir || path.startsWith(`${dir}/`);
