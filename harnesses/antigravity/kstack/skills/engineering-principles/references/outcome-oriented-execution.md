# Outcome-Oriented Execution

Optimize for the intended, verifiable end state rather than preserving smooth intermediate states. Keeping every intermediate step fully stable often creates temporary compatibility code that becomes long-lived debt. Converge on the target architecture and prove correctness at explicit verification boundaries.

- Prioritize end-state integrity over transitional stability.
- Intermediate breakage is acceptable when it is planned, scoped, and reversible.

Guardrails:

- Use this for planned rewrites and migrations with explicit phase boundaries.
- Declare where temporary breakage is acceptable.
- Keep high-signal checks running for the areas you are actively touching.
- Require full static and runtime verification when the plan completes.
