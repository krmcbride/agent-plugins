# kstack

Personal skills for Claude Code, kept in one plugin so every skill and agent shares the `kstack:` prefix. Claude Code
namespaces plugin components by plugin name, not by marketplace, so a generic plugin name such as `review` or `git`
could collide with another marketplace's plugin. The prefix also shows at a glance which skills are these.

The engineering method keeps Lauren Tan's [pstack](../pstack) principles and playbooks and leaves out its
orchestration layer: the router skill, model and effort routing, subagent rules, PR babysitting and landing programs,
reply-style rules, and the scripts behind them. Claude Code decides how to use its own harness.

## Contents

### Engineering method

| Skill | What it does |
| --- | --- |
| `kstack:engineering-principles` | An index of 21 principles, each named by the situation it applies to, with one reference file per principle |
| `kstack:debugging` | Reproduce, root-cause, fix, and verify a defect, or diagnose a runtime symptom or captured profile |
| `kstack:performance` | Baseline, find the limiter, and keep or revert each change; includes a sustained improvement loop and a benchmark checklist |
| `kstack:refactoring` | Pin behavior, subtract, reshape in small passing steps, and prove the behavior unchanged |
| `kstack:prototyping` | Settle a design or behavioral question with a throwaway sketch instead of asking |
| `kstack:implementation-workflow` | Plan substantial work with the user as an outcome-level contract, execute it through the harness, and verify the result |
| `kstack:decision-interview` | Separate discoverable facts from user-owned decisions and settle the decisions one question at a time |

### Review

| Component | Name | What it does |
| --- | --- | --- |
| Skill | `kstack:code-review` | Picks the review approach and depth, builds the review packet, and dispatches the agents |
| Skill | `kstack:code-shape` | Rubric for module size, single responsibility, and dead weight, with hard stops |
| Skill | `kstack:application-architecture` | Guidance on boundaries, domain ownership, and dependency direction |
| Agent | `kstack:code-reviewer` | Review-only reviewer; preloads `application-architecture` |
| Agent | `kstack:review-critic` | Review-only critic for adversarial review; preloads `application-architecture` |
| Agent | `kstack:shape-reviewer` | Review-only code-shape reviewer; preloads `code-shape` and `application-architecture` |

### Git

| Skill | What it does |
| --- | --- |
| `kstack:git-workflows` | Commits, temporary-commit message amendments, history rewrites, branch publication, GitHub pull requests and `gh stack` chains, and GitLab `glab stack` merge requests, each with its own reference loaded on demand |
| `kstack:researching-github-repositories` | Answers questions about GitHub repositories from `gh` metadata or a disposable shallow clone, read-only |

Every skill can be invoked by Claude from its description. The principles skill lists every principle in one short
index and loads a reference only when it applies, so the 21 principles cost one entry in the skill list. To make sure
the principles shape a piece of work, start the message with `/kstack:engineering-principles`. Claude then reads the
references that apply before starting and names the principles that changed its decisions.

`implementation-workflow` says what it needs, small modules and a final review against the contract, without naming
the skills that supply it. `code-review` and `code-shape` trigger from their own descriptions.

## Review

`code-review` chooses between no delegated review, an ordinary review, and an adversarial review in which a critic
audits the reviewer's findings. It adds a separate code-shape pass for work that creates or grows production files.

The agents keep the session's tools, including its MCP servers, and are review-only by instruction rather than by tool
restriction: Bash alone could write, so removing the editing tools never made them read-only. They never write in the
reviewed checkout. To reproduce a failure, the reviewer and critic write only in a disposable copy outside it, such as a
temporary git worktree. The dispatching agent fingerprints the checkout before and after each pass and stops if it
changed.

The agents run in the background and report progress with SendMessage, so the session that dispatches them must be able
to receive messages from background subagents.

The plugin's settings choose each agent's model and effort. Claude Code asks for them when you enable the plugin, and
lists them in `/config`:

| Setting | Options | Default |
| --- | --- | --- |
| `code_reviewer_model`, `review_critic_model`, `shape_reviewer_model` | `opus`, `sonnet`, `haiku`, `fable` | `opus` |
| `code_reviewer_effort`, `shape_reviewer_effort` | `low`, `medium`, `high`, `xhigh`, `max` | `high` |
| `review_critic_effort` | `low`, `medium`, `high`, `xhigh`, `max` | `xhigh` |

Claude Code fills the saved values into the `code-review` skill, and the dispatching agent passes them when it launches
each agent. Those arguments override the agent's own `model` and `effort`. The Agent tool accepts only model aliases, so
to pin the version an alias runs, set `ANTHROPIC_DEFAULT_OPUS_MODEL` (or the matching variable for another alias) in
your settings' `env`.

Until the settings are saved, the skill shows no values and the agents run on their own definitions: the session's
model (`model: inherit`), at `high` effort for the reviewers and `xhigh` for the critic. A review started from a Sonnet
session then runs on Sonnet.

`kstack:code-review` does not replace Claude Code's bundled `code-review` skill. To use only this one, turn the bundled
skill off in `skillOverrides`:

```json
{ "skillOverrides": { "code-review": "off" } }
```

## Git

`git-workflows` keeps authorization boundaries explicit: a request to implement does not authorize a commit, a commit
does not authorize a rewrite, and neither authorizes publishing. `researching-github-repositories` reads upstream
source and history without touching the user's checkouts. The skills expect `gh`, and `glab` for GitLab stacks.
Publishing uses whatever credentials those tools already have.

## Differences from pstack

- No `poteto-mode` router, playbook todo lists, or required reply format.
- No principles for guarding the context window, never blocking on the human, or experience-first product taste.
  The first is the harness's job; the other two are product and collaboration preferences rather than engineering
  method.
- Playbooks keep their method and drop delegation steps, model tiers, throughput checkpoints, and links to pstack
  skills that kstack does not include.
- The `tdd` skill and the runtime and trace forensics playbooks are folded into `debugging`; `benchmark-checklist`
  and the hillclimb playbook are folded into `performance`.

`implementation-workflow` and `decision-interview` are not from pstack. They take the place of pstack's
`figure-it-out` and multi-phase plan playbooks: the user owns consequential decisions and checks an outcome-level
contract, and no tracker or decision log runs beside the harness. The review and Git skills are not from pstack either.

kstack is written here, not generated from `vendor/`. The pstack-derived skills were adapted from pstack at upstream commit
`4dd1d05818d19792e7cd6e818f1667f95f7e1dbe` (version 0.15.36). To find upstream changes worth porting, diff the
matching principle or playbook files in `vendor/pstack/upstream/skills/` from that commit to the current pin.

## Install

```
/plugin install kstack@krmcbride
```

kstack replaces the earlier `review@krmcbride` and `git@krmcbride` plugins. Their skills and agents are now named
`kstack:…`.

## License

MIT. kstack adapts work by Lauren Tan ([@poteto](https://github.com/poteto)) from
[cursor/plugins](https://github.com/cursor/plugins/tree/main/pstack); see [LICENSE](LICENSE).
