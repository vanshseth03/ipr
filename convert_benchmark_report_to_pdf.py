import os
import re
import subprocess
import markdown
import fitz  # PyMuPDF

MD_FILE = r"c:\Users\sange\OneDrive\Desktop\random ideas\projectSIH\statutory_rag_benchmark_22_prompts_report.md"
HTML_TEMP = r"c:\Users\sange\OneDrive\Desktop\random ideas\projectSIH\temp_benchmark_report.html"
RAW_PDF = r"c:\Users\sange\OneDrive\Desktop\random ideas\projectSIH\temp_benchmark_raw.pdf"
FINAL_PDF = r"c:\Users\sange\OneDrive\Desktop\random ideas\projectSIH\statutory_rag_benchmark_22_prompts_report.pdf"
CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

def preprocess_markdown(text):
    # Format badges in tables
    text = re.sub(r"✅\s*VERIFIED", r'<span class="badge badge-verified">✅ VERIFIED</span>', text)
    text = re.sub(r"✅\s*PASS", r'<span class="badge badge-verified">✅ PASS</span>', text)
    text = re.sub(r"❌\s*FAIL", r'<span class="badge badge-fail">❌ FAIL</span>', text)

    # Format latency numbers nicely
    text = re.sub(r"\*\*(\d+\.\d+\s*s)\*\*", r'<strong class="latency-hl">\1</strong>', text)
    text = re.sub(r"`(\d+,\d+\s*ms|\d+\s*ms)`", r'<code class="code-ms">\1</code>', text)

    return text

def build_pdf():
    print(f"Reading markdown file: {MD_FILE}")
    with open(MD_FILE, "r", encoding="utf-8") as f:
        raw_md = f.read()

    processed_md = preprocess_markdown(raw_md)

    html_body = markdown.markdown(
        processed_md,
        extensions=[
            'extra',
            'tables',
            'fenced_code',
            'toc',
            'nl2br',
            'sane_lists'
        ]
    )

    custom_css = """
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

    @page {
        size: A4 portrait;
        margin: 15mm 13mm 15mm 13mm;
    }

    * {
        box-sizing: border-box;
    }

    body {
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 9pt;
        line-height: 1.5;
        color: #1e293b;
        background-color: #ffffff;
        margin: 0;
        padding: 0;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }

    h1 {
        font-size: 18pt;
        font-weight: 800;
        color: #0f172a;
        border-bottom: 2.5px solid #0284c7;
        padding-bottom: 6px;
        margin-top: 0;
        margin-bottom: 8px;
        letter-spacing: -0.02em;
    }

    h2 {
        font-size: 12.5pt;
        font-weight: 700;
        color: #0369a1;
        border-left: 4px solid #0284c7;
        padding-left: 10px;
        margin-top: 1.4em;
        margin-bottom: 0.45em;
        background: #f0f9ff;
        padding-top: 4px;
        padding-bottom: 4px;
        border-radius: 0 4px 4px 0;
        page-break-after: avoid;
    }

    h3 {
        font-size: 11pt;
        font-weight: 700;
        color: #0f766e;
        border-bottom: 1px dashed #cbd5e1;
        padding-bottom: 3px;
        margin-top: 1.3em;
        margin-bottom: 0.35em;
        page-break-after: avoid;
    }

    h4 {
        font-size: 9.8pt;
        font-weight: 600;
        color: #334155;
        margin-top: 0.8em;
        margin-bottom: 0.25em;
        page-break-after: avoid;
    }

    p {
        margin-top: 0.3em;
        margin-bottom: 0.45em;
    }

    blockquote {
        margin: 0.6em 0;
        padding: 8px 12px;
        background-color: #f8fafc;
        border-left: 3.5px solid #0284c7;
        color: #334155;
        font-size: 8.8pt;
        border-radius: 0 4px 4px 0;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        margin: 10px 0 14px 0;
        font-size: 8pt;
        page-break-inside: auto;
    }

    tr {
        page-break-inside: avoid;
        page-break-after: auto;
    }

    th {
        background-color: #0f172a;
        color: #ffffff;
        font-weight: 700;
        text-align: left;
        padding: 6px 7px;
        border: 1px solid #334155;
        font-size: 7.8pt;
        letter-spacing: 0.02em;
    }

    td {
        padding: 5px 7px;
        border: 1px solid #cbd5e1;
        vertical-align: top;
    }

    tr:nth-child(even) td {
        background-color: #f8fafc;
    }

    code {
        font-family: 'JetBrains Mono', monospace;
        font-size: 8pt;
        background-color: #f1f5f9;
        color: #0369a1;
        padding: 1px 4px;
        border-radius: 3px;
        border: 1px solid #e2e8f0;
    }

    .badge {
        display: inline-block;
        font-size: 7.5pt;
        font-weight: 600;
        padding: 1px 6px;
        border-radius: 3px;
        white-space: nowrap;
    }
    .badge-verified {
        background-color: #ecfdf5;
        color: #047857;
        border: 1px solid #a7f3d0;
    }
    .badge-fail {
        background-color: #fef2f2;
        color: #b91c1c;
        border: 1px solid #fecaca;
    }

    .latency-hl {
        color: #0284c7;
        font-family: 'JetBrains Mono', monospace;
    }

    .code-ms {
        color: #64748b;
        font-size: 7.5pt;
    }

    hr {
        border: 0;
        height: 1px;
        background: #e2e8f0;
        margin: 14px 0;
    }

    ul, ol {
        margin: 0.3em 0;
        padding-left: 18px;
    }
    li {
        margin-bottom: 2px;
    }
    """

    full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Statutory RAG Benchmark & Latency Audit Report</title>
    <style>
    {custom_css}
    </style>
</head>
<body>
{html_body}
</body>
</html>
"""

    with open(HTML_TEMP, "w", encoding="utf-8") as f:
        f.write(full_html)
    print(f"HTML written to {HTML_TEMP}")

    # Convert HTML to PDF via Headless Chrome
    print("Running headless Chrome print-to-pdf...")
    cmd = [
        CHROME_PATH,
        "--headless=new",
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={RAW_PDF}",
        HTML_TEMP
    ]
    subprocess.run(cmd, check=True)
    print(f"Raw PDF generated: {RAW_PDF}")

    # Add Running Header & Page Numbers with PyMuPDF
    print("Adding professional running headers & page numbers via PyMuPDF...")
    doc = fitz.open(RAW_PDF)
    total_pages = len(doc)

    for i, page in enumerate(doc):
        # Header (pages 2+)
        if i > 0:
            page.insert_text(
                fitz.Point(36, 26),
                "AYUSH-IPR GUARDIAN — Statutory RAG Benchmark & Latency Audit",
                fontsize=7.5,
                fontname="helv",
                color=(0.35, 0.4, 0.48)
            )
            page.draw_line(fitz.Point(36, 30), fitz.Point(page.rect.width - 36, 30), color=(0.85, 0.88, 0.92), width=0.6)

        # Footer (all pages)
        page.draw_line(fitz.Point(36, page.rect.height - 30), fitz.Point(page.rect.width - 36, page.rect.height - 30), color=(0.85, 0.88, 0.92), width=0.6)
        page.insert_text(
            fitz.Point(36, page.rect.height - 18),
            "Project SIH 2026 • Dual Tesla T4 RAG Engine • Confidential & Proprietary",
            fontsize=7.5,
            fontname="helv",
            color=(0.4, 0.45, 0.52)
        )
        page_num_str = f"Page {i + 1} of {total_pages}"
        page.insert_text(
            fitz.Point(page.rect.width - 90, page.rect.height - 18),
            page_num_str,
            fontsize=7.5,
            fontname="helv",
            color=(0.3, 0.35, 0.42)
        )

    doc.save(FINAL_PDF)
    doc.close()
    print(f"[OK] Final PDF successfully created at: {FINAL_PDF} ({total_pages} pages)")

    # Cleanup temp files
    try:
        if os.path.exists(HTML_TEMP): os.remove(HTML_TEMP)
        if os.path.exists(RAW_PDF): os.remove(RAW_PDF)
    except Exception:
        pass

if __name__ == "__main__":
    build_pdf()
