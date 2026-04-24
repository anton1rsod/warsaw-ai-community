#!/usr/bin/env python3
"""
Build the persona-creation community guide as a PDF.

Usage:
    python3 scripts/build-pdf.py                # English (default)
    python3 scripts/build-pdf.py --lang uk      # Ukrainian
    python3 scripts/build-pdf.py --lang all     # Both

Output:
    persona-creation-guide.pdf       (from README.md)
    persona-creation-guide-uk.pdf    (from README.uk.md)

Pipeline:
    README[.uk].md
      --> HTML body via Python markdown (tables, fenced_code, toc, sane_lists)
      --> wrapped in a self-contained HTML template with print CSS
      --> rendered to PDF via headless Chrome (--print-to-pdf)

Requirements:
    - Python 3.9+
    - markdown (pip install markdown)
    - Google Chrome installed at /Applications/Google Chrome.app

No LaTeX, pandoc, or wkhtmltopdf needed.
"""
from __future__ import annotations

import argparse
import datetime
import re
import subprocess
import sys
import tempfile
from pathlib import Path

import markdown

REPO_ROOT = Path(__file__).resolve().parent.parent
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# Per-language strings: each language's README, output path, and visible labels.
STRINGS = {
    "en": {
        "readme": REPO_ROOT / "README.md",
        "output": REPO_ROOT / "persona-creation-guide.pdf",
        "title": "Persona Creation",
        "subtitle": "A Community Guide for the Warsaw AI Community",
        "tagline": (
            "A guided interview that turns each member's hard-won knowledge "
            "into a structured persona — the foundation of honest peer "
            "evaluation."
        ),
        "eyebrow": "Warsaw AI Community · Persona Skill",
        "author": "Warsaw AI Community",
        "version": "Guide v1.0 · schema 1.0",
        "prepared_by": "Prepared by",
        "date_label": "Date",
        "version_label": "Version",
        "contents": "Contents",
        "running_header": "Persona Creation — Community Guide",
        "lang": "en",
    },
    "uk": {
        "readme": REPO_ROOT / "README.uk.md",
        "output": REPO_ROOT / "persona-creation-guide-uk.pdf",
        "title": "Створення персони",
        "subtitle": "Посібник для Варшавської AI-спільноти",
        "tagline": (
            "Структуроване інтерв'ю, що перетворює вистраждане знання "
            "кожного учасника на структуровану персону — фундамент "
            "чесного оцінювання в колі колег."
        ),
        "eyebrow": "Варшавська AI-спільнота · Навичка Persona",
        "author": "Варшавська AI-спільнота",
        "version": "Посібник v1.0 · схема 1.0",
        "prepared_by": "Підготовлено",
        "date_label": "Дата",
        "version_label": "Версія",
        "contents": "Зміст",
        "running_header": "Створення персони — Посібник спільноти",
        "lang": "uk",
    },
}


def slugify_unicode(text: str, separator: str = "-") -> str:
    """Unicode-safe slugify — preserves Cyrillic and other letters."""
    s = text.strip().lower()
    s = re.sub(r"[^\w\s\-]", "", s, flags=re.UNICODE)
    s = re.sub(r"\s+", separator, s)
    return s.strip(separator)


def escape_html(text: str) -> str:
    return (
        text.replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
    )


def build_toc(md_source: str) -> str:
    """Extract ## and ### headings into a TOC, skipping fenced-code blocks."""
    lines = []
    in_fence = False
    for raw in md_source.splitlines():
        if raw.startswith("```"):
            in_fence = not in_fence
            continue
        if in_fence:
            continue
        if raw.startswith("## "):
            title = raw[3:].strip()
            slug = slugify_unicode(title)
            lines.append(
                f'<li class="lvl-2"><a href="#{slug}">{escape_html(title)}</a></li>'
            )
        elif raw.startswith("### "):
            title = raw[4:].strip()
            slug = slugify_unicode(title)
            lines.append(
                f'<li class="lvl-3"><a href="#{slug}">{escape_html(title)}</a></li>'
            )
    return "<ul>\n" + "\n".join(lines) + "\n</ul>"


def build_css(strings: dict) -> str:
    """Render the print stylesheet. The running header string is localized."""
    running_header = strings["running_header"]
    return r"""
@page {
  size: A4;
  margin: 22mm 20mm 22mm 20mm;
  @bottom-center {
    content: counter(page) " / " counter(pages);
    font-family: -apple-system, "Helvetica Neue", Arial, sans-serif;
    font-size: 9pt;
    color: #777;
  }
  @top-right {
    content: "__RUNNING_HEADER__";
    font-family: -apple-system, "Helvetica Neue", Arial, sans-serif;
    font-size: 9pt;
    color: #aaa;
  }
}
@page :first {
  margin: 0;
  @bottom-center { content: ""; }
  @top-right { content: ""; }
}
html, body {
  font-family: -apple-system, "Helvetica Neue", "Segoe UI", Arial, sans-serif;
  color: #1c1c1e;
  font-size: 11pt;
  line-height: 1.55;
  margin: 0;
  padding: 0;
  -webkit-font-smoothing: antialiased;
}
body { hyphens: auto; }
h1, h2, h3, h4 {
  font-weight: 600;
  color: #0b1b2a;
  page-break-after: avoid;
  line-height: 1.25;
}
h1 { font-size: 22pt; margin: 0 0 0.4em 0; }
h2 { font-size: 16pt; margin: 1.6em 0 0.5em 0; border-bottom: 1px solid #d8dce0; padding-bottom: 0.25em; }
h3 { font-size: 12.5pt; margin: 1.2em 0 0.3em 0; color: #2b3a4a; }
h4 { font-size: 11.5pt; margin: 1em 0 0.25em 0; color: #344155; }
p { margin: 0 0 0.7em 0; orphans: 3; widows: 3; }
ul, ol { margin: 0 0 0.9em 1.3em; padding: 0; }
li { margin: 0 0 0.25em 0; }
a { color: #0058a0; text-decoration: none; }
a:hover { text-decoration: underline; }
strong { color: #0b1b2a; }
em { color: #2b3a4a; }
hr { border: none; border-top: 1px solid #d8dce0; margin: 1.5em 0; }
blockquote {
  margin: 0 0 0.9em 0;
  padding: 0.6em 1em;
  border-left: 3px solid #c8cfd6;
  background: #f5f7f9;
  color: #2b3a4a;
  font-style: italic;
}
code {
  font-family: "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
  font-size: 9.5pt;
  background: #f2f4f6;
  padding: 1px 4px;
  border-radius: 3px;
  color: #26384e;
}
pre {
  font-family: "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
  font-size: 9pt;
  background: #f5f7f9;
  border: 1px solid #e2e6ea;
  border-radius: 4px;
  padding: 10px 12px;
  overflow-x: auto;
  page-break-inside: avoid;
}
pre code { background: transparent; padding: 0; color: #1c1c1e; font-size: inherit; }
table {
  border-collapse: collapse;
  width: 100%;
  margin: 0.6em 0 1em 0;
  page-break-inside: avoid;
  font-size: 10pt;
}
th, td {
  border: 1px solid #d8dce0;
  padding: 6px 9px;
  vertical-align: top;
  text-align: left;
}
th { background: #eef1f4; font-weight: 600; color: #0b1b2a; }
tr:nth-child(even) td { background: #fafbfc; }

/* Cover page */
.cover {
  height: 297mm;
  width: 210mm;
  box-sizing: border-box;
  padding: 55mm 30mm 30mm 30mm;
  background: linear-gradient(160deg, #0b1b2a 0%, #1a3956 60%, #2b5d8a 100%);
  color: #f5f7f9;
  display: flex;
  flex-direction: column;
  page-break-after: always;
}
.cover .eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.25em;
  font-size: 10pt;
  color: #a8c4dc;
  margin-bottom: 1em;
}
.cover h1 {
  color: #ffffff;
  font-size: 44pt;
  line-height: 1.05;
  margin: 0 0 0.1em 0;
  letter-spacing: -0.5px;
}
.cover .subtitle { color: #d4e2ee; font-size: 16pt; font-weight: 400; margin: 0 0 2.5em 0; }
.cover .tagline { color: #e8edf2; font-size: 13pt; line-height: 1.5; max-width: 130mm; margin: 0 0 auto 0; }
.cover .meta {
  margin-top: auto;
  border-top: 1px solid rgba(255,255,255,0.18);
  padding-top: 1.2em;
  font-size: 10pt;
  color: #c8d6e2;
  display: flex;
  justify-content: space-between;
}
.cover .meta div { line-height: 1.5; }
.cover .meta .label {
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-size: 8pt;
  color: #8aa7c0;
  display: block;
}

/* TOC page */
.toc-page { page-break-after: always; }
.toc-page h1 {
  font-size: 20pt;
  border-bottom: 2px solid #0b1b2a;
  padding-bottom: 0.35em;
  margin-bottom: 0.8em;
}
.toc-page ul { list-style: none; margin: 0; padding: 0; }
.toc-page li { margin: 0.25em 0; padding: 0; font-size: 11pt; }
.toc-page li.lvl-3 { margin-left: 1.5em; font-size: 10pt; color: #455565; }
.toc-page a { color: #0b1b2a; }

/* Body */
.body { page-break-before: always; }
.body > h2:first-of-type { margin-top: 0; }

li, tr { page-break-inside: avoid; }
""".replace("__RUNNING_HEADER__", running_header)


HTML_TEMPLATE = """<!doctype html>
<html lang="{html_lang}">
<head>
<meta charset="utf-8">
<title>{title} — {subtitle}</title>
<style>{css}</style>
</head>
<body>

<section class="cover">
  <div class="eyebrow">{eyebrow}</div>
  <h1>{title}</h1>
  <p class="subtitle">{subtitle}</p>
  <p class="tagline">{tagline}</p>
  <div class="meta">
    <div><span class="label">{prepared_by}</span>{author}</div>
    <div><span class="label">{date_label}</span>{date}</div>
    <div><span class="label">{version_label}</span>{version}</div>
  </div>
</section>

<section class="toc-page">
  <h1>{contents}</h1>
  {toc_html}
</section>

<section class="body">
  {body_html}
</section>

</body>
</html>
"""


def build_one(lang: str) -> int:
    if lang not in STRINGS:
        print(f"ERROR: unknown --lang '{lang}' (choose 'en', 'uk', or 'all')", file=sys.stderr)
        return 2
    s = STRINGS[lang]
    readme: Path = s["readme"]
    output: Path = s["output"]

    if not readme.exists():
        print(f"ERROR: {readme} not found", file=sys.stderr)
        return 3
    if not Path(CHROME).exists():
        print(f"ERROR: Google Chrome not found at {CHROME}", file=sys.stderr)
        return 4

    md_source = readme.read_text(encoding="utf-8")

    md = markdown.Markdown(
        extensions=["tables", "fenced_code", "sane_lists", "attr_list", "toc"],
        extension_configs={
            "toc": {
                "slugify": slugify_unicode,
                "permalink": False,
                "anchorlink": False,
                "toc_depth": "2-3",
            },
        },
        output_format="html5",
    )
    body_html = md.convert(md_source)
    toc_html = build_toc(md_source)

    today = datetime.date.today().isoformat()
    html_doc = HTML_TEMPLATE.format(
        html_lang=s["lang"],
        title=s["title"],
        subtitle=s["subtitle"],
        tagline=s["tagline"],
        eyebrow=s["eyebrow"],
        author=s["author"],
        date=today,
        version=s["version"],
        prepared_by=s["prepared_by"],
        date_label=s["date_label"],
        version_label=s["version_label"],
        contents=s["contents"],
        toc_html=toc_html,
        body_html=body_html,
        css=build_css(s),
    )

    with tempfile.TemporaryDirectory(prefix=f"persona-guide-{lang}-") as tmp:
        html_file = Path(tmp) / "guide.html"
        html_file.write_text(html_doc, encoding="utf-8")
        cmd = [
            CHROME,
            "--headless=new",
            "--disable-gpu",
            "--no-sandbox",
            f"--print-to-pdf={output}",
            "--no-pdf-header-footer",
            "--virtual-time-budget=5000",
            f"file://{html_file}",
        ]
        proc = subprocess.run(cmd, capture_output=True, text=True)
        if proc.returncode != 0:
            print("Chrome print-to-pdf failed.", file=sys.stderr)
            print("STDERR:", proc.stderr, file=sys.stderr)
            return 5

    if not output.exists() or output.stat().st_size < 5000:
        print(f"ERROR: {output} missing or too small", file=sys.stderr)
        return 6

    size_kb = output.stat().st_size / 1024
    print(f"OK [{lang}]: wrote {output} ({size_kb:.1f} KB)")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description="Build the persona-creation PDF guide.")
    ap.add_argument("--lang", default="en", choices=["en", "uk", "all"],
                    help="Which language to build (default: en). Use 'all' for both.")
    args = ap.parse_args()

    if args.lang == "all":
        rc_en = build_one("en")
        rc_uk = build_one("uk")
        return rc_en or rc_uk
    return build_one(args.lang)


if __name__ == "__main__":
    sys.exit(main())
