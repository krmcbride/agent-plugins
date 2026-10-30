# Pull Request Descriptions

Use when writing or updating pull or merge request titles and bodies, including individual stack layers.

## Audience and scope

Write for repository maintainers evaluating the proposed change and future maintainers looking up why it happened. Use the repository's title style. Describe the final diff against the selected base; update the title and body when the scope changes.

When updating an existing title or body, preserve content added by other people or tools, such as reviewer notes, bot summaries, or appended links. Revise only the parts the current author owns.

Include information that helps these readers understand, evaluate, validate, deploy, or maintain the change. Exclude local work tracking, such as task-tracker IDs or lists of completed tasks, and accounts of how the authoring agents planned, delegated, or reviewed the work. Shared issue references that the repository or organization expects, such as a ticket prefix in the title, are not local tracking. Carry relevant rationale, validation evidence, and unresolved concerns into the description in project terms.

## Default body

Follow the applicable repository template and contribution instructions, including inherited account or organization templates. When no format is prescribed, use `Summary` and `Validation` as the baseline:

```markdown
## Summary

Explain the concrete problem, why it matters, and the resulting behavior.
Include the key rationale when the approach needs explanation.

## Validation

State the relevant checks performed and their results. Explain what the
evidence covers and any material validation gaps. Include reproduction
steps or visual evidence when they help assess the change.
```

A small PR can use a sentence or two per section. For larger changes, group detail under the optional sections below. Use short prose for motivation and rationale, and bullets for parallel changes or checks. Include relevant shared issue or design links while keeping enough context in the body for it to stand alone.

Distinguish completed verification from planned, skipped, or unavailable checks. Check a template checkbox only after verifying its statement, and briefly explain any left unchecked. Report validation appropriate to the change; the section does not require adding or running irrelevant tests.

## Optional sections

Add sections only when they answer a concrete reviewer need; omit empty sections and routine checklist boilerplate unless the repository requires it.

- **Changes:** place after Summary when several substantial behaviors or design decisions need an overview. Group concise bullets by behavior or concern rather than listing files or commits.
- **Compatibility / migration:** explain changed defaults, state migrations, breaking behavior, or required user action.
- **Review notes:** identify important invariants, difficult tradeoffs, specific feedback sought, or a useful reading order.
- **Rollout:** explain deployment sequencing, feature flags, or recovery considerations when operationally relevant.
