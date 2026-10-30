# Type System Discipline

Make the compiler reject impossible states, mismatched primitives, and unhandled variants. Prefer defining errors and special cases out of existence over proliferating handlers.

- **Make illegal states unrepresentable.** Model alternatives as a discriminated union or sum type, not a bag of optional fields that only some combinations make valid.
- **Exhaust variants.** Match every case of a union so adding a variant is a compile error at each site that must handle it.
- **Brand semantic primitives.** `UserId` and `OrderId` are strings underneath but should not be interchangeable. Give each its own type, such as a branded intersection in TypeScript or a newtype elsewhere. Validate once at creation and trust the type downstream. If two arguments share a primitive type but mean different things, brand them.
- **External data is untyped until parsed.** RPC payloads, JSON, IPC messages, CLI args, config files, environment variables, and database rows each get a parse function at the boundary that turns unstructured input into the typed model. [Boundary Discipline](boundary-discipline.md) says where validation goes.
- **Derive types from authoritative schemas.** When a protocol buffer, OpenAPI spec, GraphQL schema, database migration, or design-token file owns a shape, derive from it instead of hand-writing a parallel type.
