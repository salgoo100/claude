#!/usr/bin/env python3
"""Convert a Markdown file to a styled standalone HTML file.

Usage:
    python3 scripts/md-to-html.py path/to/file.md
    python3 scripts/md-to-html.py path/to/file.md -o path/to/output.html

The output is a self-contained HTML file with:
- GitHub-style typography
- Light/Dark theme via prefers-color-scheme
- Sticky sidebar with auto-generated table of contents
- Responsive layout
"""

import argparse
import html as htmllib
import sys
from pathlib import Path

try:
    import markdown
except ImportError:
    sys.stderr.write("Missing dependency. Install with:\n  pip install markdown\n")
    sys.exit(1)


HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>{title}</title>
<style>
  :root {{
    --bg: #ffffff;
    --fg: #1f2328;
    --muted: #57606a;
    --border: #d0d7de;
    --accent: #0969da;
    --accent-soft: #ddf4ff;
    --code-bg: #f6f8fa;
    --table-stripe: #f6f8fa;
    --table-head: #eef2f6;
  }}
  @media (prefers-color-scheme: dark) {{
    :root {{
      --bg: #0d1117;
      --fg: #e6edf3;
      --muted: #8b949e;
      --border: #30363d;
      --accent: #2f81f7;
      --accent-soft: #1f2d3d;
      --code-bg: #161b22;
      --table-stripe: #161b22;
      --table-head: #21262d;
    }}
  }}
  * {{ box-sizing: border-box; }}
  html, body {{
    margin: 0;
    padding: 0;
    background: var(--bg);
    color: var(--fg);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Apple SD Gothic Neo",
      "Malgun Gothic", "맑은 고딕", Roboto, Helvetica, Arial, sans-serif;
    line-height: 1.65;
    font-size: 15px;
  }}
  .layout {{
    display: grid;
    grid-template-columns: 280px minmax(0, 1fr);
    max-width: 1400px;
    margin: 0 auto;
    gap: 32px;
    padding: 32px 24px;
  }}
  @media (max-width: 900px) {{
    .layout {{ grid-template-columns: 1fr; }}
    aside {{ position: static !important; max-height: none !important; }}
  }}
  aside {{
    position: sticky;
    top: 24px;
    align-self: start;
    max-height: calc(100vh - 48px);
    overflow-y: auto;
    border-right: 1px solid var(--border);
    padding-right: 16px;
    font-size: 14px;
  }}
  aside .toc-title {{
    font-weight: 700;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-size: 12px;
    margin-bottom: 12px;
  }}
  aside ul {{ list-style: none; padding-left: 12px; margin: 0; }}
  aside > ul {{ padding-left: 0; }}
  aside li {{ margin: 4px 0; }}
  aside a {{
    color: var(--fg);
    text-decoration: none;
    display: block;
    padding: 2px 6px;
    border-radius: 4px;
  }}
  aside a:hover {{ background: var(--accent-soft); color: var(--accent); }}

  main {{ min-width: 0; }}
  main h1 {{
    border-bottom: 2px solid var(--border);
    padding-bottom: 12px;
    margin-top: 0;
    font-size: 30px;
  }}
  main h2 {{
    margin-top: 48px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border);
    font-size: 22px;
  }}
  main h3 {{ margin-top: 32px; font-size: 18px; }}
  main h4 {{ margin-top: 24px; font-size: 16px; color: var(--accent); }}

  p, ul, ol, blockquote, table {{ margin: 12px 0; }}
  a {{ color: var(--accent); text-decoration: none; }}
  a:hover {{ text-decoration: underline; }}

  blockquote {{
    border-left: 4px solid var(--accent);
    background: var(--accent-soft);
    padding: 10px 16px;
    border-radius: 0 6px 6px 0;
  }}
  blockquote p {{ margin: 6px 0; }}

  code {{
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
    background: var(--code-bg);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 90%;
  }}
  pre {{
    background: var(--code-bg);
    padding: 16px;
    overflow-x: auto;
    border-radius: 6px;
    border: 1px solid var(--border);
  }}
  pre code {{ background: transparent; padding: 0; }}

  table {{
    border-collapse: collapse;
    width: 100%;
    display: block;
    overflow-x: auto;
  }}
  table thead {{ background: var(--table-head); }}
  table th, table td {{
    border: 1px solid var(--border);
    padding: 8px 12px;
    text-align: left;
    vertical-align: top;
  }}
  table tr:nth-child(even) td {{ background: var(--table-stripe); }}

  ul li, ol li {{ margin: 4px 0; }}
  hr {{ border: 0; border-top: 1px solid var(--border); margin: 32px 0; }}
  main .toc {{ display: none; }}
</style>
</head>
<body>
<div class="layout">
  <aside>
    <div class="toc-title">목차</div>
    {toc}
  </aside>
  <main>
    {body}
  </main>
</div>
</body>
</html>
"""


def convert(md_path: Path, out_path: Path) -> None:
    md_text = md_path.read_text(encoding="utf-8")
    md = markdown.Markdown(
        extensions=["extra", "toc", "sane_lists", "nl2br"],
        extension_configs={"toc": {"title": "목차", "permalink": False, "toc_depth": "2-3"}},
    )
    body = md.convert(md_text)
    toc = md.toc

    # Use first H1 in the document as the page title, fallback to filename.
    title = md_path.stem
    for line in md_text.splitlines():
        if line.startswith("# "):
            title = line[2:].strip()
            break

    rendered = HTML_TEMPLATE.format(title=htmllib.escape(title), toc=toc, body=body)
    out_path.write_text(rendered, encoding="utf-8")
    print(f"Wrote {out_path} ({out_path.stat().st_size} bytes)")


def main() -> int:
    parser = argparse.ArgumentParser(description="Markdown → styled HTML converter")
    parser.add_argument("input", help="Input .md file")
    parser.add_argument(
        "-o",
        "--output",
        help="Output .html path (defaults to alongside the input file)",
    )
    args = parser.parse_args()

    src = Path(args.input)
    if not src.exists():
        sys.stderr.write(f"Input not found: {src}\n")
        return 1
    dst = Path(args.output) if args.output else src.with_suffix(".html")
    convert(src, dst)
    return 0


if __name__ == "__main__":
    sys.exit(main())
