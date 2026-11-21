---
name: implementation-workflow
description: >-
  Plan substantial implementation work with the user and carry it to verified
  completion: settle decisions, agree an outcome-level contract, execute with
  Antigravity's subagent and workflow primitives, and verify the result. Use
  for large features, migrations, or refactors that exceed one focused change.
---

# Implementation Workflow

Help the user turn an implementation discussion into an agreed contract, then deliver it and prove the result. Invest in settling decisions up front and in verification throughout; do not build a task-tracking layer between them. Ordinary investigation and coding need none of this; multiple steps, file count, or context-window transitions alone do not make work substantial.

## Plan with the user

Inspect relevant code and tests, and check the host for open pull or merge requests that already cover the work, raising any with the user before planning around them. Explore alternatives, and keep settled decisions with their rationale. Use `decision-interview` when consequential user-owned choices remain; investigate discoverable facts and leave routine implementation choices to the implementing agent. Planning does not authorize implementation unless the request includes it.

## Agree the contract

Summarize the plan as a contract the user can check, with structure proportional to the work:

- The observable outcome and why it matters.
- Invariants, exclusions, and compatibility boundaries.
- Settled decisions and their rationale.
- Critical evidence, relevant baseline, and stable code or document pointers.
- Acceptance postconditions and the checks that demonstrate them.
- Checkpoints where the user wants to review before work continues.

Describe what must be true, not an ordered editing recipe; the implementing agent chooses the route within these guardrails. Divide the work into chunks only where that helps delegation or verification. Name each chunk's outcome, real prerequisites, and the files or interfaces it owns so parallel work does not compete. For a substantial plan that benefits from an explicit sign-off document, write it as a plan artifact (`write_file` in the artifact directory with `ArtifactMetadata` and `RequestFeedback: true`); for smaller contracts, present it directly in the conversation.

## Execute through Antigravity

Once the user approves execution, read the `engineering-principles` skill and read the reference files for the situations this work will meet before writing code. Then carry the whole agreed plan to completion. Stop only at agreed checkpoints, for a consequential decision the contract does not settle, or for a blocker; a finished chunk is not a stopping point.

Within the contract's scope the code is yours: merge what the change would duplicate, delete what it replaces, and fix the faults it uncovers there instead of building beside them. Outside that scope, report problems and leave the code alone.

Keep the contract in the coordinating session. Each delegated subagent starts without this session's context and adds its own cost, so delegate a chunk only when it can run beside other work or would crowd out the contract here, and do the rest yourself. Choose the Antigravity primitive that fits the work:

- **`invoke_subagent` + `send_message`:** for independent implementation chunks or read-only research (`research` subagent). Give each subagent the part of the contract it needs, including this ownership rule and the principles that apply to its chunk. Launch independent subagents in parallel in one turn, then end your turn to wait for reactive messages — never poll `manage_subagents` or set timers.
- **`Workspace: "share"` (or `"branch"`):** required whenever two subagents edit or build at the same time so they get separate checkouts and do not collide on the working tree. Chunks running in parallel also need their own runtime resources: ports, Docker Compose project names, databases, and data paths. When the project hard-codes one of these, run the chunks that use it one at a time. Land or merge a subagent's work before calling `manage_subagents(Action="kill")`, which deletes its workspace.
- **`run_workflow`:** for mechanical fan-outs across many files/modules or staged multi-agent pipelines (read the `run-workflow` skill first).
- **`swarm`:** only when the user explicitly asks for a swarm or a shared worker board.

Keep the coordinating context small enough to hold the contract through final review. Do not create a parallel tracker, checkpoint file, or progress ledger. When the contract must change, settle the change with the user, restate it, and pause only dependent work.

Where the work has organizational work items, follow that organization's practice; layered context or skills define it. Do not infer permission to write to an external tracker from its availability.

## Verify throughout

Hold implementing subagents to small, single-purpose modules that delete what they replace. Check each chunk when it returns: run its acceptance checks, confirm it honors the invariants, check that its files stay small and nothing it replaced survives, and inspect the diff rather than trusting the summary. Repair a failure before starting work that depends on it.

Verify the combined outcome against the full contract; completed chunks alone do not prove integration. Then review it with `code-review` (including its `code-shape` pass when production files are created or grow), giving the contract to the review as its requirements. Report what was verified, accepted deviations, every change the contract did not name, and remaining gaps.

## Keep deliverables self-describing

Commits, pull requests, code, and comments explain themselves to their audience. Do not reference planning conversations, subagent conversation IDs, or chunk names; reference organizational work items only as the project's convention requires. Record lasting architecture and product decisions in project documentation.
