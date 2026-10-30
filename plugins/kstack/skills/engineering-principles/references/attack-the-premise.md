# Attack the Premise

When two or more fixes that share one premise have failed the same check, suspect the premise, not the fixes. Each failed fix is evidence against the belief it assumed; a third fix on the same premise spends effort where the evidence already says the cause is not.

- **Write the premise down:** the one sentence every failed fix assumed.
- **Test the premise before the next fix.** Find an observation that would come out differently if the premise were false, and make it. Look at how the failures are distributed, not only at how large they are. Make the check rerunnable per [Build the Lever](build-the-lever.md).
- **Follow the evidence.** If it contradicts the premise, the cause is elsewhere: look for what the failures share that the premise did not predict. If it confirms the premise, ask the next "why" per [Fix Root Causes](fix-root-causes.md); the earlier fixes may have treated a consequence instead of the cause.
- **Remove the condition instead of compensating for it.** If one part always lands on the losing side, change what puts it there. A mechanism that cleans up afterward leaves the cause in place and adds work to every run.

**Stop:** do not start the next fix before the premise is written down and tested.
