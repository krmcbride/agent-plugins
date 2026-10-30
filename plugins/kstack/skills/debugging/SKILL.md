---
name: debugging
description: >-
  Reproduce, root-cause, and fix a reported defect with runtime evidence, or diagnose a runtime symptom such as a crash, hang, leak, CPU spin, or flaky failure, including from a captured profile, trace, or heap snapshot. Use when fixing a bug, when a fix attempt has failed, or when asked why something misbehaves at runtime.
---

# Debugging

Every line you ship traces to runtime evidence. A change that "might help" is a hypothesis, not a fix, and it does not ship. When evidence refutes a hypothesis, revert what it motivated.

## Reproduce

Reproduce the defect yourself on the surface where it was reported: the browser, CLI, service, or test the user saw it in. If it won't reproduce directly, synthesize the trigger, tighten the conditions, or instrument until it fires. Ask the user to reproduce only after going as far as you can, and name the specific reason you cannot reach the target.

A test that exercises a different path from the reported one is not a reproduction.

## Find the cause

- List the candidate hypotheses, then eliminate them. Each step, take the check that cuts the most remaining space (bisecting history with `git bisect`, shrinking the input, or splitting the code path), get runtime evidence, and rule out what it contradicts.
- When program state is unclear, add logging or instrumentation and read it as the code runs. Don't infer state from reading source.
- For a regression, read the history of the affected code: what changed, and why.
- Trace the symptom to the first place the system went wrong, per [Fix Root Causes](../engineering-principles/references/fix-root-causes.md).
- When two fixes sharing one premise have failed, stop and test the premise, per [Attack the Premise](../engineering-principles/references/attack-the-premise.md).
- Confirm the surviving mechanism with evidence before planning the fix.

## Diagnose without fixing

When asked for a diagnosis, or handed a captured artifact (a CPU profile, trace, heap snapshot, spindump, or core dump), the deliverable is the mechanism with its evidence. Stop before changing code unless asked to fix it.

- **Live process:** capture a real signal (a CPU profile for a spin, a heap snapshot for a leak, a trace for a glitch), reduce it to the hot path, retainer chain, or loop firing without input, and confirm the mechanism with injected instrumentation before believing it.
- **Captured artifact:** read it, don't re-run it. Transform it into something queryable first, such as one row per sample, frame, or node in sqlite, then query for where time or memory goes.
- Map the finding to a file, symbol, and line. A frame with no source mapping is not yet a diagnosis; resolve the symbols or say the artifact lacks them.
- Without a paired before-and-after capture, present the finding as the strongest hypothesis the evidence supports, not a confirmed cause.

## Fix

- Make the smallest change the evidence justifies, and fix every instance of the same fault, not only the reported one.
- When the bug has a cheap local test path, write the regression test first and run it to confirm it fails for the intended reason before touching production code. When the test would need broad harness setup, brittle mocks, slow infrastructure, or production-only state, use the closest executable check instead: a script, a reproduction command, or a focused integration check. See [Test Behavior, Not Implementation](../engineering-principles/references/test-behavior-not-implementation.md).
- Do not change a test to match a wrong implementation, or weaken an assertion unless the expected behavior has genuinely changed.

## Verify

Rerun the original reproduction on the same surface. An inconclusive result or a different surface is not a pass; say so. Unit tests show branch behavior, not that the bug is gone.

Report what was broken, the root cause, the fix, and the failing-before and passing-after evidence. If you could not show failing-before evidence, say why and name the check you used instead.
