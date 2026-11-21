# Boundary Discipline

Place validation, type narrowing, and error handling at system boundaries. Trust internal code. Business logic lives in pure functions, and the shell around it is thin and mechanical.

- **At boundaries** (CLI args, config files, external APIs, network protocols): validate, return errors, and handle input defensively.
- **Inside the system:** typed data, error propagation, no re-validation. Trust the types.
- **Across the boundary:** expose domain concepts, not the boundary's private representation.

Applications:

- Parse raw data into domain types at the boundary.
- Do not re-export transport, storage, framework, or wire types through the public surface.
- No redundant nil checks deep in call chains when the boundary already validated.
- Business logic in pure functions with no framework dependencies.

The tests:

- Is this data crossing a system boundary right now? If not, validation is redundant.
- Can this be a pure function that the shell just calls? If so, extract it.
