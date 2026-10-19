// Where a vendored plugin's parts live, and how to read its pin and config.

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// Files that rules and the term scan apply to unless a rule names others.
export const FILES = ["skills/**", "agents/**"];

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

export function paths(name) {
  const dir = join(ROOT, "vendor", name);
  if (!existsSync(join(dir, "upstream.json"))) throw new Error(`vendor/${name}/upstream.json not found`);
  return {
    upstream: join(dir, "upstream"),
    pin: join(dir, "upstream.json"),
    config: join(dir, "claudify.mjs"),
    patches: join(dir, "patches"),
    out: join(ROOT, "plugins", name),
  };
}

export const readPin = (p) => JSON.parse(readFileSync(p.pin, "utf8"));

export async function loadConfig(p) {
  const { drop, rules, generate, scan } = await import(pathToFileURL(p.config).href);
  for (const [key, value] of Object.entries({ drop, rules, generate, scan })) {
    if (value === undefined) throw new Error(`${p.config} must export ${key}`);
  }
  return { drop, rules, generate, scan };
}
