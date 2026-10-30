# show-me

Explains the current topic visually: pseudocode, call and component trees, file trees, tables, diffs of an existing
shape, small Mermaid diagrams, and, when text cannot carry it, one focused throwaway HTML page.

## Contents

| Skill | What it does |
| --- | --- |
| `show-me:show-me` | Picks the smallest view that makes the point and places it next to the text it supports |

Claude invokes the skill when the user says "show me" to understand or compare something, or asks for a diagram,
tree, sketch, or mockup. It does not trigger when "show me" only means open, list, or retrieve something.

## Differences from upstream

Adapted from HumanLayer's [show-me](https://github.com/humanlayer/skills/tree/main/plugins/show-me) at upstream commit
`bba9d13`. Little of the upstream text survives unchanged, so this plugin is written here rather than built from
`vendor/`.

- Claude can invoke it from its description; upstream sets `disable-model-invocation`.
- Views are grouped into text views, changes to an existing shape, Mermaid, and an HTML page, and a Markdown table
  view is added.
- An HTML page is written to a scratch directory, follows the `dataviz` skill for charts, works in light and dark, and
  is checked visually when it can be rendered.
- Visuals stay in the conversation: polishing a page is no reason to keep it, and saving one is no permission to
  commit or publish it.

## Install

```
/plugin install show-me@krmcbride
```

## License

MIT. Adapts work by HumanLayer from [humanlayer/skills](https://github.com/humanlayer/skills); see [LICENSE](LICENSE).
