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

Every skill can be invoked by Claude from its description. The principles skill lists every principle in one short
index and loads a reference only when it applies, so the 21 principles cost one entry in the skill list.

## Differences from pstack

- No `poteto-mode` router, playbook todo lists, or required reply format.
- No principles for guarding the context window, never blocking on the human, or experience-first product taste.
  The first is the harness's job; the other two are product and collaboration preferences rather than engineering
  method.
- Playbooks keep their method and drop delegation steps, model tiers, throughput checkpoints, and links to pstack
  skills that kstack does not include.
- The `tdd` skill and the runtime and trace forensics playbooks are folded into `debugging`; `benchmark-checklist`
  and the hillclimb playbook are folded into `performance`.

kstack is written here, not generated from `vendor/`. It was adapted from pstack at upstream commit
`d457567332aa6989e753ea289f30ea2bfbc80bc0` (version 0.15.28). To find upstream changes worth porting, diff the
matching principle or playbook files in `vendor/pstack/upstream/skills/` from that commit to the current pin.

## Install

```
/plugin install kstack@krmcbride
```

## License

MIT. kstack adapts work by Lauren Tan ([@poteto](https://github.com/poteto)) from
[cursor/plugins](https://github.com/cursor/plugins/tree/main/pstack); see [LICENSE](LICENSE).
