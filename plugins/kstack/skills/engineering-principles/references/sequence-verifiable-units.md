# Sequence Work into Verifiable Units

Order work as a sequence of small units, each ending in a state you can check, and don't advance until the current one passes.

A break caught at the unit that caused it is cheap to localize. A break caught after a batch is buried, and you have already built on a broken base. Sequencing the same units into a delivery a reviewer can replay turns "trust me" into "watch it go red, then green".

**Execution.** In a sweep, migration, or any run of similar edits, verify each change before starting the next. Each unit is a bracket: known-good state, one change, run the check, then proceed. Start from a clean, current base so every check measures against the real baseline. When a [lever](build-the-lever.md) does the edits, the per-unit check is nearly free. Run it anyway.

**Delivery.** Stack commits and PRs in the order that proves the work. The canonical shape is the failing test, then the fix. Other orders that tell the story: a subtraction before the reshape, a baseline capture before the treatment, the scaffold before the feature. Each commit stands on its own and the sequence reads as an argument.

[Prove It Works](prove-it-works.md) keeps each check real; [Build the Lever](build-the-lever.md) makes it cheap.
