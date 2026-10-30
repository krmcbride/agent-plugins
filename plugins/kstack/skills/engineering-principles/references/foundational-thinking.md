# Foundational Thinking

Structural decisions protect option value. Code-level decisions protect simplicity.

**Data structures first.** Get the data shape right before writing logic, so the code that follows becomes obvious. Define core types early, trace every access pattern, and choose structures that match the dominant paths.

At code level, DRY the structure, not every line. Types and data models should converge. Three similar statements still beat a premature abstraction. Prefer explicit over clever. Test behavior and edge cases, not line counts.

**Concurrency corollary.** Before sharing state between actors, ask "what happens if another actor modifies this concurrently?" If the answer is not "nothing", isolate it per [Separate Before Serializing Shared State](separate-before-serializing-shared-state.md).

**Scaffold first.** If something helps every later phase, do it first. Ask "does every subsequent phase benefit from this existing?" CI, linting, test infrastructure, and shared types are scaffold. Sequence for option value: setup before features, tests before fixes. Keep commits small and single-purpose.

Each increment should land a coherent abstraction or deepen one that exists. Do not spread a new capability across callers as special-case coordination.

Subtraction comes before scaffolding: remove dead code first, then lay foundations, per [Subtract Before You Add](subtract-before-you-add.md).
