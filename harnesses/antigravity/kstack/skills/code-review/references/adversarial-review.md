# Adversarial Review

## Freeze the packet and isolate the roles

Build the entry point's packet and add the specific assumptions, failure paths, or decisions to challenge. Freeze the requirements, scope, assumptions, and artifact for the exchange. Start a fresh `code-reviewer` and a separate fresh `review-critic` via `invoke_subagent` (each starts without inherited conversation history). Preserve both returned `conversationId` values: continue both via `send_message` within this artifact version, retain the reviewer across repairs, and start a fresh critic for each new artifact version.

Give each subagent the same packet and its own assignment below: the reviewer gets the selected depth and the initial reviewer assignment, and the critic gets the finding dispositions and the stopping contract.

Leave the critic and the exchange out of the reviewer's initial assignment, and call its task an initial review, not an adversarial one. The reviewer reviews as it would alone: one that expects an audit can lean on it or hold back a borderline finding, and the critic is better at removing weak findings than at restoring missing ones. The reviewer learns of the critique when it arrives.

## Relay the complete exchange

Keep an append-only transcript of the packet, every complete reviewer and critic response, and subsequent evidence or clarifications, identified by role, artifact version, and pass. Inline the exact text or supply accessible transcript files outside the reviewed checkout; every recipient must receive or read the complete exchange for this artifact version before responding. Retain original claims and corrections instead of overwriting earlier messages.

Schedule passes and forward participants' complete outputs unaltered via `send_message`, preserving their reviewer or critic attribution. Do not summarize or selectively quote their arguments, add rebuttals, suggest dispositions, or steer either subagent toward your preferred implementation. Progress summaries for the user are separate from the authoritative handoff and must not substitute for it. Wait for complete outputs before advancing; interim findings are visibility, not a finished pass.

Relay material context questions and factual answers to both subagents. Identify the source of clarifications, and append raw validation commands and results as new evidence without rewriting the original packet. If a clarification changes requirements, scope, assumptions, or the artifact, end the current exchange as incomplete and issue a new frozen packet; do not treat conclusions from different versions as agreement.

You may resolve access or execution problems and perform an agreed targeted check within existing authority. Do not adjudicate the argument while relaying it. Assess the result only after the exchange ends, preserving dissent and the evidence behind each classification.

## Initial reviewer assignment

Give the reviewer the assignment an ordinary review gets: the packet, the selected depth, and that depth's investigation and stopping contract. The packet's list of assumptions, failure paths, and decisions to challenge is the only addition. The reviewer's own instructions already have it verify the claims, try to falsify them, ground each finding in evidence, and keep original claims when it revises them, so do not restate those or set a goal such as finding reasons not to ship.

Ask for finding IDs in the form `R1`, `R2`, which keeps them distinct from the critic's.

A clean initial review still goes to the critic to check for missed findings. It does not trigger a code edit.

## Critic assignment

Give the critic the identical packet, complete reviewer output, and exchange history. State the task and its contract only. The critic's own instructions already cover how to audit, how to inspect the diff before the review on its first pass, and how to reconcile later passes, so do not restate those. Do not describe the reviewer's conclusions in the assignment or point the critic at particular claims, which would confine its search to what the reviewer already examined.

For the first pass on an artifact version, write the reviewer's output to a scratch file and pass its absolute path rather than inlining the text, so the critic inspects the diff before reading the review.

Ask for exactly one disposition for every current reviewer finding, by stable ID:

- `agree`: the finding is material and supported by cited frozen evidence. For a reproduced finding, the critic's rerun of its command shows the failure.
- `disagree_evidence`: specific code or tool evidence contradicts the finding.
- `disagree_concern`: an unsupported inference, unrealistic assumption, scope expansion, or missing evidence prevents acceptance.

Ask for `missed_finding` entries under stable IDs such as `C1` and `C2`.

An agreeing critic with no missed finding or unresolved material question can end the exchange without a ceremonial reviewer reply.

## Reviewer response and targeted verification

When the critic disagrees, adds a missed finding, or raises a material evidence question, continue the original reviewer's `conversationId` via `send_message` with the complete critique and exchange history.

For `disagree_evidence`, address the cited counterevidence: revise or retract when it refutes the claim, or supply specific evidence explaining why it does not. For `disagree_concern`, identify what observation would confirm or refute the concern and obtain it when feasible. Unsupported claims that cannot be substantiated remain unverified and non-blocking. Assess every `missed_finding` under the same evidence standard, and preserve retractions and their reasons.

Turn an important unresolved dispute into a concrete verification question. Use a targeted test, reproduction, or rigorous static trace that distinguishes the competing claims. The reviewer or critic may perform checks allowed by its effective permissions that leave the reviewed artifact unchanged, writing only in a disposable copy outside the reviewed checkout. When a subagent cannot create that copy or its permissions block the check, you may run the agreed check without modifying the reviewed artifact, relay the exact command and result to both subagents via `send_message`, and let them interpret it. A check that cannot execute or does not test the disputed condition leaves a coverage gap; a valid passing or failing result is evidence to interpret. Do not repeat broad validation merely to prolong the exchange.

## Continue only while the exchange adds evidence

Allow at most **three critic passes per frozen artifact version by default**, each followed by a reviewer response when one is needed. A pass is one completed critic audit; the initial reviewer assessment does not count as a critic pass. This is a practical initial bound, not a measured optimum. Honor an explicit user-requested review budget or deeper exchange.

Continue to another critic pass only when a material claim remains unresolved and the reviewer response adds evidence, changes the claim, or identifies a concrete feasible check likely to change its disposition. Retain the same critic `conversationId` within the version and relay the complete transcript via `send_message`. Explain the outstanding evidence question in the user-facing progress update without adding argumentative framing to the handoff.

Stop earlier when all current findings are reconciled and no material question remains, or when further exchange would repeat positions without new evidence or a feasible discriminating check. After the third critic pass, allow its necessary reviewer response and then report remaining disagreement or unaudited claims as unresolved. Do not silently reset the count by launching a new subagent, relaunch solely because of elapsed time, require a code change merely because disagreement occurred, or pressure subagents into consensus.

## Return an auditable result

Classify each finding using its latest claim and evidence for this artifact version:

- `confirmed`: the critic agrees with the current reviewer claim and the reviewer retains it, or the reviewer accepts a grounded critic `missed_finding`.
- `disputed`: disagreement remains, or a new or changed claim has not received its required audit before the exchange ends. Distinguish these cases and preserve the evidence status; unsupported claims remain unverified and non-blocking.
- `rejected`: the reviewer retracts the finding, or specific refuting evidence resolves it. Retain the retraction or refutation; contradictory unresolved interpretations remain disputed.
- `out_of_scope`: the concern may be valid, but a cited clause of the frozen scope or assumptions excludes it from this change.

Return the ship/no-ship recommendation, overall risk, confidence, and reviewed coverage. For each material finding retain its stable ID, origin and original claim, critic disposition and evidence, reviewer response when needed, final classification and rationale, validation status, and its risk rubric scores and action. Where the critic's evidence lowers a score, use the lower score and say why. Include context gaps, unresolved evidence questions, and ordered next actions within the approved scope. A thorough exchange may still have a concise final report; keep the complete transcript available for audit.

Apply the entry point's blocking standard. Agreement is not proof, and a disputed finding is not automatically false or blocking. State whether the independent evidence supports action rather than concealing uncertainty behind the classification.

After authorized fixes, identify the new artifact version, update its packet, and preserve finding IDs. Continue the same reviewer `conversationId` via `send_message` to verify the repairs, and start a fresh critic via `invoke_subagent` for the new version, when any of these holds:

- a repaired finding's action was `block` or `raise`;
- a repair changes behavior on a path the packet names as a risk;
- the new version carries changes the exchange never examined, such as fixes for feedback that arrived from elsewhere during the freeze.

Otherwise the repairs may rest on their own tests. Start a completely fresh reviewer only when the user requests an independent second adversarial look.
