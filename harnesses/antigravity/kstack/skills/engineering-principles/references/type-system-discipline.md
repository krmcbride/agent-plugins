# Type System Discipline

Make the compiler reject impossible states, mismatched primitives, and unhandled variants.

- **Exhaust variants.** Match every case of a union so adding a variant is a compile error at each site that must handle it.
- **Brand semantic primitives.** If two arguments share a primitive type but mean different things, give each its own type. Validate once at creation.
- **External data is untyped until parsed.** RPC payloads, JSON, IPC messages, CLI args, config files, environment variables, and database rows each get a parse function at the boundary that turns unstructured input into the typed model. [Boundary Discipline](boundary-discipline.md) says where validation goes.
- **Derive types from authoritative schemas.** When a protocol buffer, OpenAPI spec, GraphQL schema, database migration, or design-token file owns a shape, derive from it instead of hand-writing a parallel type.
