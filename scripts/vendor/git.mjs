// Runs git. Work in the tool's own temporary repositories ignores user and system config, so a personal
// setting such as diff.noprefix cannot change a patch. Talking to upstream keeps the user's config, which
// may hold a proxy or credentials.

import { execFileSync } from "node:child_process";

const run = (env) => (cwd, ...args) => execFileSync("git", args, { cwd, env, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

export const git = run({ ...process.env, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_NOSYSTEM: "1" });
export const gitRemote = run(process.env);
