#!/usr/bin/env python3
"""Synchronize the self-contained HTML with canonical plugin assets."""

from __future__ import annotations

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "Ottawa-Primary-Care-Directory-CLEANED_16.html"
PLUGIN = ROOT / "ottawa-primary-care-directory"


def standalone_javascript(javascript: str) -> str:
    body_start = javascript.index("  function boot(DATA) {\n") + len("  function boot(DATA) {\n")
    body_end = javascript.index("\n  }\n\n  function bootError()", body_start)
    body = javascript[body_start:body_end]
    return "\n".join(
        [
            "(function () {",
            "  'use strict';",
            "  var root = document.getElementById('ottrx-root');",
            "  if (!root) return;",
            "  var DATA = JSON.parse(document.getElementById('ottrx-data').textContent);",
            body,
            "})();",
        ]
    )


def main() -> int:
    html = HTML.read_text(encoding="utf-8")
    css = (PLUGIN / "assets" / "css" / "directory.css").read_text(encoding="utf-8").rstrip()
    data = (PLUGIN / "assets" / "data" / "directory.json").read_text(encoding="utf-8").strip()
    javascript = standalone_javascript((PLUGIN / "assets" / "js" / "directory.js").read_text(encoding="utf-8"))

    paste_marker = "<!-- ===== BEGIN PASTE BLOCK — copy from this line ===== -->"
    marker_index = html.index(paste_marker)
    style_start = html.index("<style>", marker_index) + len("<style>")
    style_end = html.index("</style>", style_start)
    html = html[:style_start] + "\n" + css + "\n" + html[style_end:]

    data_open = '<script type="application/json" id="ottrx-data">'
    data_tag_start = html.index(data_open, marker_index)
    data_start = data_tag_start + len(data_open)
    data_end = html.index("</script>", data_start)
    html = html[:data_start] + data + html[data_end:]

    data_close = html.index("</script>", data_start)
    script_start = html.index("<script>", data_close) + len("<script>")
    script_end = html.index("</script>", script_start)
    html = html[:script_start] + "\n" + javascript + "\n" + html[script_end:]
    HTML.write_text(html, encoding="utf-8")
    print(f"Synchronized {HTML.name}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
