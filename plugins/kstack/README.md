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
| `kstack:engineering-principles` | An index of 22 principles, each named by the situation it applies to, with one reference file per principle |
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
| Agent | `kstack:code-reviewer` | Review-only reviewer; preloads the `engineering-principles` index |
| Agent | `kstack:review-critic` | Review-only critic for adversarial review |
| Agent | `kstack:shape-reviewer` | Review-only code-shape reviewer; preloads `code-shape` and the `engineering-principles` index |

### Git

| Skill | What it does |
| --- | --- |
| `kstack:git-workflows` | Commits, history rewrites, branch publication, GitHub pull requests and `gh stack` chains, and GitLab `glab stack` merge requests, each with its own reference loaded on demand |
| `kstack:researching-github-repositories` | Answers questions about GitHub repositories from `gh` metadata or a disposable shallow clone, read-only |

### Visualize

| Skill | What it does |
| --- | --- |
| `kstack:show-me` | Explain the current topic with the smallest view that makes the point: a code-shape sketch, tree, table, rendered Mermaid diagram, or throwaway HTML page |

Claude can invoke every skill except `show-me` from its description. The principles skill lists every principle in
one short index and loads a reference only when it applies, so the 22 principles cost one entry in the skill list. To
make sure the principles shape a piece of work, start the message with `/kstack:engineering-principles`. Claude then
reads the references that apply before starting and names the principles that changed its decisions.

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

`git-workflows` commits completed work without asking, but rewriting history and publishing each need the user's
authorization. `researching-github-repositories` reads upstream source and history without touching the user's
checkouts. The skills expect `gh`, and `glab` for GitLab stacks. Publishing uses whatever credentials those tools
already have.

## show-me

`show-me` runs only as `/kstack:show-me`, for a quick visual in the conversation. It prefers text views, draws a
diagram with an inline-rendering tool when the client has one, and writes an HTML page only when asked.

Claude Code's desktop app and terminals show Mermaid only as source, so otherwise `show-me` renders diagrams with
[Pele](https://pele.run). `skills/show-me/scripts/diagram-page.mjs` needs Node and no npm packages. It writes one HTML
page with a fixed layout and theme, embeds the Mermaid source, and loads Pele 1.9.0 from jsDelivr, pinned by its SRI
hash, to render it in the browser. Viewing the page needs the network; offline, it shows the source instead.

The themes in `skills/show-me/themes/` are `blueprint`, a navy drafting grid with monospace type, and `light`. Each
colours states by phase and marks bad states, the states on the path into them, and the arrows into them.
[`references/themes.md`](skills/show-me/references/themes.md) lists the classes. They match the classes of pstack's
`statechart` command, so its charts render unchanged.

`show-me` is adapted from HumanLayer's [show-me](https://github.com/humanlayer/skills/tree/main/plugins/show-me) at
upstream commit `bba9d13`, not from pstack. Like upstream, it sets `disable-model-invocation`. It adds a table view,
rendered diagrams with labeling guidance, and checks on HTML pages, and visuals stay in the conversation rather than
being kept or published.

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

kstack replaces the earlier `review@krmcbride`, `git@krmcbride`, and `show-me@krmcbride` plugins. Their skills and
agents are now named `kstack:…`.

## License

MIT. kstack adapts work by Lauren Tan ([@poteto](https://github.com/poteto)) from
[cursor/plugins](https://github.com/cursor/plugins/tree/main/pstack), and `show-me` adapts work by HumanLayer from
[humanlayer/skills](https://github.com/humanlayer/skills); see [LICENSE](LICENSE). Pele is MIT-licensed by kepano and
is loaded from a CDN, not copied here.
