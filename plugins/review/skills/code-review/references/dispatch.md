# Claude Review Dispatch

## Launch and continue

- Reviewer: call Agent with `subagent_type=review:code-reviewer`, `run_in_background=true`, a short `description`, and the complete packet and selected assignment in `prompt`.
- Shape reviewer, for the shape pass: call Agent with `subagent_type=review:shape-reviewer`, `run_in_background=true`, a short `description`, and the complete packet and shape assignment in `prompt`. It has `review:code-shape` and `review:application-architecture` preloaded. Observe and continue it like the reviewer.
- Critic, only for adversarial review: call Agent with `subagent_type=review:review-critic`, `run_in_background=true`, a short `description`, the identical packet, critic assignment, and complete exchange transcript. Launch a new critic for the first audit of each artifact version.
- Background execution is required, not optional: the agents report progress with SendMessage to `main`, which only background subagents can address, and a foreground call would block you until the pass ends with nothing delivered in between.
- Preserve the agent ID from the launch result. Continue the same agent with SendMessage to that identifier; it resumes with its full prior context and replies to you. A new Agent call starts a fresh agent without that history.
- Continue the reviewer across clarification and repairs. Continue the critic within one frozen artifact version and start a fresh critic when the version changes.
- Both agents receive `review:application-architecture` at startup and cannot load other skills. Supply project-specific architectural constraints in the packet when they are material.

Include the artifact version, scope, selected reviewer depth, and immediate assignment. Require a complete, self-contained report as the final response: checkpoints and interim findings are visibility, not the deliverable. You receive every message and deliver every subsequent handoff; reviewers and critics do not choose or delegate another workflow, and they cannot ask the user questions directly.

Keep reviewed inputs stable, including relevant uncommitted and untracked files. Independent authorized work may continue if it does not change those inputs. Follow the adversarial reference's stronger packet-freeze and unaltered-transcript rules throughout that exchange.

## Observe and wait

Announce the pass, depth, and purpose before dispatch. Expect an acknowledgement, periodic checkpoints, interim findings with stable IDs, and prompt context requests, each arriving as a message from the agent at the start of one of your turns. When a checkpoint arrives, relay it to the user in a line or two and end your turn again, so the user can follow progress; the agent's completion notification and final report arrive the same way. Answer a context request by messaging the agent's ID, then wait again.

Waiting means ending your turn with the agent still running. Do not poll, sleep, read the agent's transcript file, or send status requests. A quiet interval does not establish failure; an agent working through a long inspection sends checkpoints at its own milestones. Intervene only for a context request, an execution failure, concrete evidence that useful progress is blocked, or a user-directed scope change. Do not stop or restart a pass because of elapsed time.

A completion notification that says the agent is waiting on its own background command is not a finished pass; the report follows when that command ends. A result marked partial because the agent reached its turn limit is not a completed pass either; continue the same agent with SendMessage.

Check each completed report for coverage, context gaps, and reconciliation of every interim finding before proceeding. A tool error or partial assessment is not a completed pass. Relay returned coverage and remaining work to the user, preserving the full original response for the next participant.

For ordinary review, wait for completion or a coordinated pause before changing inputs, then supply an updated version and packet. For adversarial review, wait for the reviewer's complete output before launching the critic and the critic's complete output before continuing the reviewer. Do not classify findings as `confirmed` or start repairs until the exchange finishes. Explain protocol transitions, evidence-driven continuation, and the stopping reason so the user can follow the exchange.
