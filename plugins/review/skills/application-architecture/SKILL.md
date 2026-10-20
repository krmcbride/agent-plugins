---
name: application-architecture
description: >-
  Design or review application boundaries, domain ownership, and dependency direction when starting or restructuring an application or assessing a material architectural change. Avoid applying a new architecture to routine local edits.
---

# Application Architecture

Start with the language, framework, and existing codebase. Add a boundary when it protects business rules, separates independently changing concerns, or makes ownership explicit. A small application can have clear dependencies without layered folders or an interface for every concrete type.

## Establish the boundaries

Inspect the relevant entrypoints, behavior, tests, and build tooling. Identify where the code executes and deploys before trusting directory names: browser, server, worker, CLI, and build code can share a repository without sharing a runtime or trust boundary.

Give each cohesive business capability an owner and a supported public surface. Keep internals private using normal ecosystem mechanisms. Preserve healthy conventions and externally visible behavior; make any requested behavior change explicit in the contracts and verification.

Keep reusable application contracts independent of a particular screen or storage layout. Adapt them for the consumer at the edge. Another module's persistence is private unless deliberately published as an integration contract.

## Assign responsibilities

Use these distinctions where they clarify ownership; they need not become separate directories or classes:

- **Domain** owns business concepts, invariants, and policies independently of transport, persistence, presentation, and framework lifecycle.
- **Application** coordinates use cases, transactions, policy enforcement, and required external capabilities without absorbing the domain's rules.
- **Inbound adapters** translate requests, commands, events, and UI actions into application calls and translate the results for their consumers.
- **Outbound adapters** implement persistence, external clients, queues, filesystems, and other IO needed by the application.
- **Composition** loads and validates configuration and wires concrete dependencies at an executable's startup or request boundary.

Source dependencies should point from mechanisms toward the policy they serve. Define a narrow interface at the point of use when it reverses an IO dependency, isolates volatility, or creates a useful testing seam. Keep a concrete dependency when an interface would only rename a pass-through call.

## Own data and invariants

Distinguish domain values from external contracts, persistence records, configuration, and view state when their responsibilities or lifecycles differ. Do not make an ORM or generated API type the domain model by default, or duplicate identical shapes without a boundary that benefits from it.

Translate external shapes at their owning adapters. Validate protocol input at the edge and business invariants in the domain. Use constructors or intention-revealing operations to protect invariant-carrying values; prevent callers from mutating owned state through escaped collections. Simple mutable transfer objects can remain idiomatic.

Keep environment parsing, SDK types, raw requests, tokens, and session objects outside the core. Pass only the facts or capabilities it needs. Translate errors and add operational context at the boundary that understands them.

Enforce authorization and tenancy at the application boundary that owns the operation. Presentation checks do not replace that enforcement. Record failures where operational context exists; avoid duplicate logging at every layer.

## Verify the design

Trace a representative operation from entrypoint through policy and IO. Check who owns each invariant, translation, side effect, and dependency. Test domain rules without IO, application workflows through stable use-case surfaces, and adapters against the protocol or storage behavior they translate. Use contract or end-to-end checks where they prove important integration.

For a replacement or migration, establish the observable compatibility baseline, including quirks callers rely on. When producers and consumers cannot change atomically, sequence compatible intermediate states. Make coexistence, recovery, and the evidence needed to retire the old path explicit; preserve behavior without reproducing accidental internal structure.

Treat business rules in handlers, imports into another module's internals, shared buckets of unrelated behavior, and pass-through wrappers as diagnostic signals. Confirm actual coupling before proposing a refactor. If deleting an abstraction only removes a name, it probably has not earned its cost.
