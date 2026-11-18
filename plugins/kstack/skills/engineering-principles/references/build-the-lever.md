# Build the Lever

When the work isn't trivial, build the tool that does it instead of doing it by hand.

Default to building the lever. Skip it only when the task is trivial: a couple of obvious edits you can see at a glance.

- Do the first unit by hand, then build the tool. Prove it by rerunning it on that unit. Make it safe to rerun.
- A deterministic lever beats fan-out.
- When you do fan work out to subagents, give them one written recipe: the steps, the verification contract, and the files they must not touch.
- Applying this principle produces a file. If you cite it and there is no codemod, script, or generator in the diff or the scratch directory, you didn't apply it.
- Commit the lever when the work outlives the session.

The bar is triviality, not repetition. Per the [Laziness Protocol](laziness-protocol.md), build the smallest script that does or proves the job, never a framework.

This differs from [Encode Lessons in Structure](encode-lessons-in-structure.md), which turns a recurring instruction into a lasting guardrail. This is about throughput and reviewability on the work in front of you.
