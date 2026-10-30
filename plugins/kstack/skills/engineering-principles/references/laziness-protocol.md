# Laziness Protocol

Bias toward deletion and the smallest change that solves the problem. Apply it when refactoring, when sizing a diff, and whenever you are tempted to add an abstraction, a layer, or a flag threaded through several calls.

- **Consolidate decisions.** Do not repeat the same choice in several places. Put it behind one source of truth and pass the result as a simple flag.
- **Minimize the diff.** Make the smallest change that solves the problem. Fewer lines beat "elegant" boilerplate.
