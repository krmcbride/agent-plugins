# Adversarial Review

## Freeze the packet and isolate the roles

Build the entry point's packet and add the specific assumptions, failure paths, or decisions to challenge. Freeze the requirements, scope, assumptions, and artifact for the exchange. Start a fresh reviewer and a separate fresh critic without inherited primary conversation history. Preserve their handles: continue both within this artifact version, retain the reviewer across repairs, and start a fresh critic for each new artifact version.

Give each agent the same packet and the applicable assignment below, including the selected reviewer depth, finding dispositions, response requirements, and the stopping contract.

## Relay the complete exchange

Keep an append-only transcript of the packet, every complete reviewer and critic response, and subsequent evidence or clarifications, identified by role, artifact version, and pass. Inline the exact text or supply accessible transcript files; every recipient must receive or read the complete exchange for this artifact version before responding. Retain original claims and corrections instead of overwriting earlier messages.

Schedule passes and forward participants' complete outputs unaltered, preserving their reviewer or critic attribution. Do not summarize or selectively quote their arguments, add rebuttals, suggest dispositions, or steer either agent toward your preferred implementation. Progress summaries for the user are separate from the authoritative handoff and must not substitute for it. Wait for complete outputs before advancing; interim findings are visibility, not a finished pass.

Relay material context questions and factual answers to both agents. Identify the source of clarifications, and append raw validation commands and results as new evidence without rewriting the original packet. If a clarification changes requirements, scope, assumptions, or the artifact, end the current exchange as incomplete and issue a new frozen packet; do not treat conclusions from different versions as agreement.

You may resolve access or execution problems and perform an agreed targeted check within existing authority. Do not adjudicate the argument while relaying it. Assess the result only after the exchange ends, preserving dissent and the evidence behind each classification.

## Initial reviewer assignment

Ask the reviewer to find the strongest material reasons the change should not ship yet:

- Verify the implementation and validation claims against the frozen artifacts.
- Challenge consequential assumptions, realistic failure paths, and violated invariants rather than preferences or speculative requirements.
- Inspect the full declared diff at the selected depth and trace surrounding behavior where needed to assess the selected risks, reporting any remaining coverage gaps.
- Ground each finding in code or tool evidence, identify inference and uncertainty, and separate introduced defects, directly relevant pre-existing risks, out-of-scope concerns, and missing evidence.
- Assign stable IDs such as `R1` and `R2`. Preserve each original claim and its provenance when revising or retracting it.

A clean initial review still goes to the critic to check for missed findings. It does not trigger a code edit.

## Critic assignment

Give the critic the identical packet, complete reviewer output, and exchange history. Audit the review against the artifact; do not optimize for agreement or rewrite the implementation.

Assess every current reviewer finding by stable ID using exactly one disposition:

- `agree`: the finding is material and supported by cited frozen evidence.
- `disagree_evidence`: specific code or tool evidence contradicts the finding.
- `disagree_concern`: an unsupported inference, unrealistic assumption, scope expansion, or missing evidence prevents acceptance.

Retain the rationale and supporting or contradicting evidence for every disposition. Identify pre-existing and out-of-scope concerns explicitly. Add `missed_finding` entries only when independently grounded in the frozen artifact, using stable IDs such as `C1` and `C2`.

On later passes, reconcile the reviewer's responses and new evidence with earlier dispositions. Report what changed, which claims remain unresolved, and the specific evidence question another response could settle. An agreeing critic with no missed finding or unresolved material question can end the exchange without a ceremonial reviewer reply.

## Reviewer response and targeted verification

When the critic disagrees, adds a missed finding, or raises a material evidence question, continue the original reviewer with the complete critique and exchange history. Require a response for every affected ID while retaining the status of unaffected findings.

For `disagree_evidence`, address the cited counterevidence: revise or retract when it refutes the claim, or supply specific evidence explaining why it does not. For `disagree_concern`, identify what observation would confirm or refute the concern and obtain it when feasible. Unsupported claims that cannot be substantiated remain unverified and non-blocking. Assess every `missed_finding` under the same evidence standard, and preserve retractions and their reasons.

Turn an important unresolved dispute into a concrete verification question. Use a targeted test, reproduction, or rigorous static trace that distinguishes the competing claims. The reviewer or critic may perform checks allowed by its effective permissions that leave the reviewed artifact unchanged. When a check needs writable scratch space, you may run the agreed check without modifying the reviewed artifact, relay the exact command and result to both agents, and let them interpret it. A check that cannot execute or does not test the disputed condition leaves a coverage gap; a valid passing or failing result is evidence to interpret. Do not repeat broad validation merely to prolong the exchange.

## Continue only while the exchange adds evidence

Allow at most **three critic passes per frozen artifact version by default**, each followed by a reviewer response when one is needed. A pass is one completed critic audit; the initial reviewer assessment does not count as a critic pass. This is a practical initial bound, not a measured optimum. Honor an explicit user-requested review budget or deeper exchange.

Continue to another critic pass only when a material claim remains unresolved and the reviewer response adds evidence, changes the claim, or identifies a concrete feasible check likely to change its disposition. Retain the same critic within the version and relay the complete transcript. Explain the outstanding evidence question in the user-facing progress update without adding argumentative framing to the handoff.

Stop earlier when all current findings are reconciled and no material question remains, or when further exchange would repeat positions without new evidence or a feasible discriminating check. After the third critic pass, allow its necessary reviewer response and then report remaining disagreement or unaudited claims as unresolved. Do not silently reset the count by restarting an agent, relaunch solely because of elapsed time, require a code change merely because disagreement occurred, or pressure agents into consensus.

## Return an auditable result

Classify each finding using its latest claim and evidence for this artifact version:

- `confirmed`: the critic agrees with the current reviewer claim and the reviewer retains it, or the reviewer accepts a grounded critic `missed_finding`.
- `disputed`: disagreement remains, or a new or changed claim has not received its required audit before the exchange ends. Distinguish these cases and preserve the evidence status; unsupported claims remain unverified and non-blocking.
- `rejected`: the reviewer retracts the finding, or specific refuting evidence resolves it. Retain the retraction or refutation; contradictory unresolved interpretations remain disputed.
- `out_of_scope`: the concern may be valid, but a cited clause of the frozen scope or assumptions excludes it from this change.

Return the ship/no-ship recommendation, overall risk, confidence, and reviewed coverage. For each material finding retain its stable ID, origin and original claim, critic disposition and evidence, reviewer response when needed, final classification and rationale, and validation status. Include context gaps, unresolved evidence questions, and ordered next actions within the approved scope. A thorough exchange may still have a concise final report; keep the complete transcript available for audit.

Apply the entry point's blocking standard. Agreement is not proof, and a disputed finding is not automatically false or blocking. State whether the independent evidence supports action rather than concealing uncertainty behind the classification.

After authorized fixes, identify the new artifact version, update its packet, preserve finding IDs, and continue the same reviewer to verify the repairs. Start a fresh critic for the new version. Start a completely fresh reviewer only when the user requests an independent second adversarial look.
