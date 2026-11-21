# Migrate Callers Then Delete Legacy APIs

When introducing a new internal API while old callers exist, migrate every caller and delete the old API in the same change. Do not keep compatibility layers, aliases, or parallel old and new paths.

- Update tests to assert the new contract, and delete tests that only protected the old implementation's details.
- Spot-check every rename against the actual files. Renames silently miss usages in strings, docs, config, and back-references.

This applies when:

- No external users depend on backward compatibility.
- The project can absorb a coordinated breaking change.
- The new API is part of a simplification or refactor.
