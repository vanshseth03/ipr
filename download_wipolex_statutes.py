import requests
import re
import os
import urllib3
urllib3.disable_warnings()

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

targets = [
    ("Patents_Act_1970", 2042),
    ("Patent_Rules_2003", 21808),
    ("Trade_Marks_Act_1999", 2044),
    ("GI_Act_1999", 2040),
    ("Copyright_Act_1957", 2039),
    ("Designs_Act_2000", 2038),
    ("Biological_Diversity_Act_2002", 2037),
    ("PPVFR_Act_2001", 2043),
    ("Biological_Diversity_Rules_2024", 22421),
    ("Designs_Rules_2001", 21810),
    ("Copyright_Rules_2013", 21811),
]

for name, lid in targets:
    url = f"https://www.wipo.int/wipolex/en/legislation/details/{lid}"
    try:
        r = requests.get(url, headers=headers, timeout=15, verify=False)
        # Find PDF links on wipolex-res cleanly
        pdf_urls = re.findall(r'https://wipolex-res\.wipo\.int/edocs/lexdocs/laws/[^"\'\)\s]+\.pdf', r.text)
        print(f"{name} (LID {lid}): found {len(pdf_urls)} PDF links")
        if pdf_urls:
            download_url = pdf_urls[0].replace('&amp;', '&')
            print(f"  Downloading from: {download_url[:90]}...")
            resp = requests.get(download_url, headers=headers, timeout=30, verify=False)
            print(f"  Result: Status {resp.status_code}, Length {len(resp.content)} bytes")
            if resp.status_code == 200 and len(resp.content) > 5000:
                out_path = f"corpus_vault/raw_documents/pdfs/statutes/{name}.pdf"
                os.makedirs(os.path.dirname(out_path), exist_ok=True)
                with open(out_path, "wb") as f:
                    f.write(resp.content)
                print(f"  -> Saved to {out_path}")
    except Exception as e:
        print(f"Error {name}: {e}")
