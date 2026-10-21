---
name: code-review
description: >-
  Assess and orchestrate code review for explicit review requests and completed implementation work. Consider local verification, independent ordinary review, and adversarial reviewer-critic review before choosing the approach warranted by the change, and add a code-shape pass for implementation work that creates or grows production code.
---

# Code Review

Choose the review that adds useful scrutiny, then load only its workflow.

## Select the approach

Honor the user's requested review, depth, and constraints. Otherwise consider all three choices before dispatching:

| Approach | Selection criteria | Next step |
| --- | --- | --- |
| No delegated review | A routine, bounded change is adequately checked and another agent is unlikely to add useful scrutiny. | Finish normal verification and any requested local assessment. Do not claim an independent review occurred. |
| Ordinary review | Independent inspection adds value, and tracing the implementation against clear requirements is the main need. | Read [ordinary review](references/ordinary-review.md). |
| Adversarial review | Challenging the review's reasoning is likely to improve a consequential assessment: contestable assumptions, difficult failure paths, test blind spots, or material uncertainty about correctness or integration. An explicit adversarial or challenge-review request selects this approach. | Read [adversarial review](references/adversarial-review.md). |

Adversarial review does not require exceptional risk. Consider it for meaningful uncertainty around retries, concurrency, recovery, trust boundaries, compatibility, or architectural assumptions; touching one of these topics alone does not require it. Size and depth are separate from protocol: a large mechanical change may need thorough ordinary review, while a small concurrency change may benefit from a critic.

Briefly state the selected approach and the concrete reason; include reviewer depth for either delegated approach. Choosing no delegation cannot cancel an explicit review request or required validation. Do not run ordinary review as a mandatory preliminary pass for adversarial review. If new evidence changes the selection, explain the reason and establish the appropriate packet before changing protocols.

For either delegated approach or the shape pass, also read [Claude dispatch](references/dispatch.md) and the agent settings below before launching. Check the required roles and tools for the selected approach. If unavailable, identify the limitation and provide a prepared packet or clearly labeled local or partial assessment; do not silently downgrade a requested independent or adversarial review.

## Agent settings

The plugin's settings choose the model alias and effort for each review agent. Pass them when launching that agent, as the dispatch reference describes:

| Agent | Model | Effort |
| --- | --- | --- |
| `review:code-reviewer` | `${user_config.code_reviewer_model}` | `${user_config.code_reviewer_effort}` |
| `review:review-critic` | `${user_config.review_critic_model}` | `${user_config.review_critic_effort}` |
| `review:shape-reviewer` | `${user_config.shape_reviewer_model}` | `${user_config.shape_reviewer_effort}` |

A cell that is not a single model alias or effort level means that setting was never saved. Omit that argument so the agent's own definition applies.

## Add the shape pass

The approaches above review correctness, and their calibration filters out code-shape problems. Review shape in its own pass against the `review:code-shape` rubric. Run it for completed implementation work that creates production files or grows existing ones, and whenever the user asks. For a small, bounded edit, measure the touched files against the rubric's size budget yourself and delegate only if one approaches it or another hard stop is plausible.

When both apply, run the shape pass first so the correctness review examines the final structure. Launch the shape reviewer as described in the dispatch reference with the packet below, without a depth assignment, plus any user-accepted exceptions to code-shape hard stops. Resolve every introduced hard stop before continuing: repair it and have the same shape reviewer verify the repair, or record the user's accepted reason. Address findings within existing implementation authority or report them to the user. The shared blocking rule below governs correctness findings; code-shape hard stops block under their own rubric.

## Choose the reviewer depth

Use the selected depth for the reviewer in either delegated approach. Honor the user's choice; otherwise choose by scope and uncertainty:

- **Focused:** inspect the complete supplied diff and the surrounding context needed to assess plausible introduced critical or major correctness, security, requirements, and test risks. Avoid unrelated architecture, pre-existing cleanup, style, or expensive validation. Stop when the changed behavior and evidence have been checked and plausible material concerns have been resolved or documented as findings or coverage gaps.
- **Thorough:** inspect the full supplied scope, trace realistic failure paths, and assess integration and architecture where material. Run targeted checks when they strengthen the assessment. Stop when the declared scope and material evidence questions have been assessed, reporting any remaining gaps.

Depth changes breadth and effort, not the evidence bar or report length. A focused pass may inspect more context to resolve a suspected blocker; report residual coverage gaps rather than silently broadening the assignment.

## Prepare the review packet

Supply the same factual context to every participant:

- **Requirements:** the original ask or approved plan, preferably verbatim; scope, non-goals, deployment assumptions, compatibility expectations, and user-owned decisions.
- **Implementation claims:** what changed and why, labeled as claims to verify rather than evidence.
- **Artifact:** exact base/head refs and diff, or a snapshot of working changes including relevant untracked files. Name the version and relevant files; refs alone do not freeze uncommitted work.
- **Validation:** commands, results, known gaps, and specific unanswered questions.
- **Assignment:** scope, selected reviewer depth, immediate task (initial review, response to feedback, verification of repairs, or critic audit), and the applicable investigation, response, disposition, and stopping instructions.

Inspect available artifacts before asking about missing context. Ask a precise question only when a material gap prevents assessment, and continue unaffected work. Record minor gaps without inventing requirements. The reviewer and critic have `application-architecture` preloaded; when architecture guidance is material, also supply the relevant project-specific architectural constraints.

## Shared review contract

Keep the reviewed inputs stable during a pass, and freeze the artifact and requirements throughout an adversarial exchange. Reviewers and critics inspect evidence without modifying the implementation. Treat implementation summaries, test claims, and rebuttals as hypotheses to check against code or tool evidence.

Keep finding IDs and provenance stable across updates and repairs. Separate introduced defects, directly relevant pre-existing risks, out-of-scope concerns, and missing evidence. A finding blocks only when it is critical or major, introduced by or directly relevant to the change, tied to an approved requirement or realistic operational invariant, plausible under the supplied assumptions, and supported by concrete evidence. Severity and agreement do not authorize scope expansion.

Report useful progress and wait for complete responses under the dispatch rules. In adversarial review, schedule and relay the exchange without editing or arguing the participants' positions; follow the full relay contract in that reference. After review, report the outcome, material findings, evidence, and coverage gaps, and act only within existing implementation authority.
