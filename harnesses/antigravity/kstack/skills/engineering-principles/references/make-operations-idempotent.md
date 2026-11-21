# Make Operations Idempotent

Design operations so they converge to the correct state however many times they run and wherever the previous run stopped.

Derive each step from the state that exists, not from what the previous run meant to do. Read the current state, compare it with the goal, and apply only the difference.

Anything a run leaves behind, such as a lock, a temporary file, a half-written record, or a claimed job, must be recognizable as stale by the next run. Judge staleness by evidence that stays true wherever the previous run could have stopped. For example, write to a temporary path and rename it into place.

**The test:**

1. What happens if this runs twice in a row?
2. What happens if the previous run crashed at every possible point?

If any answer is "it depends on what state was left behind", the operation needs a reconciliation step.
