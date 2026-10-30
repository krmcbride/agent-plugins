# Separate Before Serializing Shared State

When concurrent actors might share mutable state, first ask whether they need the same mutable object. If not, eliminate the sharing. When sharing is real, enforce serialization structurally: lockfiles, sequential phases, exclusive ownership. Instructions and conventions are not concurrency control.

Concurrent writes to shared state create race conditions that are intermittent, hard to reproduce, and expensive to debug.

1. **Identify shared mutable state:** files that several actors read and write, branches several push to, APIs several define and consume.
2. **Default to eliminating the shared write target.** Do these actors need one canonical object, or are they publishing independent facts? Give each actor its own file, key, branch, or state directory, and merge only at the read or reporting boundary. Two workers writing their own `lastX` field into one `state.json` is still shared mutation; `indexer-state.json` and `metrics-state.json` are not.
3. **Serialize structurally only when one shared write target is a real invariant:** lockfiles, sequential phases, a single-writer actor, or atomic compare-and-swap. Treat "we need a lock" as a design smell to check, not the default answer.
