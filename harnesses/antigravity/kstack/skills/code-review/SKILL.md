---
name: code-review
description: >-
  Review code for an explicit review request, another author's pull request, or
  completed implementation work. Selects local, independent, or adversarial
  review as the change warrants, verifies findings refute-first before they are
  posted or acted on, and adds a code-shape pass when production code is created
  or grows.
---

# Code Review

Choose the review that adds useful scrutiny, then read only its workflow with `read_file`.

## Select the approach

Honor the user's requested review, depth, and constraints. Otherwise consider all three choices before dispatching:

| Approach | Selection criteria | Next step |
| --- | --- | --- |
| No delegated review | A routine, bounded change is adequately checked and another agent is unlikely to add useful scrutiny. | Finish normal verification and any requested local assessment. Do not claim an independent review occurred. |
| Ordinary review | Independent inspection adds value, and tracing the implementation against clear requirements is the main need. | Read [ordinary review](references/ordinary-review.md). |
| Adversarial review | Work this session wrote, where challenging the review's reasoning is likely to improve a consequential assessment before repairs: contestable assumptions, difficult failure paths, test blind spots, or material uncertainty about correctness or integration. An explicit adversarial or challenge-review request selects this approach. | Read [adversarial review](references/adversarial-review.md). |

For another author's pull request, ordinary review followed by verification of its findings is usually the stronger challenge: there is no repair loop for the critic exchange to improve, and the value lies in which findings hold up. Adversarial review does not require exceptional risk. Consider it for meaningful uncertainty around retries, concurrency, recovery, trust boundaries, compatibility, or architectural assumptions; touching one of these topics alone does not require it. Size and depth are separate from protocol: a large mechanical change may need thorough ordinary review, while a small concurrency change may benefit from a critic.

Briefly state the selected approach and the concrete reason; include reviewer depth for either delegated approach. Choosing no delegation cannot cancel an explicit review request or required validation. Do not run ordinary review as a mandatory preliminary pass for adversarial review. If new evidence changes the selection, explain the reason and establish the appropriate packet before changing protocols.

For either delegated approach, the verification step, or the shape pass, also read [Antigravity dispatch](references/dispatch.md) before launching. Check that subagent tools (`invoke_subagent`, `send_message`, and `define_subagent` when custom agents are not pre-registered) are available. If unavailable, identify the limitation and provide a prepared packet or clearly labeled local or partial assessment; do not silently downgrade a requested independent or adversarial review.

## Model tier

`invoke_subagent` selects subagent models by tier: `inherit` (default), `pro`, `flash`, or `flash_lite`. Default to `Model: "inherit"` for `code-reviewer`, `review-critic`, and `shape-reviewer` so they match the current session. Pass `Model: "pro"` only when the user requests it or when dispatching a review from a lighter (`flash` / `flash_lite`) session.

## Verify the findings

When an ordinary review returns findings that will be posted, handed to someone, or used to drive work, verify them before reporting: read [verify findings](references/verify-findings.md). Always do this when reviewing another author's pull request and whenever the user asks to verify, triage, or score findings. Skip it when the review found nothing material, or when you will fix the findings yourself and the fix's own verification will test each one.

An adversarial review already audits every finding through the critic, so it skips this stage. Its final report scores each finding with the [risk rubric](references/risk-rubric.md).

## Review another author's pull request

Assume the user started this session to review the pull request, and check out its head in the session's own working checkout, so the session's diff, file, and terminal views show the author's changes as if they were the session's own. Read the pull request with `gh pr view` and `gh pr diff` (or the host's pull-request read tool if one is available), then check it out with `gh pr checkout <number>`, adding `--detach` when its branch is already checked out in another worktree. First confirm the checkout has no uncommitted work and is not on a branch with unpushed commits; if it has either, stop and ask rather than stash or discard anything. Once checked out, this is the reviewed checkout: the reviewers, verifiers, and you leave it unchanged, and the fingerprint check applies to it. In the packet, the requirements are the pull request's title, description, and linked issues plus the repository's documented conventions, the artifact is the diff from its merge base with the base branch to the checked-out head commit, and the description's claims are implementation claims to verify. Leave out repairs: the output is a verified, ranked list of findings the user may raise. Do not post comments, reviews, or approvals unless the user asks for that.

## Add the shape pass

The approaches above review correctness, and their calibration filters out code-shape problems. Review shape in its own pass against the `code-shape` rubric. Run it for completed implementation work that creates production files or grows existing ones, and whenever the user asks. For a small, bounded edit, measure the touched files against the rubric's size budget yourself and delegate only if one approaches it or another hard stop is plausible.

When both apply, run the shape pass first so the correctness review examines the final structure. Launch `shape-reviewer` as described in [Antigravity dispatch](references/dispatch.md) with the packet below, without a depth assignment, plus any user-accepted exceptions to code-shape hard stops. Resolve every introduced hard stop before continuing: repair it and continue the same `shape-reviewer` via `send_message` to verify the repair, or record the user's accepted reason. Address findings within existing implementation authority or report them to the user. The risk rubric's `block` action governs correctness findings; code-shape hard stops block under their own rubric.

## Choose the reviewer depth

Use the selected depth for the reviewer in either delegated approach. Honor the user's choice; otherwise choose by scope and uncertainty:

- **Focused:** inspect the complete supplied diff and the surrounding context needed to assess plausible introduced critical or major correctness, security, requirements, and test risks. Avoid unrelated architecture, pre-existing cleanup, style, or expensive validation. Stop when the changed behavior and evidence have been checked and plausible material concerns have been resolved or documented as findings or coverage gaps.
- **Thorough:** inspect the full supplied scope, trace realistic failure paths, and assess integration and architecture where material. Run targeted checks when they strengthen the assessment. Stop when the declared scope and material evidence questions have been assessed, reporting any remaining gaps.

Depth changes breadth and effort, not the evidence bar or report length. A focused pass may inspect more context to resolve a suspected blocker; report residual coverage gaps rather than silently broadening the assignment.

## Prepare the review packet

Supply the same factual context to every participant:

- **Parent conversation ID:** this session's `Conversation ID`, so subagents can address checkpoints, interim findings, and context questions with `send_message`.
- **Requirements:** the original ask or approved plan, preferably verbatim; scope, non-goals, deployment assumptions, compatibility expectations, and user-owned decisions.
- **Implementation claims:** what changed and why, labeled as claims to verify rather than evidence.
- **Artifact:** exact base/head refs and diff, or a snapshot of working changes including relevant untracked files. Name the version and relevant files; refs alone do not freeze uncommitted work.
- **Validation:** commands, results, known gaps, and specific unanswered questions.
- **Assignment:** scope, selected reviewer depth, immediate task (initial review, response to feedback, verification of repairs, or critic audit), and the applicable investigation, response, disposition, and stopping instructions.
- **Risk rubric:** the resolved absolute path to [risk-rubric.md](references/risk-rubric.md) beside this `SKILL.md` for `code-reviewer` and every `review-critic` to read with `read_file`, so each finding carries the same scores and action. Paste its text instead for a subagent that reports it cannot read the path.

Inspect available artifacts before asking about missing context. Ask a precise question only when a material gap prevents assessment, and continue unaffected work. Record minor gaps without inventing requirements. When architecture is material, also supply the relevant project-specific architectural constraints alongside the `engineering-principles` skill.

## Shared review contract

Keep the reviewed inputs stable during a pass, and freeze the artifact and requirements throughout an adversarial exchange. Reviewers and critics inspect evidence without modifying the implementation. Treat implementation summaries, test claims, and rebuttals as hypotheses to check against code or tool evidence.

Keep finding IDs and provenance stable across updates and repairs. Separate introduced defects, directly relevant pre-existing risks, out-of-scope concerns, and missing evidence. A finding blocks only when the risk rubric maps it to `block`. Severity and agreement do not authorize scope expansion.

After review, report the outcome, material findings, evidence, and coverage gaps, and act only within existing implementation authority. When changes were made after the reviewed version, say which of them were reviewed again and which were not.
