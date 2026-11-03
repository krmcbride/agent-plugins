# Diagram themes

`scripts/diagram-page.mjs` builds a page from `themes/base.css` and one theme file. A theme file sets only CSS
variables: the page's colours and fonts, Pele's `--pele-*` variables, and a fill and stroke for each class below.

## Pick a theme

- `blueprint`, the default: a navy drafting grid with monospace type and light lines. Use it for state machines,
  build and request flows, and other engineering diagrams.
- `light`: a plain white page with system sans type. Use it when the page will be printed, pasted into a document, or
  read next to a light product UI, or when the user asks for light.

## Colour by phase

Give each phase of the diagram one colour, in the order the reader meets them, and name the phases with `--legend`.
Two to four phases are usually enough. Leave a state uncoloured when it belongs to no phase.

| Class | Use it for |
| --- | --- |
| `blue` | the first phase, such as setting up or picking |
| `teal` | the main work, such as sending or running |
| `purple` | a second kind of work, such as reviewing or building |
| `yellow` | done or shipped |
| `orange`, `tan`, `pink` | further phases |

In a flowchart, state, or ER diagram, add a class with `class A,B teal` or `A:::teal`. Do not add `classDef` lines for
these classes: the theme colours them. A sequence diagram takes no classes; show a bad path there with a `break` block
or a `Note`.

## Mark what goes wrong

| Class | Marks |
| --- | --- |
| `breaks` | a bad state: data lost, a rule broken, a user stuck |
| `mayBreak` | a state that is bad only on some paths into it |
| `bugPath` | a state on the path into a bad state; it keeps its phase fill and gets the bad colour's border |
| `repeats` | a state a bad path can loop through forever; dashed border |

The page draws each arrow into a `breaks` or `mayBreak` state, and its label, in the bad colour, so mark the states and
the arrows follow. To colour another flowchart arrow, use `linkStyle N stroke:#e72e3b`, where `N` counts arrows in the
order they appear, from 0.

Marks go after phases in the CSS, so a mark shows over a phase colour. They also beat a `classDef` for the same class,
so a chart from pstack's `statechart` command, which writes `classDef breaks` and `classDef mayBreak` lines and uses
the same class names, renders unchanged.

## Change a theme

Edit the variables in `themes/<name>.css`, or copy one to add a theme; the script lists every `.css` file in `themes/`
except `base.css`. Keep `--pele-bg` equal to `--page-bg`: Pele fills edge label boxes with it, and a transparent or
different colour lets lines show through labels or leaves boxes around them. Keep monospace fonts in a monospace
theme; Pele measures text with the page's fonts, so labels fit whichever font the theme names.
