# Own Boundaries and Dependency Direction

Give each business capability one owner with a supported public surface, and point source dependencies from mechanisms toward the policy they serve. A boundary earns its place when it protects business rules, separates concerns that change for different reasons, or makes ownership explicit. A small application can have clear dependencies without layered folders or an interface for every concrete type.

- **Find the real boundaries first.** Check where code executes and deploys before trusting directory names. Browser, server, worker, CLI, and build code can share a repository without sharing a runtime or a trust boundary.
- **Keep owned state private.** Another module's persistence and internals are private unless it publishes them as an integration contract. Reusable contracts stay independent of any one screen or storage layout; adapt them for the consumer at the edge.
- **Point dependencies at policy.** Domain rules do not depend on transport, persistence, presentation, or framework lifecycle. Use cases coordinate the domain and the IO they need, adapters translate in and out, and executables wire concrete dependencies at startup. These are distinctions of ownership, not required directories or classes.
- **Reverse a dependency only when it pays.** Define a narrow interface at the point of use when it inverts an IO dependency, isolates something volatile, or gives a useful test seam, per [Minimize Reader Load](minimize-reader-load.md).
- **Enforce authorization and tenancy where the operation is owned.** A check in the presentation layer does not replace one at the application boundary.
- **Handle failure where context exists.** Translate errors and add operational context at the boundary that understands them, and log a failure once there rather than at every layer.
- **Test each part at its own surface.** Domain rules without IO, use cases through their public surface, and adapters against the protocol or storage they translate.

Validation and parsing at the edges follow [Boundary Discipline](boundary-discipline.md) and [Type System Discipline](type-system-discipline.md).

**The test:** trace one representative operation from its entrypoint through policy to IO, and name the owner of each invariant, translation, side effect, and dependency. Business rules in handlers, imports of another module's internals, and shared buckets of unrelated behavior are signs to confirm against actual coupling before proposing a refactor.
