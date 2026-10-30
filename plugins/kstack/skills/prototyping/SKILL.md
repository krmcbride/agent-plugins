---
name: prototyping
description: >-
  Build a throwaway sketch to settle a design or behavioral question by observation: compare layouts or interactions, or answer a fork such as which approach is faster or how a library actually behaves. Use for "prototype", "mock it up", "try this layout", "sketch it to decide", or when a question you would otherwise ask the user could be answered by running something.
---

# Prototyping

The prototype is an instrument for making one decision cheaply. It is thrown away; the real build follows.

## Ask or observe

Before asking the user which approach to take, check whether the answer is a fact you could observe by running something: behavior, timing, layout, output, or performance. If it is, the question is not the user's to answer. Prototype it and let the result decide. Reserve the question for a product or preference call no experiment can settle.

## Build it

Here the usual bar inverts: speed over polish, no tests, no abstractions, no planning. The rigor goes into choosing the right design cheaply.

1. **Scope the decision** the prototype exists to make: which layout, interaction, or density, or for an empirical fork, which behavior, timing, or approach. No decision means no prototype.
2. **Gather references when the design space is open:** look for prior art and let the user pick directions before you build. Skip this when the direction is set.
3. **Build in a scratch directory, separate from production source.** For a visual decision, use vanilla HTML, CSS, and JavaScript or the lightest stack that renders the idea. For a behavioral or timing decision, write the smallest script that exercises the question.
4. **Compare alternatives side by side.** Put the variants behind one switcher (buttons or a keypress), each labeled. Propose variations the user didn't ask for, and throw an approach away to try another, per [Exhaust the Design Space](../engineering-principles/references/exhaust-the-design-space.md).
5. **Observe the result.** For a visual decision, screenshot each variant and drive the interaction. For a behavioral decision, log the timing, print the output, or watch the render. The observation is the test.

## Hand back

Present the variants, the evidence (screenshots, or the observed output or timing), the tradeoffs, your recommendation, and the scratch path. Say plainly that the prototype is throwaway, and build the chosen direction properly in production code.
