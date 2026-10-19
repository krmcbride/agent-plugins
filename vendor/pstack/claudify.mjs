// How plugins/pstack differs from upstream. scripts/vendor.mjs applies, in order: layout and drop,
// rules, generate, then patches/*.patch. Afterward every scan term left in skills/ and agents/ needs an
// allow entry. See .claude/skills/sync-upstream/SKILL.md.

// Upstream's top-level entries that ship. Any other top-level entry must be in drop, so a new one, such as
// a Cursor hooks folder, fails the build until someone decides whether Claude Code should load it.
export const layout = [".gitignore", "LICENSE", "README.md", "agents", "assets", "docs", "skills"];

export const drop = [
  { path: ".cursor-plugin", why: "Cursor's manifest. Claude Code reads the generated `.claude-plugin/plugin.json`." },
  { path: "plugin.json", why: "agent-plugins.org manifest, which Claude Code ignores. Its metadata moves to `.claude-plugin/plugin.json`." },
  { path: "automations", why: "Benny runs on Cursor Automations, which Claude Code lacks. Links to it point at upstream." },
  { path: "docs/harness", why: "Upstream's Claude Code adapter, which agents read at runtime to map Cursor names. This build translates them ahead of time, and the adapter's mappings differ from it." },
  { path: "skills/make-bot-ui", why: "Builds pages that wake a Grok Bot through a Cursor Automations webhook, which Claude Code lacks." },
];

// Claude Code reads .claude-plugin/plugin.json. Upstream's plugin.json carries the same metadata. With no
// `version`, Claude Code versions the plugin by git commit, so every change here reaches installed copies,
// not only those that come with an upstream version bump. UPSTREAM.md records upstream's version.
export function generate({ read }) {
  const { $schema, version, ...manifest } = JSON.parse(read("plugin.json"));
  return { ".claude-plugin/plugin.json": `${JSON.stringify(manifest, null, 2)}\n` };
}

// Where Claude Code keeps a project's transcripts, for rules that replace Cursor's agent-transcripts/.
const TRANSCRIPTS =
  "`~/.claude/projects/<project>/`, where `<project>` is the working directory with every character other than a letter or digit turned into `-`";

export const rules = [
  // Models. Cursor slugs fold model and effort together; Claude Code's Agent tool takes `model` and `effort`.
  {
    id: "model-families",
    why: "Cursor groups slugs by vendor prefix. Claude Code models group by alias.",
    find: /Families go by prefix: `claude-\*`, and `grok-\*` with `cursor-grok-\*` and `composer-\*`\. A refused `composer-\*` entry runs on (?:`[^`]+`|[^.`]+)\./g,
    replace: "Families go by model alias: `opus-*`, `sonnet-*`, `haiku-*`, `fable-*`.",
  },
  {
    id: "model-grok",
    why: "Grok is not available in Claude Code. Sonnet keeps a cheaper code model and a second family, so diverse panels stay diverse. Claude Code has no per-subagent fast mode, so `-fast` goes.",
    find: /\bgrok-4\.7-(low|medium|high|xhigh|max)-fast\b/g,
    replace: "sonnet-$1",
  },
  {
    id: "model-claude",
    why: "`claude-opus-5-5-xhigh` becomes `opus-xhigh`: the Agent tool's `model` alias, then its `effort`.",
    find: /\bclaude-(opus|sonnet|haiku|fable)-\d+-\d+-(low|medium|high|xhigh|max)\b/g,
    replace: "$1-$2",
  },
  {
    id: "model-speed",
    why: "Claude Code has no per-subagent fast mode, so a subagent's effort is the only dial.",
    find: "reasoning level and fast or standard speed for the job",
    replace: "reasoning effort for the job",
  },
  {
    id: "model-notation",
    why: "Skills that read model roles say how a `<model>-<effort>` value maps onto the Agent tool, so each skill works when run on its own.",
    files: ["skills/*/SKILL.md"],
    when: /pstack-models|\/setup-pstack/,
    find: /^(# .*)\n/m,
    replace: "$1\n\nIn Claude Code, a model value such as `opus-xhigh` is `<model>-<effort>`: pass the Agent tool `model: \"opus\"` and `effort: \"xhigh\"`. For `auto` or `inherit-parent`, omit both.\n",
  },
  {
    id: "models-rule-path",
    why: "Claude Code loads every `~/.claude/rules/*.md` file into each session, so the model rule lives there. It never reads `.mdc` files.",
    find: /(~\/\.cursor\/rules\/)?pstack-models\.mdc/g,
    replace: (_, dir) => `${dir ? "~/.claude/rules/" : ""}pstack-models.md`,
  },

  // Tools and subagent parameters.
  {
    id: "task-tool",
    why: "Cursor's `Task` tool is Claude Code's `Agent` tool.",
    find: /\ba (`?)Task\b|`Task`|\bTask(?= (?:(?:tool|subagent|call|spawn|schema)\b|`model`))/g,
    replace: (match, tick) => (match.startsWith("a ") ? `an ${tick}Agent` : match.replace("Task", "Agent")),
  },
  {
    id: "shell-tool",
    why: "Cursor's shell tool is `Shell`. Claude Code's is `Bash`.",
    find: /\bShell(?=, Grep)/g,
    replace: "Bash",
  },
  {
    id: "ask-question",
    why: "Cursor's `AskQuestion` is Claude Code's `AskUserQuestion`.",
    find: /\bAskQuestion\b/g,
    replace: "AskUserQuestion",
  },
  {
    id: "readonly-true",
    why: "The Agent tool has no `readonly` parameter, so read-only subagents are told not to edit.",
    find: /`subagent_type: generalPurpose`(,| and) `readonly: true`/g,
    replace: "`subagent_type: general-purpose`$1 a brief that says not to edit files",
  },
  {
    id: "readonly-false",
    why: "The Agent tool has no `readonly` parameter, and every Claude Code subagent keeps the session's MCP servers, so Cursor's MCP warnings go.",
    find: / \(`readonly: false`\)|, and readonly strips MCPs| with `readonly: false` \(agent mode\)\. \*\*Do not use readonly\/Ask mode\.\*\* It strips MCP access, which disables the MCP-backed investigators and the synthesizer's citation spot-checks/g,
    replace: (match) => (match.includes("investigators") ? ", which keeps MCP access for the MCP-backed investigators and the synthesizer's citation spot-checks" : ""),
  },
  {
    id: "readonly-judge",
    why: "The Agent tool has no `readonly` parameter, so the arena judge is told not to edit.",
    find: "Spawn one readonly judge subagent on that model.",
    replace: "Spawn one judge subagent on that model, with a brief that says not to edit files.",
  },
  {
    id: "general-purpose",
    why: "Cursor's `generalPurpose` subagent is Claude Code's built-in `general-purpose`.",
    find: /\bgeneralPurpose\b/g,
    replace: "general-purpose",
  },
  {
    id: "plugin-agents",
    why: "Claude Code scopes plugin agents by plugin name.",
    find: /"(poteto-agent|comment-sicko)"/g,
    replace: '"pstack:$1"',
  },
  {
    id: "agent-background",
    why: "Claude Code's subagent frontmatter field is `background`.",
    files: ["agents/**"],
    find: /^is_background: true$/m,
    replace: "background: true",
  },

  {
    id: "mcp-discovery",
    why: "Cursor lists MCP servers in an available-tools map and an `mcps/` folder. Claude Code names each MCP tool `mcp__<server>__<tool>`.",
    find: "list the available MCPs from the Cursor environment. Use the available-tools map when present. Otherwise inspect the `mcps/` directory Cursor exposes for enabled MCP servers.",
    replace: "list the available MCPs from this session's tools. Claude Code names each MCP tool `mcp__<server>__<tool>`, and a deferred tool counts even before you load its schema.",
  },
  {
    id: "loop-command",
    why: "Claude Code bundles its own `/loop` command.",
    find: "Cursor's `/loop` command",
    replace: "Claude Code's `/loop` command",
  },
  {
    id: "cloud-agent-workers",
    why: "Claude Code has no Cursor cloud agents. A subagent in its own worktree is the nearest equivalent.",
    find: /\b(Each owner is|each) a Cursor cloud agent\b/g,
    replace: "$1 a subagent in its own worktree",
  },

  // Paths.
  {
    id: "claude-dirs",
    why: "Skills, plugins, and plugin manifests live under `.claude` in Claude Code.",
    find: /\.cursor\/(skills|plugins)\/|\.cursor-plugin\/plugin\.json/g,
    replace: (match) => match.replace("cursor", "claude"),
  },
  {
    id: "claude-worktrees",
    why: "Claude Code puts the worktrees it creates in `<repo>/.claude/worktrees/<name>`.",
    find: "`.cursor/worktrees/myrepo/x`",
    replace: "`myrepo/.claude/worktrees/x`",
  },
  {
    id: "transcripts-dir",
    why: "Cursor's system prompt names the workspace's `agent-transcripts/` directory. Claude Code's does not, so the skills spell out where Claude Code keeps transcripts.",
    find: /the active workspace's `agent-transcripts\/` directory \(the system prompt names (?:this|the) path|The system prompt names the workspace's `agent-transcripts\/` directory\.|in the `agent-transcripts\/` directory the system prompt names\./g,
    replace: (match) =>
      match.startsWith("the active") ? `the active workspace's transcript directory (${TRANSCRIPTS}`
      : match.startsWith("The system") ? `They live in ${TRANSCRIPTS}.`
      : `in ${TRANSCRIPTS}.`,
  },
  {
    id: "transcripts-paths",
    why: "Claude Code keeps transcripts in `~/.claude/projects/<project>/`, with no `agent-transcripts/` folder.",
    find: /~\/\.cursor\/projects\/\*\/|<agent-transcripts>|under `agent-transcripts\/`/g,
    replace: (match) => (match.startsWith("~") ? "~/.claude/projects/*/" : match.startsWith("<") ? "~/.claude/projects/<project>" : "under `~/.claude/projects/`"),
  },
  {
    id: "transcripts-layout",
    why: "A Claude Code transcript is `<session>.jsonl`, with subagents in `<session>/subagents/`, and its folder name turns every character other than a letter or digit into `-`.",
    find: '`~/.cursor/projects/<slug>/agent-transcripts/<uuid>/<uuid>.jsonl`, where `<slug>` is the workspace path with the leading slash dropped and each "/" turned into "-" (so `/Users/you/proj` becomes `Users-you-proj`)',
    replace: '`~/.claude/projects/<slug>/<session>.jsonl`, with subagent transcripts in `<session>/subagents/`, where `<slug>` is the workspace path with every character other than a letter or digit turned into "-" (so `/Users/you/proj` becomes `-Users-you-proj`)',
  },
];

export const scan = {
  terms: [
    { id: "Task", re: /`Task`|\bTask (tool|subagent|call|spawn|schema|`model`)|\ba Task\b/ },
    { id: "AskQuestion", re: /\bAskQuestion\b/ },
    { id: "Shell", re: /\bShell\b/ },
    { id: "generalPurpose", re: /generalPurpose/ },
    { id: "readonly", re: /readonly(: (true|false)| strips|\/Ask| judge)/ },
    { id: "environment", re: /environment: "(cloud|local)"|cloud_base_branch/ },
    { id: "file_attachments", re: /file_attachments/ },
    { id: "is_background", re: /is_background/ },
    { id: "plugin-agent", re: /"(poteto-agent|comment-sicko)"/ },
    { id: "cursor-model", re: /\b(claude-[a-z]+-\d|grok-\d|cursor-grok|composer-|gpt-\d)/ },
    { id: "mdc-rule", re: /\.mdc\b|alwaysApply/ },
    { id: "cursor-path", re: /\.cursor\/|\.cursor-plugin/ },
    { id: "agent-transcripts", re: /agent-transcripts/ },
    { id: "cursor-team-kit", re: /cursor-team-kit/ },
    { id: "bugbot", re: /Bugbot/ },
    { id: "cursor-automations", re: /Cursor [Aa]utomations?|cursor\.sh\/automations|X-Automation-Key/ },
    { id: "cloud-agent", re: /[Cc]loud agents?/ },
    { id: "cursor-modes", re: /Custom Modes?|Plan Mode/ },
    { id: "cursor", re: /\bCursor('s)?\b/ },
  ],
  allow: [
    {
      terms: ["readonly", "environment", "cloud-agent", "cursor-modes", "cursor-team-kit", "cursor"],
      files: ["skills/poteto-mode/SKILL.md", "skills/poteto-help/SKILL.md"],
      // These are the most-edited files upstream, so the entry covers only these passages, and new Cursor wording still fails.
      lines: /^\*\*Claude Code\.\*\*|Cursor's built-in for authoring|`cursor-team-kit`|not Cursor's built-in babysit skill|a Cursor restart|^This file maps questions|^This build translates|has no Custom Modes/,
      why: "The Claude Code passages added by patches name the Cursor feature they replace, and the rest point at features the poteto-mode passage tells agents to skip.",
    },
    {
      terms: ["bugbot"],
      files: ["skills/poteto-mode/**", "skills/reflect/references/synthesizer.md"],
      why: "Bugbot posts ordinary GitHub review threads, which the playbooks and the PR watcher triage through `gh`. Without Bugbot on a repo, these steps find nothing.",
    },
    {
      terms: ["cursor-team-kit"],
      files: ["skills/poteto-mode/playbooks/*.md"],
      why: "`deslop`, `control-ui`, and `control-cli` have no Claude Code equivalent yet. poteto-mode says to skip such a step with a note. A personal patch can point these at my own skills.",
    },
    {
      terms: ["cursor"],
      files: ["skills/automate-me/SKILL.md", "skills/reflect/SKILL.md", "skills/poteto-mode/playbooks/authoring-a-skill.md"],
      why: "These name Cursor's built-in `create-skill`. Claude Code has none, and poteto-mode says to write the skill by hand in the Agent Skills format.",
    },
    {
      terms: ["cursor"],
      files: ["skills/poteto-mode/playbooks/babysit.md"],
      why: "Says the playbook replaces Cursor's built-in babysit skill. Claude Code has no such skill, so the sentence is harmless.",
    },
    {
      terms: ["cursor"],
      files: ["skills/poteto-mode/playbooks/worktree-cleanup.md"],
      why: "Lists Cursor's macOS cache folder among disk space to reclaim. A missing folder costs nothing.",
    },
    {
      terms: ["environment", "cloud-agent", "cursor"],
      files: ["skills/poteto-mode/playbooks/orchestrate.md"],
      lines: /^- \*\*Worker \/ verifier\.\*\*|in the Cursor dashboard|^- After a Cursor restart/,
      why: "Orchestrate is built on Cursor cloud agents and nested spawns. poteto-mode maps cloud workers to worktrees and runs nested coordinators in the chat. A closer port is a candidate patch.",
    },
    {
      terms: ["cursor-model"],
      files: ["skills/reflect/references/synthesizer.md"],
      why: "An example commit message that mentions `gpt-4`, not a model choice.",
    },
  ],
};
