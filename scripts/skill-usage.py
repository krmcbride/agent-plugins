#!/usr/bin/env python3
"""Count which skills Claude Code sessions loaded, from the transcripts on disk.

Reads the session transcripts under ~/.claude/projects and reports, per skill:
how often the model loaded it with the Skill tool, how often the user ran it as
a slash command, how many of its reference files were read (with the Read tool or
named in a shell command), and in how many
sessions any of that happened.

Skills preloaded into a subagent by its definition never appear as a Skill tool
call, so they are not counted.

    python3 scripts/skill-usage.py                 # the last 14 days
    python3 scripts/skill-usage.py --days 30 --match kstack
    python3 scripts/skill-usage.py --references    # also list reference files read
"""

import argparse
import json
import re
import time
from collections import Counter, defaultdict
from pathlib import Path

READERS = {"Read", "Bash"}
COMMAND = re.compile(r"<command-name>/([\w:.-]+)</command-name>")
# Only installed skills count: a plugin cache, a user or project skills folder,
# or the shared agent pool. A path in a checkout where skills are being edited
# is development work, not a session using the skill.
INSTALLED = r"/\.(?:claude/plugins/[^\s\"']*?/skills|claude/skills|agents/skills)"
REFERENCE = re.compile(INSTALLED + r"/([\w.-]+)/references/([\w/-]+\.\w+)")
# A shell command may enter the references folder and name the files bare:
# cd .../skills/<skill>/references && cat one.md two.md
REFERENCE_DIR = re.compile(r"([^\s\"']*" + INSTALLED + r"/([\w.-]+)/references)/?(?![\w/.-])")
BARE_FILE = re.compile(r"(?<![\w/.$}-])([\w-]+\.md)(?![\w/.-])")
# It may also loop over names without their extension:
# for f in one two; do cat "$f.md"; done
LOOP_USE = re.compile(r"\$\{?(\w+)\}?\.md")
LOOP_ITEMS = r"\bfor\s+%s\s+in\s+([^;\n]+)"


def references_in(text):
    """Return the (skill, file) pairs a file path or shell command names."""
    found = set(REFERENCE.findall(text))
    for folder in REFERENCE_DIR.finditer(text):
        # Bare names belong to that folder only for the rest of the same line.
        rest = text[folder.end():].split("\n", 1)[0]
        names = set(BARE_FILE.findall(rest))
        for variable in LOOP_USE.findall(rest):
            for items in re.findall(LOOP_ITEMS % re.escape(variable), text):
                names.update(item.strip("\"'") + ".md" for item in items.split())
        # Where the folder still exists, keep only the files really in it. That
        # drops a name from elsewhere on the line, such as a project README.
        directory = Path(folder.group(1)).expanduser()
        if directory.is_dir():
            names = {name for name in names if (directory / name).is_file()}
        found.update((folder.group(2), name) for name in names)
    return found


def walk(node):
    """Yield every dict and string in a transcript entry, however deeply nested.

    Subagent and progress entries wrap messages in further layers, so the tool
    calls are not always at the same depth.
    """
    if isinstance(node, dict):
        yield node
        for value in node.values():
            yield from walk(value)
    elif isinstance(node, list):
        for value in node:
            yield from walk(value)
    elif isinstance(node, str):
        yield node


def bare(name):
    """Drop a plugin prefix: kstack:code-review and code-review are one skill."""
    return name.rsplit(":", 1)[-1]


def scan(path, usage, references, seen):
    session = path.stem
    with path.open(errors="replace") as lines:
        for line in lines:
            # A cheap test before parsing. No trailing slash on the folder: a
            # command may name it bare, as in "cd .../references && cat x.md".
            if '"Skill"' not in line and "command-name" not in line and "/references" not in line:
                continue
            try:
                entry = json.loads(line)
            except ValueError:
                continue
            for node in walk(entry):
                if isinstance(node, str):
                    for name in COMMAND.findall(node):
                        if unseen(seen, ("slash", entry.get("uuid"), name)):
                            record(usage, name, "slash", session)
                elif node.get("type") == "tool_use" and unseen(seen, ("tool", node.get("id"))):
                    tool_input = node.get("input") or {}
                    if node.get("name") == "Skill" and tool_input.get("skill"):
                        record(usage, tool_input["skill"], "loaded", session)
                    elif node.get("name") in READERS:
                        # A session may read files with the Read tool or with a
                        # shell command such as cat, so look in both.
                        text = str(tool_input.get("file_path") or tool_input.get("command") or "")
                        for skill, name in references_in(text):
                            record(usage, skill, "references", session)
                            references[(skill, name)] += 1


def unseen(seen, key):
    """True the first time a key appears; resumed sessions repeat earlier entries."""
    if None in key:
        return True
    if key in seen:
        return False
    seen.add(key)
    return True


def record(usage, name, kind, session):
    row = usage[bare(name)]
    row[kind] += 1
    row["sessions"].add(session)
    row["names"].add(name)


def main():
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument("--days", type=float, default=14, help="how far back to look (default 14)")
    parser.add_argument("--root", type=Path, default=Path.home() / ".claude" / "projects")
    parser.add_argument("--match", default="", help="only skills whose name contains this text")
    parser.add_argument("--references", action="store_true", help="list the reference files read")
    args = parser.parse_args()

    cutoff = time.time() - args.days * 86400
    paths = [p for p in args.root.rglob("*.jsonl") if p.stat().st_mtime >= cutoff]
    usage = defaultdict(lambda: {"loaded": 0, "slash": 0, "references": 0, "sessions": set(), "names": set()})
    references = Counter()
    seen = set()
    for path in paths:
        scan(path, usage, references, seen)

    rows = {
        name: row
        for name, row in usage.items()
        if any(args.match in full for full in row["names"]) and (row["loaded"] or row["references"] or ":" in "".join(row["names"]))
    }
    print(f"{len(paths)} transcripts changed in the last {args.days:g} days under {args.root}\n")
    if not rows:
        print("No skill use found.")
        return
    width = max(len(name) for name in rows)
    print(f"{'skill':<{width}}  loaded  slash  refs  sessions")
    for name, row in sorted(rows.items(), key=lambda item: (-item[1]["loaded"], item[0])):
        print(f"{name:<{width}}  {row['loaded']:>6}  {row['slash']:>5}  {row['references']:>4}  {len(row['sessions']):>8}")
    print("\nloaded: Skill tool calls by the model. slash: typed as a command. refs: reference files read.")

    if args.references:
        print()
        for (skill, name), count in sorted(references.items(), key=lambda item: (item[0][0], -item[1])):
            if skill in rows:
                print(f"{count:>4}  {skill}/{name}")


if __name__ == "__main__":
    main()
