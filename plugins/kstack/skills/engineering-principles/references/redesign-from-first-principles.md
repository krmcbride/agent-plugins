# Redesign from First Principles

When integrating a new requirement, don't bolt it onto the existing design. Redesign as if the requirement had been a foundational assumption from the start.

- Read all affected files and understand the current design.
- Ask: "If we were writing this from scratch with this requirement, what would we build?"
- Propagate the change through every reference: types, docs, examples, rationale.
- Think through the whole redesign, then deliver it incrementally.

This is how a design keeps its option value as requirements arrive. It differs from [Attack the Premise](attack-the-premise.md), which questions a fact the current design assumes.
