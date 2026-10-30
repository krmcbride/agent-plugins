# Build the Lever

When the work isn't trivial, build the tool that does it instead of doing it by hand. This applies to edits, migrations, analyses, and checks, not only to bulk work.

A codemod, generator, or script does the work the same way every time and reruns for free. It is one artifact a reviewer can read and rerun to check the work. Hand-done changes can only be re-verified by redoing them. A deterministic script turns "trust me" into "run this".

Default to building the lever. Skip it only when the task is trivial: a couple of obvious edits you can see at a glance.

- Do the first unit by hand to learn the recipe, then build the tool. Prove it by rerunning it on that unit and diffing against your hand-done version. Make it safe to rerun.
- Codemod or script for edits, generator for repetitive files, a dump-to-sqlite query for analysis, a rerunnable check for verification.
- A deterministic lever beats fan-out. If the tool can process every unit in one pass, run it; don't delegate agents to hand-apply what a script can do.
- When you do fan work out to subagents, give them one written recipe: the steps, the verification contract, and the files they must not touch.
- Applying this principle produces a file. If you cite it and there is no codemod, script, or generator in the diff or the scratch directory, you didn't apply it.
- Commit the lever when the work outlives the session.

The bar is triviality, not repetition. A one-off still earns a lever when the lever is what makes the work checkable. Per the [Laziness Protocol](laziness-protocol.md), build the smallest script that does or proves the job, never a framework.

This differs from [Encode Lessons in Structure](encode-lessons-in-structure.md), which turns a recurring instruction into a lasting guardrail. This is about throughput and reviewability on the work in front of you.
