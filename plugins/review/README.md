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
the session that dispatches them must be able to receive messages from background subagents.

## Settings

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

Until the settings are saved, the skill shows no values and the agents run on their own definitions:
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
