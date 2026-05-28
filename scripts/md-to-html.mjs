#!/usr/bin/env node
// Convert a Markdown file to a styled standalone HTML file.
// Node alternative to scripts/md-to-html.py — same output structure
// (sticky sidebar TOC, light/dark theme, GitHub-like typography).
//
// Usage:
//   node scripts/md-to-html.mjs path/to/file.md
//   node scripts/md-to-html.mjs path/to/file.md -o path/to/output.html
//
// Setup (one-time, in the scripts/ folder):
//   npm install marked --no-save --silent

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

let marked;
try {
  ({ marked } = await import("marked"));
} catch {
  const here = path.dirname(fileURLToPath(import.meta.url));
  try {
    ({ marked } = await import(path.join(here, "node_modules", "marked", "lib", "marked.esm.js")));
  } catch {
    console.error("Missing dependency. Install with:");
    console.error("  cd scripts && npm install marked --no-save");
    process.exit(1);
  }
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: node md-to-html.mjs <input.md> [-o <output.html>]");
  process.exit(1);
}
const input = args[0];
const oIdx = args.indexOf("-o");
const output = oIdx >= 0 ? args[oIdx + 1] : input.replace(/\.md$/i, ".html");

const md = fs.readFileSync(input, "utf8");

// Slugify supporting Korean (Hangul) and ASCII word chars.
const slug = (s) =>
  s
    .toLowerCase()
    .replace(/[`*_~\[\]()<>|#]/g, "")
    .replace(/[^\w\s\-가-힣ㄱ-ㅎㅏ-ㅣ]/g, "")
    .trim()
    .replace(/\s+/g, "-");

// Pre-scan H2/H3 headings for TOC and to assign IDs in order.
const headingRe = /^(#{2,3})\s+(.+?)\s*$/gm;
const headings = [];
let m;
while ((m = headingRe.exec(md))) {
  const level = m[1].length;
  const text = m[2].replace(/[*_`]/g, "").trim();
  headings.push({ level, text, id: slug(text) });
}

marked.setOptions({ gfm: true, breaks: false, headerIds: false, mangle: false });

let body = marked.parse(md);

// Inject IDs into H2/H3 (in document order, matching pre-scan).
let idx = 0;
body = body.replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (_full, lvl, txt) => {
  const h = headings[idx++];
  return h ? `<h${lvl} id="${h.id}">${txt}</h${lvl}>` : `<h${lvl}>${txt}</h${lvl}>`;
});

// Build the nested TOC HTML.
function buildToc(items) {
  if (items.length === 0) return "";
  let html = "<ul>";
  let level = 2;
  for (const h of items) {
    if (h.level > level) {
      html += "<ul>".repeat(h.level - level);
    } else if (h.level < level) {
      html += "</ul></li>".repeat(level - h.level);
    } else if (html.endsWith("</li>") === false && html !== "<ul>") {
      // close previous <li> at the same level
      html += "</li>";
    } else if (html.endsWith("<ul>") === false && html !== "<ul>") {
      html += "</li>";
    }
    html += `<li><a href="#${h.id}">${escapeHtml(h.text)}</a>`;
    level = h.level;
  }
  html += "</li>" + "</ul>".repeat(level - 2 + 1);
  return html;
}

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const toc = buildToc(headings);

// Extract title from first H1.
const titleMatch = md.match(/^#\s+(.+?)\s*$/m);
const title = titleMatch ? titleMatch[1].trim() : path.basename(input, path.extname(input));

const TEMPLATE = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(title)}</title>
<style>
  :root {
    --bg: #ffffff;
    --fg: #1f2328;
    --muted: #57606a;
    --border: #d0d7de;
    --accent: #0969da;
    --accent-soft: #ddf4ff;
    --code-bg: #f6f8fa;
    --table-stripe: #f6f8fa;
    --table-head: #eef2f6;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #0d1117;
      --fg: #e6edf3;
      --muted: #8b949e;
      --border: #30363d;
      --accent: #2f81f7;
      --accent-soft: #1f2d3d;
      --code-bg: #161b22;
      --table-stripe: #161b22;
      --table-head: #21262d;
    }
  }
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    padding: 0;
    background: var(--bg);
    color: var(--fg);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Apple SD Gothic Neo",
      "Malgun Gothic", "맑은 고딕", Roboto, Helvetica, Arial, sans-serif;
    line-height: 1.65;
    font-size: 15px;
  }
  .layout {
    display: grid;
    grid-template-columns: 280px minmax(0, 1fr);
    max-width: 1400px;
    margin: 0 auto;
    gap: 32px;
    padding: 32px 24px;
  }
  @media (max-width: 900px) {
    .layout { grid-template-columns: 1fr; }
    aside { position: static !important; max-height: none !important; }
  }
  aside {
    position: sticky;
    top: 24px;
    align-self: start;
    max-height: calc(100vh - 48px);
    overflow-y: auto;
    border-right: 1px solid var(--border);
    padding-right: 16px;
    font-size: 14px;
  }
  aside .toc-title {
    font-weight: 700;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-size: 12px;
    margin-bottom: 12px;
  }
  aside ul { list-style: none; padding-left: 12px; margin: 0; }
  aside > ul { padding-left: 0; }
  aside li { margin: 4px 0; }
  aside a {
    color: var(--fg);
    text-decoration: none;
    display: block;
    padding: 2px 6px;
    border-radius: 4px;
  }
  aside a:hover { background: var(--accent-soft); color: var(--accent); }

  main { min-width: 0; }
  main h1 {
    border-bottom: 2px solid var(--border);
    padding-bottom: 12px;
    margin-top: 0;
    font-size: 30px;
  }
  main h2 {
    margin-top: 48px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border);
    font-size: 22px;
  }
  main h3 { margin-top: 32px; font-size: 18px; }
  main h4 { margin-top: 24px; font-size: 16px; color: var(--accent); }

  p, ul, ol, blockquote, table { margin: 12px 0; }
  a { color: var(--accent); text-decoration: none; }
  a:hover { text-decoration: underline; }

  blockquote {
    border-left: 4px solid var(--accent);
    background: var(--accent-soft);
    padding: 10px 16px;
    border-radius: 0 6px 6px 0;
  }
  blockquote p { margin: 6px 0; }

  code {
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
    background: var(--code-bg);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 90%;
  }
  pre {
    background: var(--code-bg);
    padding: 16px;
    overflow-x: auto;
    border-radius: 6px;
    border: 1px solid var(--border);
  }
  pre code { background: transparent; padding: 0; }

  table {
    border-collapse: collapse;
    width: 100%;
    display: block;
    overflow-x: auto;
  }
  table thead { background: var(--table-head); }
  table th, table td {
    border: 1px solid var(--border);
    padding: 8px 12px;
    text-align: left;
    vertical-align: top;
  }
  table tr:nth-child(even) td { background: var(--table-stripe); }

  ul li, ol li { margin: 4px 0; }
  hr { border: 0; border-top: 1px solid var(--border); margin: 32px 0; }
</style>
</head>
<body>
<div class="layout">
  <aside>
    <div class="toc-title">목차</div>
    ${toc}
  </aside>
  <main>
${body}
  </main>
</div>
</body>
</html>
`;

fs.writeFileSync(output, TEMPLATE);
const size = fs.statSync(output).size;
console.log(`Wrote ${output} (${size} bytes)`);
