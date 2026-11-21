---
name: show-me
description: >-
  Explain the current topic with a quick visual in the conversation: pseudocode,
  a call, component, or file tree, a table, a diff of a shape, or a state,
  sequence, flow, or ER diagram.
disable-model-invocation: true
---

# Show Me

The user invoked `/show-me` to understand the current topic visually, in the conversation. Skip the preamble and keep prose brief. Pick the smallest view that makes the key point clear, and place each view next to the short text it supports. Prefer text views; draw a diagram only when text cannot carry the point.

## Text views

These render in any client.

- Show logic or an algorithm as pseudocode:

```text
on(save)
  if content is unchanged
    return cached result
  write new content
  return fresh result
```

- Show runtime control flow as a call tree:

```text
submitForm
  createSession
    persistPrompt
    launchAgent
  navigateToSession
```

- Show UI structure as a component tree, including the state and module boundaries that matter:

```tsx
<SessionPage> (apps/example/src/routes/session.tsx)
  useSessionEvents()
  <SessionToolbar>
    <RunSkillButton> (packages/ui)
```

- Show file responsibility or a broad refactor as a shallow file tree:

```text
src/
├── commands/       # parses user actions
├── sessions/       # owns session state
└── transport/      # sends API requests
```

- Show a compact comparison as a Markdown table.

## Changes to an existing shape

Use `diff` when the point is what changes and the surrounding shape already exists. Diff the same shape the topic uses: a component tree, file tree, call tree, or control flow.

```diff
 submitForm
   createSession
     persistPrompt
+    expandSkillMention
     launchAgent
-  navigateToSession
+  navigateToSession
+    subscribeToEvents
```

```diff
 src/
 ├── commands/
+│   └── show-me.ts       # expands the slash command
 ├── sessions/
-└── transport.ts
+└── transport/
+    ├── client.ts
+    └── stream.ts
```

Show the whole block instead when most of it is new, when omitted context would hide ownership or order, or when the user needs a copyable target shape.

## Diagrams

Use a diagram when labeled nodes and edges explain behavior better than an indented tree. Pick the type by the question:

- A lifecycle, or how something moves between states: `stateDiagram-v2`.
- Messages between several participants over time: `sequenceDiagram`.
- A decision or a branching procedure: `flowchart TD` or `flowchart LR`.
- Data and how its records relate: `erDiagram`.

Label it for the reader:

- Name each state or node in the reader's words, such as "Uploading" or "Waiting for review", not the variable or function behind it. Quote labels containing parentheses or brackets (for example, `id["Label (Extra Info)"]`) and avoid HTML tags in labels.
- Label each arrow with what happens, such as "you press upload" or "the connection drops".
- End a label with its condition in brackets: `the tab closes [before the retry]`. In a sequence diagram's `loop`, `alt`, or `opt`, write the condition bare when rendering with Pele, because Pele brackets it.
- Keep to about 20 arrows. Merge states that act the same and leave out steps the reader does not need, but keep every state on a path to a bad state.
- Colour states by phase, and mark bad states and the states on the path into them, with the classes in [references/themes.md](references/themes.md) when rendering with Pele.

Choose the rendering path that fits the active Antigravity surface:

1. **Inline HTML renderer available (`html_preview` + `html_render`, as in T3 Code):** render a self-contained SVG/HTML diagram or chart directly in the thread — preview first with `html_preview`, inspect the rendered PNG and `contentHeight`, fix any overlap or clipping, then display with `html_render`.
2. **Mermaid-capable surface (Antigravity App / IDE artifacts or Markdown UI):** emit a fenced `mermaid` code block using supported types (`flowchart`, `sequenceDiagram`, `stateDiagram-v2`, `classDiagram`, `erDiagram`, `xychart-beta`).
3. **Terminal-only surface (`agy` CLI) with no inline renderer:** render the Mermaid with Pele using [scripts/diagram-page.mjs](scripts/diagram-page.mjs) beside this `SKILL.md`. Write each diagram to a `.mmd` file in a new `mktemp -d` scratch directory, then build one HTML page:

```sh
node <this-skill-dir>/scripts/diagram-page.mjs --theme blueprint --title "How an upload finishes" \
  --legend teal=Sending --legend breaks="File lost" --out "$dir/upload.html" "$dir/upload.mmd"
```

`--theme` is `blueprint` or `light`, `--legend` names a class for the reader and can repeat, and each further `.mmd` file adds a diagram below the last. Without `--out`, the script makes its own scratch directory and prints the page's path.

The page loads Pele 1.9.0 from jsDelivr, pinned by hash, so it needs the network; offline, it shows the Mermaid source. Where Mermaid has a syntax error, Pele shows the error in place of the diagram, so fix the `.mmd` file and build again. Open the page as described below, and paste Mermaid source into the conversation only when the user asks for it or no page can be shown.

## HTML page

Only when the user asks for a page, mockup, chart, or visual artifact, write one focused, self-contained HTML file: a UI layout, state comparison, chart, infographic, or short slide deck, whichever fits the point.

- Match the product's colors, type, spacing, and components when depicting a product. When rendering inline with `html_render`, use the host's theme CSS variables (`--foreground`, `--muted`, `--card`, `--border`, `--accent`, `--chart-1`..`--chart-6`, `--radius`, `--font-sans`, `--font-mono`), leave `html`/`body` transparent without an outer frame, use fluid widths, and avoid `vh` or `height: 100%` on `html`/`body`. Otherwise use a restrained neutral style that works in light and dark.
- Use real labels, units, and data, and support narrow and wide widths.
- Inline CSS and JavaScript. Load libraries from a version-pinned CDN only when they materially help.
- Write standalone files to a new `mktemp -d` or conversation `scratch/` directory unless the user asks to keep them in the target project.

## Show the page

- **When `html_preview` and `html_render` are available:** verify the visual with `html_preview`, fix any overlap, clipping, or overflow, and display it inline with `html_render` (never start a local server just to show it).
- **Otherwise:** open the generated HTML file with the platform opener (`open` on macOS, `xdg-open` on Linux) and always give the user its file path too.

## Guidance

Keep only the calls, files, props, states, and boundaries needed to answer the user's current question or resolve the current discussion point. Combine views only when each answers a distinct part of the question; you will rarely need more than two.

Keep the result in the conversation by default. Do not persist a visual merely because it is polished, and do not treat a request to save a page locally as permission to commit or publish it.

A requested website, component, or application change belongs in the target project with its normal workflow, not in a `show-me` page.
