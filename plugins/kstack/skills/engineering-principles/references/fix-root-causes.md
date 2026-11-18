# Fix Root Causes

Fix the fault, not the place where it surfaced. The root cause is the first place the system did something it should not do, or failed to handle a state it should handle.

- Reproduce first.
- Ask "why" at each step until the answer is a wrong decision in the code.
- When stuck, instrument. Read the actual error and the actual state.
- Ask whether the state that triggered the symptom is legitimate. If the system may be in that state, the code that broke on it is the root cause, and handling the state there is the fix. If the state should never exist, a check where it broke hides the bug; find what produced the state. Guards, retries, swallowed errors, clamped values, and discarded state are the usual ways to hide a bug.
- Check for the pattern, not just the instance. Find every place with the same fault and fix them all.
- If the deciding fact took a deep dig to find, propose the cheap, always-on signal that would have shown it at first look.
