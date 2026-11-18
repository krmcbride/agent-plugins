# Verify Findings

A reviewer's findings are claims. Before anyone acts on them, check each one separately, try to refute it, and score its risk. Agreement between agents is weak evidence, because agents share priors and tend to accept what they are shown; a run or a step-by-step trace is what settles a finding. Reviewers also overstate severity, so the verifier scores risk afresh.

## Choose what to verify

Verify every finding whose action under the [risk rubric](risk-rubric.md) would be `block`, `raise`, or `ask`, and every `mention` the user is likely to post. Leave out `nit` findings and plain suggestions; list them as unverified at the end of the report.

Group findings that share a root cause or rest on the same code path, and verify each group as one unit. Otherwise verify one finding per unit.

## Launch the verifiers

Launch one `kstack:review-critic` per unit, in parallel, as the dispatch reference describes, with the verification assignment below. Give each verifier:

- **Intent:** the requirements from the packet: the user's ask or, for another author's pull request, its title, description, and linked issues.
- **Artifact:** the same exact refs, diff, or snapshot the reviewer had.
- **The claim:** for each finding in the unit, its ID, location, failure scenario, and any command the reviewer ran with its output. Leave out the reviewer's severity, confidence, risk scores, and argument for why it matters, so the verifier judges the code rather than the reasoning.
- **The rubric:** the risk rubric, verbatim.
- **Isolation:** that other verifiers run beside it, and any project isolation settings, as the dispatch reference describes.

## Verification assignment

The critic's own instructions cover the method: refute first, then prove by a run or a step-by-step trace, score every rubric axis from evidence it checked, and report commands that can be rerun. The assignment names the unit's findings and defines the one status to return for each:

- `reproduced`: a run shows the failure.
- `demonstrated`: a complete trace shows it.
- `refuted`: specific evidence shows the failure cannot happen or violates nothing the intent requires.
- `unverified`: neither, so the finding is not confirmed; the verifier names the observation that would settle it.

## Settle the result

Check the deciding evidence yourself before using it: rerun each `reproduced` command in a copy of your own, after the verifiers finish or with its own runtime resources, and read each `refuted` citation. Then settle each finding:

- When the verifier and reviewer agree on the status, use it.
- When they disagree and one side has a valid run that tests the disputed condition, the run decides.
- Otherwise mark the finding `disputed`, keep both sides' evidence, and give it the action `ask`. Do not run a further exchange; the user decides.

For the risk scores, take the verifier's. A score may exceed the reviewer's only when a run or trace shows the higher impact or exposure; otherwise keep the lower of the two. When the verifier changes a score, record the reviewer's value and the reason, such as "major → minor: only reachable when the cache is disabled".

## Report

Order the findings by action, `block` first, then by impact. For each, give its ID, location, the claim in one sentence, the status with the command and output or the trace, each rubric score with its reason, any score changed from the reviewer's and why, and the action. For another author's pull request, add a draft comment the user could post: the problem, the evidence, and a question or suggested fix, in a few sentences.

Then list the findings dropped as `refuted` or out of scope, each with the evidence that dropped it, so the user can bring one back. End with the unverified `nit` findings and suggestions.
