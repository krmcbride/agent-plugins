# review

Code review for completed implementation work. The `code-review` skill chooses between no delegated review, an
ordinary review, and an adversarial review in which a critic audits the reviewer's findings. It adds a separate
code-shape pass for work that creates or grows production files.

## Contents

| Component | Name in Claude Code | What it does |
| --- | --- | --- |
| Skill | `review:code-review` | Picks the review approach and depth, builds the review packet, and dispatches the agents |
| Skill | `review:code-shape` | Rubric for module size, single responsibility, and dead weight, with hard stops |
| Skill | `review:application-architecture` | Guidance on boundaries, domain ownership, and dependency direction |
| Agent | `review:code-reviewer` | Read-only reviewer; preloads `application-architecture` |
| Agent | `review:review-critic` | Read-only critic for adversarial review; preloads `application-architecture` |
| Agent | `review:shape-reviewer` | Read-only code-shape reviewer; preloads `code-shape` and `application-architecture` |

The agents have no Edit, Write, or Skill tools. They run in the background and report progress with SendMessage, so
the session that dispatches them must be able to receive messages from background subagents. They are pinned to
`claude-opus-5-5[1m]`, at `high` effort for the reviewers and `xhigh` for the critic.

Claude Code namespaces plugin components, so this plugin's `code-review` does not replace the bundled `code-review`
skill. To use only this one, turn the bundled skill off in `skillOverrides`:

```json
{ "skillOverrides": { "code-review": "off" } }
```

## Install

```
/plugin install review@krmcbride
```
