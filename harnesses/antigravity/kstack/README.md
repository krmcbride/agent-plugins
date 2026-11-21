# kstack (Antigravity)

The Antigravity-native variant of [kstack](../../../plugins/kstack), written for Gemini models running in Antigravity (`agy` CLI, Antigravity App/IDE, and T3 Code's Antigravity ACP harness).

It carries the same engineering method, review protocol, Git workflows, and visuals as Claude Code's `plugins/kstack`, adapted to Antigravity's own tools instead of a lowest-common-denominator abstraction: `invoke_subagent`, `define_subagent`, `send_message`, `manage_subagents`, `ask_question`, artifacts, reactive wakeup, and native Mermaid / inline HTML rendering.

## Contents

### Engineering method

| Skill | What it does |
| --- | --- |
| `engineering-principles` | Index of 22 principles named by the situation each applies to, with one reference file per principle |
| `debugging` | Reproduce, root-cause, fix, and verify a defect, or diagnose a runtime symptom or captured profile |
| `performance` | Baseline, find the limiter, and keep or revert each change; includes a sustained loop and benchmark checklist |
| `refactoring` | Pin behavior, subtract, reshape in small passing steps, and prove behavior unchanged |
| `prototyping` | Settle a design or behavioral question with a throwaway sketch instead of asking |
| `implementation-workflow` | Plan substantial work as an outcome-level contract, execute through Antigravity's subagent and workflow primitives, and verify the result |
| `decision-interview` | Separate discoverable facts from user-owned decisions and settle them one question at a time via `ask_question` |

### Review

| Component | Name | What it does |
| --- | --- | --- |
| Skill | `code-review` | Picks the review approach and depth, builds the review packet, and dispatches Antigravity subagents |
| Skill | `code-shape` | Rubric for module size, single responsibility, and dead weight, with hard stops |
| Subagent | `code-reviewer` | Review-only senior reviewer; reads `engineering-principles` references before citing them |
| Subagent | `review-critic` | Review-only critic for adversarial review and refute-first verifier of individual findings |
| Subagent | `shape-reviewer` | Review-only code-shape reviewer; applies `code-shape` and `engineering-principles` |

### Git

| Skill | What it does |
| --- | --- |
| `git-workflows` | Commits, history rewrites, branch publication, GitHub pull requests, and `gh stack` chains, each loaded on demand |
| `researching-github-repositories` | Answers questions about GitHub repositories from `gh` metadata or a disposable shallow clone, read-only |

### Visualize

| Skill | What it does |
| --- | --- |
| `show-me` | Runs via `/show-me` (`disable-model-invocation: true`) to explain the current topic with text views, native Mermaid, inline HTML rendering when available, or a Pele diagram page |

Antigravity does not add a `kstack:` prefix to skills or subagents. Invoke skills explicitly with `/engineering-principles`, `/code-review`, `/show-me`, and so on, or let Antigravity load them from their descriptions.

## Install

### Standalone `agy` CLI / Antigravity App

Install directly from GitHub or a local checkout:

```sh
agy plugin install https://github.com/krmcbride/agent-plugins/tree/master/harnesses/antigravity/kstack
```

Validate changes locally with:

```sh
agy plugin validate harnesses/antigravity/kstack
```

### T3 Code (or skills-only setups such as Home Manager)

T3 Code runs `agy acp` with a private `GEMINI_HOME` and automatically links `~/.gemini/config/skills/` and `~/.gemini/config/skills.json`, but does not link `~/.gemini/config/plugins/`.

To use this variant in both `agy` CLI and T3 Code from one source, point `~/.gemini/config/skills.json` at this directory's `skills/` folder (or symlink the skill folders into `~/.gemini/config/skills/`):

```json
{
  "entries": [
    { "path": "/path/to/agent-plugins/harnesses/antigravity/kstack/skills" }
  ]
}
```

When only `skills/` is installed and `agents/*.md` is not mounted, `code-review` stays self-contained: `skills/code-review/references/dispatch.md` registers `code-reviewer`, `review-critic`, and `shape-reviewer` on demand using `define_subagent` with the role prompts in `skills/code-review/references/roles/`.

## Subagents and model tiers

Antigravity's `invoke_subagent` selects models by tier (`inherit`, `pro`, `flash`, `flash_lite`) rather than Claude's per-plugin model/effort settings. Review subagents default to `Model: "inherit"` so they match the active session; ask for `pro` when running a review from a lighter session.

Subagents keep full tools (`EnableWriteTools: true`, `EnableMCPTools: true`, `EnableSubagentTools: false`) so they can run tests and reproductions in disposable `mktemp -d` copies, and remain review-only by instruction backed by a checkout fingerprint check before and after every pass.

## Relationship to `plugins/kstack`

`plugins/kstack` is the primary Claude Code edition where methodology changes start. Keep this variant aligned by porting the intent of changes to Antigravity's native primitives rather than copying Claude-specific syntax mechanically. When editing review agent instructions, keep `agents/<role>.md` (minus its YAML frontmatter) and `skills/code-review/references/roles/<role>.md` identical so both full-plugin and skills-only installations behave the same.

## License

MIT. Adapts work by Lauren Tan ([@poteto](https://github.com/poteto)) from [cursor/plugins](https://github.com/cursor/plugins/tree/main/pstack) and HumanLayer from [humanlayer/skills](https://github.com/humanlayer/skills); see [LICENSE](LICENSE).
