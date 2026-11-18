# Minimize Reader Load

Maintainability is the work a reader must do to understand code. Track two axes: **layers to trace** (indirections between the question and the answer) and **state to hold** (hidden or mutable context the reader must keep in mind). The axes are independent. Guard both.

- **Collapse layers** that cost more than they save: wrappers with one caller, adapters with no second implementation, speculative indirection that was never needed. Inline them.
- **Make adjacent layers change the abstraction.** A layer that repeats the same methods and arguments adds load without compression. Collapse pass-through layers.
- **Shrink state scope.** Prefer pure functions (returns over mutations), locals over fields, fields over module state, and module state over globals. Derive instead of sync.
- **Name the invariant at the boundary**, not in every consumer.

**The test:** can a new reader answer "where does X come from?" and "what can change X?" in under 30 seconds? If not, cut layers or cut state.
