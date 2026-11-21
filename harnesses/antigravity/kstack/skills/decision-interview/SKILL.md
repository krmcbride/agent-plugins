---
name: decision-interview
description: >-
  Interview the user about a plan or design, identify decisions remaining after
  discovery, or resolve a material user-owned choice blocking work.
---

# Decision Interview

Use the interview to settle choices that materially affect behavior, scope, architecture, compatibility, risk, cost, or user experience. Discover facts from available evidence first and resolve routine implementation choices using project conventions.

## Explore before asking

Inspect the code, tests, plans, configuration, or other evidence that can settle the uncertainty before asking anything. Distinguish:

- **Facts** supported by evidence, including any contradictions.
- **Assumptions** that need a stated validation path.
- **Decisions** where reasonable alternatives have material consequences and the user owns the trade-off.
- **Investigations** such as a prototype or benchmark needed before choosing.

Do not reopen settled decisions without new conflicting evidence. A strong recommendation is still a recommendation, not a discovered fact.

## Ask the next material question

Resolve parent decisions before dependent mechanisms. Ask one question at a time and wait for its answer. State the concrete choice, put your recommended answer first with its reason and material trade-off, and keep viable alternatives visible.

Keep the decision tree internal unless a brief overview helps orientation. Adapt after each answer; do not manufacture questions or ask the user to supply facts that can be inspected.

Use `ask_question` for structured multiple-choice decisions (prefixing the first, recommended option with `(Recommended)` and omitting manual numbering or an "Other" option, which the UI adds). Use plain text for trivial yes/no or open-ended questions.

## Record and resume

Keep a concise ledger of decisions and rationale, assumptions and validation, open choices and what they block, and necessary investigations. Record conclusions rather than a transcript. Fold the ledger into an implementation contract or plan artifact when one is being maintained; otherwise keep it in the conversation.

Finish when material choices for the next step are settled, deliberately deferred, or assigned to an investigation, with any remaining blockers explicit. Summarize the outcome and resume already-authorized work. Ask for final confirmation only if a material ambiguity remains or the user requested it. An interview-only request ends with the conclusions; during implementation, pause only work that depends on an unresolved decision.
