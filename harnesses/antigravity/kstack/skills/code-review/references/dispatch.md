# Antigravity Review Dispatch

## Register or reuse subagent types

Check the available subagents listed in your system context before invoking a reviewer:

- If `code-reviewer`, `review-critic`, or `shape-reviewer` is already registered (from the installed Antigravity plugin or `~/.gemini/config/agents/`), call `invoke_subagent` with that `TypeName` directly.
- Otherwise (for example, when only `skills/` is installed, as in T3 Code), read the matching role prompt beside this skill with `read_file` and register it once for this conversation with `define_subagent`:
  - `code-reviewer`: [roles/code-reviewer.md](roles/code-reviewer.md)
  - `review-critic`: [roles/review-critic.md](roles/review-critic.md)
  - `shape-reviewer`: [roles/shape-reviewer.md](roles/shape-reviewer.md)
  - Set `EnableWriteTools: true` (required so the reviewer has `run_command` to run tests and reproductions in disposable copies), `EnableMCPTools: true`, and `EnableSubagentTools: false`.
  - Define only the roles this pass actually needs. Defined subagents persist for the rest of this conversation.

## Launch and continue

Antigravity subagents always run asynchronously in the background and wake you reactively via incoming messages. Always include this session's `Conversation ID` in the launch prompt so subagents can address `send_message` to you.

- **Reviewer:** call `invoke_subagent` with `TypeName: "code-reviewer"`, `Role: "Code Reviewer"`, `Model: "inherit"` (or the requested tier), `Workspace: "inherit"`, and the complete packet and selected assignment in `Prompt`.
- **Shape reviewer:** call `invoke_subagent` with `TypeName: "shape-reviewer"`, `Role: "Code Shape Reviewer"`, `Model: "inherit"`, `Workspace: "inherit"`, and the complete packet and shape assignment in `Prompt`. Observe and continue it like the reviewer.
- **Critic (adversarial review only):** call `invoke_subagent` with `TypeName: "review-critic"`, `Role: "Adversarial Review Critic"`, `Model: "inherit"`, `Workspace: "inherit"`, and the identical packet, critic assignment, and complete exchange transcript in `Prompt`, placing the reviewer's output in a scratch file for the critic's first audit so it inspects the diff before reading the review. Launch a fresh critic for the first audit of each artifact version.
- **Verifiers (verification step):** call `invoke_subagent` once per verification unit with `TypeName: "review-critic"`, a distinct `Role` naming the unit (for example, `"Finding Verifier (R1)"`), `Model: "inherit"`, and the verification inputs and assignment in `Prompt`. Issue all verifier `invoke_subagent` calls in the same turn so they run in parallel. Each is a fresh subagent; never reuse an adversarial critic.
- **Continue an existing subagent:** preserve the `conversationId` returned by `invoke_subagent`. Send follow-up passes, context answers, or repair verifications with `send_message(Recipient=<conversationId>, Message=...)`. That wakes the same subagent with its full prior context; calling `invoke_subagent` again starts a fresh subagent without that history.
- **Clean up:** kill finished or abandoned subagents with `manage_subagents(Action="kill", ConversationIds=[...])` only after reading everything you need from them, because killing a subagent deletes its `share` or `branch` workspace.

A long packet may go in a scratch file instead of inline in `Prompt`. Write it once outside the reviewed checkout (for example, in `<artifactDir>/scratch/` or `mktemp -d`), name its absolute path in every participant's prompt, and leave the file unchanged for the pass so every participant reads identical text; a changed packet is a new file. Keep the immediate assignment and parent conversation ID in `Prompt` itself.

Independent authorized work may continue during a pass if it does not change the reviewed inputs, including relevant uncommitted and untracked files.

## Isolate agents that run together

Verifiers run in parallel, and a review may run beside other sessions' work, so each subagent works in its own copy with its own runtime resources under its workspace isolation rules. Tell each subagent how many others run beside it, and pass any isolation settings you know the project has, such as the environment variable for a Compose port or project name, a test database URL, or a data directory setting.

For a pull request review whose reviewed code is committed, you may launch verifiers with `Workspace: "share"` (shares the underlying Git directory without duplicating storage, like a worktree) or `Workspace: "branch"` so each starts in its own checkout. Ask each verifier to confirm its `HEAD` matches the reviewed commit before running a check, and to make its own `mktemp -d` copy if it does not. When reviewing uncommitted work, launch with `Workspace: "inherit"` and let each subagent create its own `mktemp -d` copy for any command that writes.

A subagent reports a check it could not isolate, such as one whose project hard-codes ports or data paths, as a request rather than running it. Run those checks yourself after the parallel subagents finish, one at a time, in a copy of your own, and relay the exact command and result. While subagents are still running, run your own checks in a copy too, never in the reviewed checkout.

## Check the reviewed checkout

Review subagents keep `run_command` and write tools so they can test in disposable copies, and remain review-only by instruction, so confirm they left the reviewed checkout untouched. Before each pass, record a fingerprint of it from its root:

```sh
{ git rev-parse HEAD; git symbolic-ref -q HEAD; git status --porcelain --untracked-files=all; git diff HEAD --binary; git ls-files -o --exclude-standard -z | xargs -0 shasum; } | shasum
```

Run it again when the pass ends, before acting on the report. It covers the commit, the branch, tracked changes, and the content of untracked files, and it ignores files the repository ignores, such as build output from a test run. A different fingerprint, when you changed nothing yourself, means a subagent wrote in the checkout. Tell the user what changed, stop the exchange, and treat the pass's results as untrustworthy until the artifact is re-established. Do not revert the change without the user's approval.

## Observe and wait

Announce the pass, depth, and purpose before dispatch. Expect an acknowledgement, periodic checkpoints, interim findings with stable IDs, and prompt context requests as incoming messages. When a checkpoint arrives, relay it to the user in a line or two and end your turn with no tool calls so the user can follow progress while the subagent keeps running. Answer a context request with `send_message(Recipient=<conversationId>, Message=...)`, then end your turn to wait again.

Waiting means ending your turn (calling no more tools) while subagents run. Antigravity wakes you automatically when a message arrives. Never poll `manage_subagents`, never set a `schedule` timer or shell `sleep` to check status, and never read a subagent's `transcript.jsonl` to inspect progress. A quiet interval does not establish failure; intervene only for a context request, an execution failure, concrete evidence that useful progress is blocked, or a user-directed scope change. Do not stop or restart a pass because of elapsed time.

A message that says the subagent is waiting on its own background command is not a finished pass; the final report follows when that command ends. If a subagent stops with a partial assessment, continue the same `conversationId` with `send_message`.

Check each completed report for coverage, context gaps, and reconciliation of every interim finding before proceeding. A tool error or partial assessment is not a completed pass. Relay returned coverage and remaining work to the user, preserving the full original response for the next participant.

In adversarial review, do not classify findings as `confirmed` or start repairs until the exchange finishes, and explain protocol transitions, evidence-driven continuation, and the stopping reason so the user can follow the exchange.
