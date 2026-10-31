---
name: show-me
description: >-
  Use when the user says "show me" to understand or compare something visually, or asks for a code-shape sketch, call or component tree, state, sequence, flow, or ER diagram, architecture map, UI mockup, or visual explanation of the current topic. Do not use when "show me" merely means open, retrieve, list, or inspect an item.
---

# Show Me

Help the user understand the current topic visually. Skip the preamble and keep prose brief. Pick the smallest view that makes the key point clear, and place each view next to the short text it supports.

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
- A decision or a branching procedure: `flowchart`.
- Data and how its records relate: `erDiagram`.

Label it for the reader:

- Name each state or node in the reader's words, such as "Uploading" or "Waiting for review", not the variable or function behind it.
- Label each arrow with what happens, such as "you press upload" or "the connection drops".
- End a label with its condition in brackets: `the tab closes [before the retry]`. In a sequence diagram's `loop`, `alt`, or `opt`, write the condition bare, because Pele brackets it.
- Keep to about 20 arrows. Merge states that act the same and leave out steps the reader does not need, but keep every state on a path to a bad state.
- Colour states by phase, and mark bad states and the states on the path into them, with the classes in [references/themes.md](references/themes.md).

Claude Code's desktop app and terminals show Mermaid only as source, so render it with Pele. Write each diagram to a `.mmd` file in a new `mktemp -d` scratch directory, then build one page for them:

```sh
node ${CLAUDE_SKILL_DIR}/scripts/diagram-page.mjs --theme blueprint --title "How an upload finishes" \
  --legend teal=Sending --legend breaks="File lost" --out "$dir/upload.html" "$dir/upload.mmd"
```

`--theme` is `blueprint` or `light`, `--legend` names a class for the reader and can repeat, and each further `.mmd` file adds a diagram below the last. Without `--out`, the script makes its own scratch directory. It prints the page's path.

The page loads Pele 1.9.0 from jsDelivr, pinned by hash, so it needs the network; offline, it shows the Mermaid source. Where Mermaid has a syntax error, Pele shows the error in place of the diagram, so fix the `.mmd` file and build again. Show the page as described below, and paste Mermaid source into the conversation only when the user asks for it or no page can be shown.

## HTML page

For a UI layout, mockup, state comparison, or concept too dense for text or a diagram, write one focused, self-contained HTML file: a diagram, an infographic, or a short slide deck, whichever fits the point.

- Match the product's colors, type, spacing, and components when depicting a product; otherwise use a restrained neutral style that works in light and dark. Use real labels and data, and support narrow and wide widths.
- For charts, follow the `dataviz` skill.
- Inline CSS and JavaScript. Load libraries from a version-pinned CDN only when they materially help.
- Write it to a new `mktemp -d` scratch directory unless the user asks to keep it, in which case follow the target project's conventions.

## Show the page

Show a diagram page or HTML page where the client renders it, and always give the user its path too.

- In Claude Code's desktop app, send it with `SendUserFile` and `display: "render"`, or open it in the browser pane.
- Elsewhere, open it with the platform opener: `open` on macOS, `xdg-open` on Linux.

When you can render or screenshot the page, look at it before replying and fix overlap, clipping, and overflow. The desktop browser pane shows a local file outside the project as a static snapshot that its tools cannot read, so to look at one there, serve its directory in the background with `python3 -m http.server --bind 127.0.0.1`, open the `http://127.0.0.1` address, and stop the server when you are done.

## Guidance

Keep only the calls, files, props, states, and boundaries needed to answer the user's current question or resolve the current discussion point. Combine views only when each answers a distinct part of the question; you will rarely need more than two.

Keep the result in the conversation by default. Do not persist a visual merely because it is polished, and do not treat a request to save a page locally as permission to commit or publish it.

A requested website, component, or application change belongs in the target project with its normal workflow, not in a `show-me` page.
