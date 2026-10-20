---
name: code-shape
description: >-
  Review or restructure code for module size, single responsibility, and dead weight: oversized files, retained replaced implementations, test-only production code, speculative mechanisms, and duplicated representations. Use for a code-shape review of completed implementation work or when splitting an oversized module.
---

# Code Shape

Code should be composed from small modules whose names and file boundaries tell a reader what each part does. Agents drift the other way: they append to the file already open, keep replaced code alive so old tests compile, silence warnings instead of deleting, and add fallbacks and extension points nobody asked for. This skill names that drift so it can be caught before review by a human.

Language and framework idiom decide how a split is expressed; they do not excuse a module that does several jobs.

## While implementing

- Put new behavior where its responsibility lives; when a file approaches the size budget, split it before adding more.
- Delete what you replace and port its tests to the new path.
- Add compatibility, fallbacks, or extension points only for a stated requirement or an existing consumer.
- Remove code the change made unused instead of suppressing the warning.

## Size budget

Count production lines in a file, excluding inline test modules and generated code.

- **About 200:** the normal size of a well-composed module, class, or file.
- **Over 300:** look for more than one responsibility. Report a finding unless the file is one cohesive unit, such as a single state machine or a data table.
- **Over 500:** hard stop.

Splitting does not always require restructuring. Spreading a module's members across files that each convey one meaning is often enough: several files in one Go package, Rust submodules behind a small facade, or a TypeScript directory with an index that defines its public surface. Prefer that before inventing new abstractions. When a cohesive concept has emerged inside a module, give it its own package or module.

## Hard stops

These block completion and return the work to the implementer. Resolve each by fixing it, or by recording a reason the user accepts.

1. **Oversized file:** a production file over 500 lines.
2. **Retained replaced implementation:** an old function, type, signature, or code path kept after its replacement, including one kept only so existing tests compile, such as an old API behind `#[cfg(test)]`, a test-only export, or a wrapper preserving an old signature.
3. **Suppressed dead code:** an unused item kept alive with a lint suppression, such as `#[allow(dead_code)]`, `#[allow(unused_imports)]`, `//nolint`, or `eslint-disable`, or an export consumed only by tests.
4. **Production code aware of tests:** production branches on test mode, such as `cfg!(test)` or `NODE_ENV === "test"`, or test fakes, fixtures, or test-only constructors inside production modules.
5. **Unrequested compatibility:** shims, aliases, fallbacks, or migrations for state, flags, or interfaces that were never released, or that the contract did not require to stay compatible.

## Findings

Report these when the evidence supports them. They do not block on their own; group related findings into a concrete proposal.

- **Mixed responsibilities:** one module combining process execution, queries, mutations, policy, or presentation that change for different reasons.
- **Speculative mechanisms:** generic hooks, metadata channels, plugin points, options, or configuration with no current consumer.
- **Parallel representations:** a new DTO, snapshot, or model per caller for the same data without a boundary that needs it.
- **Pass-through indirection:** a wrapper, interface, or layer that only renames a call. If deleting it removes only a name, it has not earned its cost.
- **Copied logic:** helpers or policies repeated across modules instead of living with their owner.
- **Leaky presentation:** rendering or UI-state code performing effects that belong to a service or adapter.
- **Weak names:** modules named for mechanisms (`utils`, `helpers`, `common`, `misc`) rather than domain concepts, or one name used for two concepts.
- **Visibility:** wider visibility than callers need, or public items scattered among private details.
- **Tests:** tests placed away from the layer that owns the behavior, or duplicated coverage left behind by a migration.

## Language notes

Apply these where the project has no stronger convention.

- **Go:** split a growing package across files by meaning before creating new packages; create a package when a concept needs its own boundary. Domain types use unexported fields with constructors and accessors, and return copies of slices and maps. Library packages return errors rather than logging.
- **Rust:** keep test support in `mod tests` or a `test_support` module rather than scattered `#[cfg(test)]` items. Move a large inline test module into its own `tests.rs` file. A module directory with a small facade can expose a stable surface while its files split by responsibility.
- **TypeScript:** expose a directory's public surface through its index or package exports; do not export internals for tests.

## Reviewing

Measure before judging: list the changed files and their production line counts, and compare each with its size at the base revision. For a replacement, search for the old names to confirm nothing survives in tests or behind suppressions.

For each hard stop or finding, give the rule, the location, the evidence, and the concrete change: the files a module should split into and what each owns, or what to delete. Ask of every change: what would you delete, merge, or split? An empty answer must be earned by inspecting the diff, not assumed.
