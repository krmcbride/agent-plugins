# visualize

Skills that need a human viewer. They close the gap between what an agent understands and what a person can check
quickly, with diagrams and HTML pages instead of paragraphs.

## Contents

| Skill | What it does |
| --- | --- |
| `visualize:show-me` | Picks the smallest view that makes the point and places it next to the text it supports |

`show-me` explains the current topic visually: pseudocode, call and component trees, file trees, tables, diffs of an
existing shape, Mermaid diagrams, and, when those cannot carry it, one focused throwaway HTML page. Claude invokes it
when the user says "show me" to understand or compare something, or asks for a diagram, tree, sketch, or mockup. It
does not trigger when "show me" only means open, list, or retrieve something.

## Diagrams

Claude Code's desktop app and terminals show Mermaid only as source, so `show-me` renders diagrams with
[Pele](https://pele.run). `skills/show-me/scripts/diagram-page.mjs` needs only Node. It writes one HTML page with a fixed
layout and theme, embeds the Mermaid source, and loads Pele 1.9.0 from jsDelivr, pinned by its SRI hash, to render it
in the browser. Opened offline, the page shows the source instead.

There are two themes in `skills/show-me/themes/`: `blueprint`, a navy drafting grid with monospace type, and `light`.
Each colours states by phase and marks bad states, the states on the path into them, and the arrows into them.
[`references/themes.md`](skills/show-me/references/themes.md) lists the classes. They match the classes of pstack's
`statechart` command, so its charts render unchanged.

## Differences from upstream

`show-me` is adapted from HumanLayer's [show-me](https://github.com/humanlayer/skills/tree/main/plugins/show-me) at
upstream commit `bba9d13`. Little of the upstream text survives unchanged, so this plugin is written here rather than
built from `vendor/`.

- Claude can invoke it from its description; upstream sets `disable-model-invocation`.
- Views are grouped into text views, changes to an existing shape, diagrams, and an HTML page, and a Markdown table
  view is added.
- Mermaid diagrams are rendered to a themed page with Pele instead of shown as source, with guidance on choosing the
  diagram type and labeling it for the reader.
- An HTML page is written to a scratch directory, follows the `dataviz` skill for charts, works in light and dark, and
  is checked visually when it can be rendered.
- Visuals stay in the conversation: polishing a page is no reason to keep it, and saving one is no permission to
  commit or publish it.

## Install

```
/plugin install visualize@krmcbride
```

## License

MIT. `show-me` adapts work by HumanLayer from [humanlayer/skills](https://github.com/humanlayer/skills); see
[LICENSE](LICENSE). Pele is MIT-licensed by kepano and is loaded from a CDN, not copied here.
