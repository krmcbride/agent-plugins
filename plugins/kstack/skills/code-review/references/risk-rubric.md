# Risk Rubric

Include this rubric verbatim in every reviewer and verifier assignment. Score each finding on every axis from the evidence in hand, and give the reason for each score in a few words. Severity alone hides why a finding matters; these axes say who meets the failure, how often, and what it costs.

| Axis | Values, most to least serious |
| --- | --- |
| Impact | `critical`: security or permission breach, data loss or corruption, outage, or money moved wrongly. `major`: wrong behavior on a user-visible path or a documented contract. `minor`: degraded or confusing behavior with an easy workaround. `nit`: no behavioral effect. |
| Exposure | `always`: every run of the changed path. `common`: a normal input or state on a path users take. `specific`: a particular input, state, or sequence that is legitimate but uncommon. `rare`: an unusual configuration, a narrow race, or a deployment condition the scope does not assume. |
| Provenance | `introduced`: the change creates it. `worsened`: it existed and the change makes it more likely or more harmful. `pre-existing`: it exists unchanged at the base revision. |
| Detection | `caught`: existing tests, types, or CI would fail. `visible`: it surfaces quickly as an error, alert, or obvious symptom. `silent`: wrong results that nothing reports. |
| Recovery | `easy`: retry, revert, or redeploy restores everything. `repair`: needs a fix plus cleanup of data or state. `irreversible`: lost data, a leaked secret, or an external effect that cannot be undone. |

Score exposure from the code paths and the stated deployment assumptions, not from how alarming the failure sounds. An impact that holds only under `rare` exposure is still that impact; the action, not the impact, reflects how unlikely it is.

## Action

Map the scores and the finding's verification status to one action:

- `block`: impact `critical` or `major`, provenance `introduced` or `worsened`, exposure other than `rare`, and the failure is reproduced or demonstrated by a step-by-step trace. This is the shared blocking rule in operational form.
- `raise`: verified and material but short of `block`, such as a `major` impact under `rare` exposure, or a `minor` impact that is `common` and `silent`.
- `ask`: plausible and material, but unverified or disputed. Phrase it as a question that names the observation that would settle it.
- `mention`: a verified `minor` or `nit` finding, or a `pre-existing` risk directly relevant to the change. Optional to raise.
- `drop`: refuted, out of scope, or a `nit` the user did not ask for.

`silent` detection or `irreversible` recovery can lift a finding one action: `mention` to `raise`, or `raise` to `block` for a verified, `introduced` or `worsened` finding whose only shortfall is `rare` exposure. State the reason when you apply it.
