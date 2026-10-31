---
name: engineering-principles
description: >-
  Engineering principles for design, change, debugging, and verification, each indexed by the situation it applies to. Use when choosing a data shape or type design, placing validation, sizing a diff or refactor, sequencing a migration or multi-step change, debugging after a failed fix, writing or keeping a test, trusting a measured number, or deciding that work is done.
---

# Engineering Principles

Each entry names the situation it applies to. When one applies, read its reference before acting on it; the index line is a reminder, not the principle. They inform judgment and are not a checklist to recite.

When the user runs this skill as a slash command, they want these principles applied to the work in their message. Before starting, pick the entries whose situations that work will meet and read their references. When you report, name each principle that changed a decision and the choice it changed. Cite only principles whose reference you read.

## Design

- [Foundational Thinking](references/foundational-thinking.md): before writing logic. Choose core types and data structures first, sequence scaffold before features, and ask what concurrent actors share.
- [Model the Domain](references/model-the-domain.md): stateful logic, or code that branches a lot or repeats a shape assumption across files. Encode the domain in a structure instead of scattered conditionals.
- [Type System Discipline](references/type-system-discipline.md): designing types or a signature in a typed language. Make illegal states unrepresentable, brand primitives, and parse external data at boundaries.
- [Boundary Discipline](references/boundary-discipline.md): wiring validation, error handling, or framework adapters. Guard at system boundaries, trust internal types, and keep business logic pure.
- [Minimize Reader Load](references/minimize-reader-load.md): shaping or reviewing code that is hard to trace. Count layers and hidden state, collapse one-caller wrappers, and shrink mutable scope.
- [Make Operations Idempotent](references/make-operations-idempotent.md): commands, lifecycle steps, or loops that run amid crashes and retries. Converge to the same end state from any partial run.
- [Separate Before Serializing Shared State](references/separate-before-serializing-shared-state.md): concurrent actors that might write the same file, branch, key, or object. Eliminate the sharing before reaching for a lock.
- [Exhaust the Design Space](references/exhaust-the-design-space.md): a novel interaction or architectural decision with no precedent. Compare two or three prototypes before committing.

## Change

- [Laziness Protocol](references/laziness-protocol.md): sizing a diff, or tempted to add abstractions, layers, or flags threaded through calls. Bias toward deletion and the smallest change that solves the problem.
- [Subtract Before You Add](references/subtract-before-you-add.md): sequencing an addition, refactor, or rewrite. Remove dead weight first, then build on the simpler base.
- [Redesign from First Principles](references/redesign-from-first-principles.md): integrating a new requirement into an existing design. Redesign as if it had been foundational from the start.
- [Migrate Callers Then Delete Legacy APIs](references/migrate-callers-then-delete-legacy-apis.md): a new internal API while old callers exist. Migrate and delete in one change.
- [Outcome-Oriented Execution](references/outcome-oriented-execution.md): planned rewrites and migrations with phase boundaries. Converge on the target instead of preserving throwaway intermediate states.
- [Sequence Work into Verifiable Units](references/sequence-verifiable-units.md): sweeps, migrations, runs of similar edits, and ordering commits. Each small unit ends in a check that passes before the next starts.
- [Build the Lever](references/build-the-lever.md): any non-trivial edit, migration, analysis, or check. Build the codemod, script, or generator that does or proves it, so a reviewer can rerun it.
- [Encode Lessons in Structure](references/encode-lessons-in-structure.md): writing the same instruction or correction a second time. Make it a lint, type, check, or script instead of more text.

## Debugging and verification

- [Fix Root Causes](references/fix-root-causes.md): debugging. Trace each symptom to the first place the system went wrong and fix it there.
- [Attack the Premise](references/attack-the-premise.md): two or more fixes sharing one premise have failed the same check. Test the premise before writing another fix.
- [Prove It Works](references/prove-it-works.md): before declaring work done. Check the real artifact, not a proxy, a self-report, or "it compiles".
- [Test Behavior, Not Implementation](references/test-behavior-not-implementation.md): writing, changing, or keeping a test. Assert what the code's users can observe.
- [Explain the Number](references/explain-the-number.md): before measuring, and before trusting, reporting, or acting on a measured number. Name what limits it and rule out that it measured something else.

The `debugging`, `performance`, `refactoring`, and `prototyping` skills apply these principles to whole tasks.
