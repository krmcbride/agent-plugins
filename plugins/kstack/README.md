# kstack

Engineering principles and task playbooks for Claude Code. kstack keeps the engineering method from Lauren Tan's
[pstack](../pstack) and leaves out its orchestration layer: the router skill, model and effort routing, subagent
rules, PR babysitting and landing programs, reply-style rules, and the scripts behind them. Claude Code decides how to
use its own harness.

## Contents

| Skill | What it does |
| --- | --- |
| `kstack:engineering-principles` | An index of 21 principles, each named by the situation it applies to, with one reference file per principle |
| `kstack:debugging` | Reproduce, root-cause, fix, and verify a defect, or diagnose a runtime symptom or captured profile |
| `kstack:performance` | Baseline, find the limiter, and keep or revert each change; includes a sustained improvement loop and a benchmark checklist |
| `kstack:refactoring` | Pin behavior, subtract, reshape in small passing steps, and prove the behavior unchanged |
| `kstack:prototyping` | Settle a design or behavioral question with a throwaway sketch instead of asking |
| `kstack:implementation-workflow` | Plan substantial work with the user as an outcome-level contract, execute it through the harness, and verify the result |
| `kstack:decision-interview` | Separate discoverable facts from user-owned decisions and settle the decisions one question at a time |

Every skill can be invoked by Claude from its description. The principles skill lists every principle in one short
index and loads a reference only when it applies, so the 21 principles cost one entry in the skill list. To make sure
the principles shape a piece of work, start the message with `/kstack:engineering-principles`. Claude then reads the
references that apply before starting and names the principles that changed its decisions.

`implementation-workflow` says what it needs, small modules and a final review against the contract, without naming
the skills that supply it. With the [review](../review) plugin installed, its `code-review` and `code-shape` skills
trigger from their own descriptions.

## Differences from pstack

- No `poteto-mode` router, playbook todo lists, or required reply format.
- No principles for guarding the context window, never blocking on the human, or experience-first product taste.
  The first is the harness's job; the other two are product and collaboration preferences rather than engineering
  method.
- Playbooks keep their method and drop delegation steps, model tiers, throughput checkpoints, and links to pstack
  skills that kstack does not include.
- The `tdd` skill and the runtime and trace forensics playbooks are folded into `debugging`; `benchmark-checklist`
  and the hillclimb playbook are folded into `performance`.

`implementation-workflow` and `decision-interview` are not from pstack. They take the place of pstack's
`figure-it-out` and multi-phase plan playbooks: the user owns consequential decisions and checks an outcome-level
contract, and no tracker or decision log runs beside the harness.

kstack is written here, not generated from `vendor/`. The pstack-derived skills were adapted from pstack at upstream commit
`4dd1d05818d19792e7cd6e818f1667f95f7e1dbe` (version 0.15.36). To find upstream changes worth porting, diff the
matching principle or playbook files in `vendor/pstack/upstream/skills/` from that commit to the current pin.

## Install

```
/plugin install kstack@krmcbride
```

## License

MIT. kstack adapts work by Lauren Tan ([@poteto](https://github.com/poteto)) from
[cursor/plugins](https://github.com/cursor/plugins/tree/main/pstack); see [LICENSE](LICENSE).
