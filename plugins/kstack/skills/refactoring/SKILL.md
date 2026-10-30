---
name: refactoring
description: >-
  Change code structure without changing behavior: rename, extract, inline, dedupe, move, or reshape a module, type, or API. Use for refactors and cleanups, and to split a structural change out of feature or bug work.
---

# Refactoring

The structure changes; the behavior does not. If the cleanup reveals a missing feature or a real bug, split it out and land the structural change first against the pinned behavior. A redesign that changes behavior is a feature; name it as one. A refactor large enough to need a plan and checkpoints is planned with the user before it starts.

1. **Pin the behavior first.** Learn the contract of the affected code, then write a characterization test, snapshot, or equivalence harness that captures current behavior before any structure moves. If the area has no coverage, write the pin before touching structure. Type checks and lint are not a pin.
2. **Name the structure the code is missing**, per [Model the Domain](../engineering-principles/references/model-the-domain.md). Boring code stays when its shape is already clear and local. The reshape must delete branches, duplicated rules, or invalid states, not add indirection.
3. **Name the target shape:** the module layout, types, and call graph you would build today, per [Foundational Thinking](../engineering-principles/references/foundational-thinking.md) and [Redesign from First Principles](../engineering-principles/references/redesign-from-first-principles.md). When the target crosses module boundaries, sketch the types and signatures before moving code.
4. **Subtract before you add.** Delete dead code, collapse one-caller wrappers, drop redundant validators, and remove orphaned references before introducing the new shape, per [Subtract Before You Add](../engineering-principles/references/subtract-before-you-add.md). Ship the smallest change that reaches the target. A speculative cleanup that "might help" is reverted.
5. **Move in small steps that keep the pin passing**, per [Sequence Work into Verifiable Units](../engineering-principles/references/sequence-verifiable-units.md). For an API reshape, migrate every caller and delete the old API in the same change, per [Migrate Callers Then Delete Legacy APIs](../engineering-principles/references/migrate-callers-then-delete-legacy-apis.md): no compatibility shims and no parallel old and new paths. Use a codemod for mechanical edits across many sites, per [Build the Lever](../engineering-principles/references/build-the-lever.md).
6. **Prove behavior is unchanged** on the real artifact, not "it compiles". For larger reshapes, run an equivalence check: a script that diffs old and new outputs, a recorded baseline replayed against the new code, or a smoke run on the real surface.
7. **Confirm the change earns its place.** The measure is reduced reader load, per [Minimize Reader Load](../engineering-principles/references/minimize-reader-load.md). If the diff does not make the code easier to follow somewhere, revert it.
8. **Order the commits to tell the story:** the subtraction, then the reshape, then any follow-on cleanup, each passing on its own.

Report the structure that changed, the pin it was held against, the equivalence evidence, how reader load changed, and what was reverted.
