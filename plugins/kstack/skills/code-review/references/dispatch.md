# Claude Review Dispatch

## Launch and continue

- Reviewer: call Agent with `subagent_type=kstack:code-reviewer`, `run_in_background=true`, a short `description`, and the complete packet and selected assignment in `prompt`.
- Shape reviewer, for the shape pass: call Agent with `subagent_type=kstack:shape-reviewer`, `run_in_background=true`, a short `description`, and the complete packet and shape assignment in `prompt`. It has `kstack:code-shape` and `kstack:engineering-principles` preloaded. Observe and continue it like the reviewer.
- Critic, only for adversarial review: call Agent with `subagent_type=kstack:review-critic`, `run_in_background=true`, a short `description`, the identical packet, critic assignment, and complete exchange transcript. Launch a new critic for the first audit of each artifact version.
- Verifier, for the verification step: call Agent with `subagent_type=kstack:review-critic`, `run_in_background=true`, a short `description`, and the verification inputs and assignment in `prompt`. Launch all verifiers in one message so they run in parallel. Each is a fresh agent; do not reuse an adversarial critic.
- On every launch, also pass `model` and `effort` from the code-review skill's agent settings table for that agent, leaving out any the table says to omit. A continued agent keeps the effort it was launched with.
- Background execution is required, not optional: the agents report progress with SendMessage to `main`, which only background subagents can address, and a foreground call would block you until the pass ends with nothing delivered in between.
- Preserve the agent ID from the launch result. Continue the same agent with SendMessage to that identifier; it resumes with its full prior context and replies to you. A new Agent call starts a fresh agent without that history.
- Continue the reviewer across clarification and repairs. Continue the critic within one frozen artifact version and start a fresh critic when the version changes.
- The reviewer and shape reviewer receive the `kstack:engineering-principles` index at startup and read a principle's reference when a finding rests on it. Supply project-specific architectural constraints in the packet when they are material.

A long packet may go in a file instead of the prompt. Write it once to a scratch file outside the reviewed checkout, name its path in every participant's prompt, and leave the file unchanged for the pass, so each participant reads identical text; a changed packet is a new file. Keep the immediate assignment and the risk rubric in the prompt itself.

Include the artifact version, scope, selected reviewer depth, and immediate assignment. Require a complete, self-contained report as the final response: checkpoints and interim findings are visibility, not the deliverable. You receive every message and deliver every subsequent handoff; reviewers and critics do not choose or delegate another workflow, and they cannot ask the user questions directly.

Keep reviewed inputs stable, including relevant uncommitted and untracked files. Independent authorized work may continue if it does not change those inputs. Follow the adversarial reference's stronger packet-freeze and unaltered-transcript rules throughout that exchange.

## Isolate agents that run together

Verifiers run in parallel, and a review may run beside other sessions' work, so each agent works in its own copy with its own runtime resources under its workspace isolation rules. Tell each agent how many others run beside it, and pass any isolation settings you know the project has, such as the environment variable for a Compose port or project name, a test database URL, or a data directory setting.

For a pull request review, whose reviewed code is committed, you may launch verifiers with `isolation: "worktree"` so each starts in its own worktree. Ask each to confirm that its worktree is at the reviewed commit before running a check, and to make its own copy when it is not. Reviewing uncommitted work, the agents make their own copies.

An agent reports a check it could not isolate, such as one whose project hard-codes ports or data paths, as a request rather than running it. Run those checks yourself after the parallel agents finish, one at a time, in a copy of your own, and relay the exact command and result. While agents are still running, run your own checks in a copy too, never in the reviewed checkout.

## Check the reviewed checkout

The agents keep the session's tools and are review-only by instruction, so confirm they left the reviewed checkout alone. Before each pass, record a fingerprint of it, run from its root:

```sh
{ git rev-parse HEAD; git symbolic-ref -q HEAD; git status --porcelain --untracked-files=all; git diff HEAD --binary; git ls-files -o --exclude-standard -z | xargs -0 shasum; } | shasum
```

Run it again when the pass ends, before acting on the report. It covers the commit, the branch, tracked changes, and the content of untracked files, and it ignores files the repository ignores, such as build output from a test run. A different fingerprint, when you changed nothing yourself, means an agent wrote in the checkout. Tell the user what changed, stop the exchange, and treat the pass's results as untrustworthy until the artifact is re-established. Do not revert the change without the user's approval.

## Observe and wait

Announce the pass, depth, and purpose before dispatch. Expect an acknowledgement, periodic checkpoints, interim findings with stable IDs, and prompt context requests, each arriving as a message from the agent at the start of one of your turns. When a checkpoint arrives, relay it to the user in a line or two and end your turn again, so the user can follow progress; the agent's completion notification and final report arrive the same way. Answer a context request by messaging the agent's ID, then wait again.

Waiting means ending your turn with the agent still running. Do not poll, sleep, read the agent's transcript file, or send status requests. A quiet interval does not establish failure; an agent working through a long inspection sends checkpoints at its own milestones. Intervene only for a context request, an execution failure, concrete evidence that useful progress is blocked, or a user-directed scope change. Do not stop or restart a pass because of elapsed time.

A completion notification that says the agent is waiting on its own background command is not a finished pass; the report follows when that command ends. A result marked partial because the agent reached its turn limit is not a completed pass either; continue the same agent with SendMessage.

Check each completed report for coverage, context gaps, and reconciliation of every interim finding before proceeding. A tool error or partial assessment is not a completed pass. Relay returned coverage and remaining work to the user, preserving the full original response for the next participant.

For ordinary review, wait for completion or a coordinated pause before changing inputs, then supply an updated version and packet. For adversarial review, wait for the reviewer's complete output before launching the critic and the critic's complete output before continuing the reviewer. Do not classify findings as `confirmed` or start repairs until the exchange finishes. Explain protocol transitions, evidence-driven continuation, and the stopping reason so the user can follow the exchange.
