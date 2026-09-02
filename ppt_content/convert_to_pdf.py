"""Generate PPT_CONTENT.pdf from the markdown using fpdf2."""
from fpdf import FPDF
import re
import os

md_path = r'c:\Users\sange\OneDrive\Desktop\random ideas\projectSIH\ppt_content\PPT_CONTENT.md'
pdf_path = r'c:\Users\sange\OneDrive\Desktop\random ideas\projectSIH\ppt_content\PPT_CONTENT.pdf'

def sanitize(text):
    """Replace non-latin-1 chars with ASCII equivalents."""
    replacements = {
        '\u2014': '--', '\u2013': '-', '\u2019': "'", '\u2018': "'",
        '\u201c': '"', '\u201d': '"', '\u2026': '...', '\u2192': '->',
        '\u2190': '<-', '\u2194': '<->', '\u2191': '^', '\u2193': 'v',
        '\u2022': '*', '\u25cf': '*', '\u25cb': 'o', '\u2713': '[OK]',
        '\u2717': '[X]', '\u2714': '[OK]', '\u2716': '[X]',
        '\u2502': '|', '\u2500': '-', '\u250c': '+', '\u2510': '+',
        '\u2514': '+', '\u2518': '+', '\u251c': '+', '\u2524': '+',
        '\u252c': '+', '\u2534': '+', '\u253c': '+',
        '\u25bc': 'v', '\u25b6': '>', '\u25c0': '<', '\u25b2': '^',
        '\u2265': '>=', '\u2264': '<=', '\u2260': '!=',
        '\u20b9': 'Rs.', '\u00a0': ' ',
    }
    for k, v in replacements.items():
        text = text.replace(k, v)
    # Final pass: strip any remaining non-latin-1 chars
    return text.encode('latin-1', 'replace').decode('latin-1')

with open(md_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

pdf = FPDF()
pdf.set_auto_page_break(auto=True, margin=15)
pdf.add_page()

# Use built-in fonts only
pdf.set_font('Helvetica', 'B', 20)
pdf.cell(0, 12, 'AYUSH-IPR GUARDIAN - PPT Slide Content', new_x="LMARGIN", new_y="NEXT", align='C')
pdf.set_font('Helvetica', '', 11)
pdf.cell(0, 8, 'Smart India Hackathon | Team of 6', new_x="LMARGIN", new_y="NEXT", align='C')
pdf.ln(5)

in_code = False
in_table = False
table_rows = []

def flush_table(pdf, rows):
    if not rows:
        return
    # Calculate column count from header
    cols = len(rows[0])
    if cols == 0:
        return
    page_w = pdf.w - 20  # margins
    col_w = page_w / cols
    
    pdf.set_font('Helvetica', 'B', 8)
    for i, cell_text in enumerate(rows[0]):
        pdf.set_fill_color(15, 52, 96)
        pdf.set_text_color(255, 255, 255)
        pdf.cell(col_w, 7, sanitize(cell_text.strip()[:30]), border=1, fill=True)
    pdf.ln()
    
    pdf.set_font('Helvetica', '', 7)
    pdf.set_text_color(0, 0, 0)
    for row_idx, row in enumerate(rows[1:]):
        if all(c.strip().startswith('-') or c.strip() == '' for c in row):
            continue  # skip separator
        if row_idx % 2 == 0:
            pdf.set_fill_color(242, 242, 242)
        else:
            pdf.set_fill_color(255, 255, 255)
        for i, cell_text in enumerate(row):
            text = sanitize(cell_text.strip()[:40])
            pdf.cell(col_w, 6, text, border=1, fill=True)
        pdf.ln()
    pdf.ln(3)

for line in lines:
    stripped = line.rstrip('\n')
    
    # Code blocks
    if stripped.startswith('```'):
        if in_code:
            in_code = False
            pdf.ln(2)
        else:
            in_code = True
            pdf.set_font('Courier', '', 7)
            pdf.set_fill_color(26, 26, 46)
            pdf.set_text_color(165, 214, 167)
        continue
    
    if in_code:
        pdf.cell(0, 4, sanitize(stripped[:100]), new_x="LMARGIN", new_y="NEXT", fill=True)
        continue
    
    # Table rows
    if '|' in stripped and stripped.strip().startswith('|'):
        cells = [c for c in stripped.split('|')[1:-1]]
        if all(c.strip().startswith('-') or c.strip() == '' for c in cells):
            table_rows.append(cells)
            continue
        if not in_table:
            in_table = True
            table_rows = []
        table_rows.append(cells)
        continue
    elif in_table:
        flush_table(pdf, table_rows)
        table_rows = []
        in_table = False
    
    # Reset text color
    pdf.set_text_color(0, 0, 0)
    
    # Headings
    if stripped.startswith('## SLIDE'):
        pdf.add_page()
        pdf.set_font('Helvetica', 'B', 16)
        pdf.set_text_color(22, 33, 62)
        text = sanitize(stripped.replace('## ', '').replace('**', ''))
        pdf.cell(0, 10, text[:80], new_x="LMARGIN", new_y="NEXT")
        pdf.set_draw_color(15, 52, 96)
        pdf.line(10, pdf.get_y(), pdf.w - 10, pdf.get_y())
        pdf.ln(3)
        continue
    elif stripped.startswith('## '):
        pdf.set_font('Helvetica', 'B', 14)
        pdf.set_text_color(22, 33, 62)
        text = sanitize(stripped.replace('## ', '').replace('**', ''))
        pdf.cell(0, 10, text[:80], new_x="LMARGIN", new_y="NEXT")
        pdf.ln(2)
        continue
    elif stripped.startswith('### '):
        pdf.set_font('Helvetica', 'B', 11)
        pdf.set_text_color(83, 52, 131)
        text = sanitize(stripped.replace('### ', '').replace('**', ''))
        pdf.cell(0, 8, text[:80], new_x="LMARGIN", new_y="NEXT")
        pdf.ln(1)
        continue
    elif stripped.startswith('# '):
        continue  # already handled title
    
    # Horizontal rule
    if stripped.startswith('---'):
        pdf.set_draw_color(15, 52, 96)
        pdf.line(10, pdf.get_y(), pdf.w - 10, pdf.get_y())
        pdf.ln(3)
        continue
    
    # Empty line
    if stripped.strip() == '':
        pdf.ln(2)
        continue
    
    # Bold text
    text = stripped
    text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)  # strip markdown bold
    text = text.replace('- ', '  * ', 1) if text.startswith('- ') else text
    
    # Detect if line has bold markers for styling
    has_bold = '**' in stripped
    
    pdf.set_font('Helvetica', 'B' if has_bold else '', 9)
    pdf.set_text_color(0, 0, 0)
    
    # Sanitize for latin-1 encoding
    clean = sanitize(text)
    pdf.multi_cell(0, 5, clean[:200])

# Flush any remaining table
if in_table and table_rows:
    flush_table(pdf, table_rows)

pdf.output(pdf_path)
print(f"PDF saved to {pdf_path}")
print(f"File size: {os.path.getsize(pdf_path)} bytes")
