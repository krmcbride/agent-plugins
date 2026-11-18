# Sequence Work into Verifiable Units

Order work as a sequence of small units, each ending in a state you can check, and don't advance until the current one passes.

**Execution.** In a sweep, migration, or any run of similar edits, verify each change before starting the next. Each unit is a bracket: known-good state, one change, run the check, then proceed. When a [lever](build-the-lever.md) does the edits, the per-unit check is nearly free. Run it anyway.

**Delivery.** Stack commits and PRs in the order that proves the work. The canonical shape is the failing test, then the fix. Other orders that tell the story: a subtraction before the reshape, a baseline capture before the treatment. Each commit stands on its own.

[Prove It Works](prove-it-works.md) keeps each check real; [Build the Lever](build-the-lever.md) makes it cheap.
