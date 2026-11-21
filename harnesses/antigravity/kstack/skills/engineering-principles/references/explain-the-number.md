# Explain the Number

- **Write the decision before you run.** Name the result that would change a decision, and the noise floor. Stop when the run-to-run spread is larger than the effect.
- **Ask "why not double?"** Name the resource or code path that bounds the result. Get it from a profile or system counters taken during a run. A guess from reading the code is not a limiter.
- **List what else the number could be measuring, and rule out each with evidence.** The usual suspects are errors, skipped or cached work, code that never ran, an untuned side left on default settings, noise, and a piece too small to matter end to end.
- **Keep the evidence with the number:** the run count, the spread, and the limiter.

For a performance number, run the full [benchmark checklist](../../performance/references/benchmark-checklist.md). For an eval result, ask the same of the trials: did every run do the task, does the gap hold across trials and models, and does the scenario matter.
