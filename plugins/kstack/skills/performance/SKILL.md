---
name: performance
description: >-
  Measure and improve slow or resource-heavy code against a baseline, from a one-off fix to a sustained loop that improves one metric toward a target. Use when something is slow, when asked to make code faster or lighter, or before reporting a speedup or regression you measured.
---

# Performance

Tie every change to a measurement. Don't read source in place of measuring, and don't claim a ceiling or a win you haven't run.

## Baseline

- Choose a workload that reproduces the complaint, with realistic data size, history, and concurrency. Run contrasting workloads and confirm the slow case is slow while easier cases separate as expected. If nothing reproduces the complaint, fix the reproduction before optimizing.
- Build one repeatable command that emits the metric and prints its error count and a count of the work done, per [Build the Lever](../engineering-principles/references/build-the-lever.md).
- Vet the baseline with the [benchmark checklist](references/benchmark-checklist.md) before planning from it, and vet every later number the same way.

## Find the limiter

Profile in runs you don't report, and map the hot spot to source. The limiter is the target; a change that doesn't touch it won't move the number. See [Explain the Number](../engineering-principles/references/explain-the-number.md).

## Change

Try the performance mantras in order, cheapest first, and stop when one meets the target:

1. Don't do it. Stop work whose result nothing uses rather than making it cheaper.
2. Do it, but don't do it again.
3. Do it less.
4. Do it later.
5. Do it when they're not looking.
6. Do it concurrently.
7. Do it cheaper.

One change, one measurement, then keep or revert. Never stack untested changes. A change that doesn't move the number past the noise is reverted, however much it "should" help. Correctness and simplicity outrank the number: revert a win that breaks behavior, and keep a simplification that holds the number.

## Improving one metric over many attempts

When the goal is a target on one metric rather than a single fix:

- Fix the metric, the direction that counts as better, and a stop condition that pairs the target with a minimum number of attempts, so a lucky early win can't end the run. Use the user's numbers when given; otherwise agree them.
- Freeze the harness once it is vetted. Record the baseline and a passing run of the regression tests before any change.
- Keep a decision log outside the tree, one row per attempt: hypothesis, change, before, after, delta, tests, kept or reverted. Read it before each attempt.
- Ground each hypothesis in a specific mechanism ("defer X off the startup path because it blocks first paint"), not "try memoizing something". Independent hypotheses can run in parallel in separate worktrees.
- Commit each accepted change on its own.
- Push past the first plateau: after several rejects in a row, change category, combine near-misses, re-read the source, or try something more radical.
- Stop when the condition is met or the remaining ideas are marginal. Never relax the condition to meet it.

## Report

Lead with the verdict: faster, slower, no measurable difference, or inconclusive. Give the number with its unit, the run count, the range, and the limiter, for example "p50 41 ms → 33 ms, median of 7 runs per side, range 32 to 35 ms after, bound by JSON parsing on one core". For a sustained run, add baseline to final with the percent change, attempts kept and reverted, the decision log's path, and the best idea not yet tried.
