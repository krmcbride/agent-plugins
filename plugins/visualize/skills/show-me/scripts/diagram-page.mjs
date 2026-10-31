#!/usr/bin/env node
// Writes one HTML page that renders Mermaid files with Pele in the browser.
// Usage: diagram-page.mjs [--theme blueprint|light] [--title TEXT] [--legend CLASS=LABEL]... [--out FILE] DIAGRAM.mmd...

import { mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

// Pinned with the hash of the npm tarball's file, so the browser refuses anything else.
const PELE_URL = "https://cdn.jsdelivr.net/npm/pele@1.9.0/dist/pele.global.js";
const PELE_SRI = "sha384-X+e8pdeUnf8YjA86gePdVkvjA3DE2FJz6jza8dWzZAmldP8OCUkDrdqLM96/YK1D";

const themesDir = join(dirname(fileURLToPath(import.meta.url)), "..", "themes");
const themes = readdirSync(themesDir).filter((f) => f.endsWith(".css") && f !== "base.css").map((f) => f.slice(0, -4));
const classes = ["blue", "teal", "purple", "yellow", "orange", "tan", "pink", "breaks", "mayBreak", "bugPath", "repeats"];

function fail(message) {
  console.error(`diagram-page: ${message}`);
  process.exit(2);
}

let parsed;
try {
  parsed = parseArgs({
    allowPositionals: true,
    options: {
      theme: { type: "string", default: "blueprint" },
      title: { type: "string" },
      legend: { type: "string", multiple: true, default: [] },
      out: { type: "string" },
      help: { type: "boolean", short: "h" },
    },
  });
} catch (error) {
  fail(error.message);
}
const { values: opts, positionals: files } = parsed;

if (opts.help || files.length === 0) {
  console.log(`Usage: diagram-page.mjs [--theme ${themes.join("|")}] [--title TEXT] [--legend CLASS=LABEL]... [--out FILE] DIAGRAM.mmd...`);
  console.log(`Legend classes: ${classes.join(", ")}`);
  process.exit(opts.help ? 0 : 2);
}
if (!themes.includes(opts.theme)) fail(`unknown theme "${opts.theme}"; use one of ${themes.join(", ")}`);

const legend = opts.legend.map((entry) => {
  const at = entry.indexOf("=");
  const cls = entry.slice(0, at);
  if (at < 1 || !classes.includes(cls)) fail(`--legend "${entry}" must be CLASS=LABEL with CLASS one of ${classes.join(", ")}`);
  return { cls, label: entry.slice(at + 1) };
});

const diagrams = files.map((file) => {
  try {
    return readFileSync(file, "utf8").trim();
  } catch (error) {
    fail(`cannot read ${file}: ${error.message}`);
  }
});

const escape = (text) =>
  text.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

const title = opts.title ?? basename(files[0]).replace(/\.[^.]+$/, "");
const css = [readFileSync(join(themesDir, "base.css"), "utf8"), readFileSync(join(themesDir, `${opts.theme}.css`), "utf8")].join("\n");
const legendHtml = legend.length
  ? `<ul class="legend">${legend.map(({ cls, label }) => `<li class="${cls}"><span class="swatch"></span>${escape(label)}</li>`).join("")}</ul>`
  : "";
const figures = diagrams.map((source) => `<figure><div class="diagram"></div><pre class="source">${escape(source)}</pre></figure>`).join("\n");

const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escape(title)}</title>
<style>
${css}
</style>
</head>
<body>
<header><h1>${escape(title)}</h1>${legendHtml}</header>
<main>
${figures}
</main>
<script src="${PELE_URL}" integrity="${PELE_SRI}" crossorigin="anonymous"></script>
<script>
(() => {
  const bad = ".pele-node.breaks, .pele-node.mayBreak";
  const near = (a, b) => a.left <= b.right + 4 && b.left <= a.right + 4 && a.top <= b.bottom + 4 && b.top <= a.bottom + 4;
  // Draws each arrow whose head touches a bad state in the bad colour, label included.
  function markBadEdges(figure) {
    const svg = figure.querySelector("svg");
    if (!svg) return;
    const targets = [...svg.querySelectorAll(bad)].map((node) => node.getBoundingClientRect());
    for (const edge of svg.querySelectorAll(".pele-edge")) {
      const head = edge.querySelector(".pele-marker");
      const hit = head && targets.some((box) => near(head.getBoundingClientRect(), box));
      edge.classList.toggle("badEdge", hit);
      for (const label of svg.querySelectorAll(".pele-edge-label")) {
        if (label.dataset.id === edge.dataset.id) label.classList.toggle("badEdge", hit);
      }
    }
  }
  for (const figure of document.querySelectorAll("figure")) {
    if (!window.pele) {
      const note = document.createElement("p");
      note.className = "error";
      note.textContent = "Pele did not load from ${PELE_URL}, so this shows the Mermaid source.";
      figure.prepend(note);
      continue;
    }
    const source = figure.querySelector("pre.source").textContent;
    figure.classList.add("rendered");
    window.pele.mount(figure.querySelector(".diagram"), source, {
      limit: 1000000,
      outputLimit: 8000000,
      maxEdges: 10000,
      onRender: () => requestAnimationFrame(() => markBadEdges(figure)),
      // Pele prints the error in place of the diagram; the source shows below it.
      onError: () => figure.classList.remove("rendered"),
    });
  }
})();
</script>
</body>
</html>
`;

const out = opts.out ? resolve(opts.out) : join(mkdtempSync(join(tmpdir(), "show-me-")), "diagram.html");
writeFileSync(out, page);
console.log(out);
