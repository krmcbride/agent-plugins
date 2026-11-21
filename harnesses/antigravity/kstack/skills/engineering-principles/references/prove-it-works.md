# Prove It Works

Verify every task's output by checking the real thing directly: run the feature, read the actual value, inspect the diff. Do not infer success from proxies, self-reports, or "it compiles".

- Verify on the surface the user will use. A passing check on a different surface is not a pass; say so.
- When verification fails, suspect the observation method before suspecting the system.

**Script the check when you can.** The strongest proof is a deterministic script that reruns the same comparison, not a one-time look. Write it, run it, and keep its output where the user can see it. Commit it when the trail must stay auditable.
