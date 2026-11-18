# Foundational Thinking

**Data structures first.** Get the data shape right before writing logic. Define core types early, trace every access pattern, and choose structures that match the dominant paths. DRY the structure, not every line.

**Concurrency corollary.** Before sharing state between actors, ask "what happens if another actor modifies this concurrently?" If the answer is not "nothing", isolate it per [Separate Before Serializing Shared State](separate-before-serializing-shared-state.md).

**Scaffold first.** If something helps every later phase, do it first. CI, linting, test infrastructure, and shared types are scaffold. Keep commits small and single-purpose.

Subtraction comes before scaffolding: remove dead code first, then lay foundations, per [Subtract Before You Add](subtract-before-you-add.md).
