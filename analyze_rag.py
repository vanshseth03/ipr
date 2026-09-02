import json, os, re
from collections import defaultdict

data_dir = 'data'
total_fixable = 0
total_empty_fixable = 0

for fname in sorted(os.listdir(data_dir)):
    if not fname.endswith('.json'): continue
    with open(os.path.join(data_dir, fname), 'r', encoding='utf-8') as f:
        records = json.load(f)
    
    total = len(records)
    empty = sum(1 for r in records if len(r.get('content','')) < 10)
    
    # Build section map
    section_map = defaultdict(list)
    for i, r in enumerate(records):
        title = r.get('title', '')
        m = re.match(r'(Section|Rule|Regulation|Schedule|Chapter|Article|Form|Appendix)\s+(\d+[A-Za-z]*)', title)
        if m:
            sec_id = f"{m.group(1)}_{m.group(2)}"
            section_map[sec_id].append(i)
    
    # Count duplicates where we can merge empty into content
    fixable = 0
    for sec_id, indices in section_map.items():
        if len(indices) > 1:
            has_empty = any(len(records[i].get('content','')) < 10 for i in indices)
            has_content = any(len(records[i].get('content','')) > 50 for i in indices)
            if has_empty and has_content:
                fixable += sum(1 for i in indices if len(records[i].get('content','')) < 10)
    
    total_fixable += fixable
    if fixable > 0:
        print(f'{fname}: {total} records, {empty} empty, {fixable} fixable by merging')

print(f'\nTOTAL records fixable by merging duplicates: {total_fixable}')
print(f'These empty records can be enriched by copying content from their duplicate with-content siblings')

# Now check: how many are truly orphan (no matching content sibling)?
total_orphan = 0
for fname in sorted(os.listdir(data_dir)):
    if not fname.endswith('.json'): continue
    with open(os.path.join(data_dir, fname), 'r', encoding='utf-8') as f:
        records = json.load(f)
    
    section_map = defaultdict(list)
    for i, r in enumerate(records):
        title = r.get('title', '')
        m = re.match(r'(Section|Rule|Regulation|Schedule|Chapter|Article|Form|Appendix)\s+(\d+[A-Za-z]*)', title)
        if m:
            sec_id = f"{m.group(1)}_{m.group(2)}"
            section_map[sec_id].append(i)
    
    orphans = 0
    for i, r in enumerate(records):
        if len(r.get('content','')) < 10:
            title = r.get('title','')
            m = re.match(r'(Section|Rule|Regulation|Schedule|Chapter|Article|Form|Appendix)\s+(\d+[A-Za-z]*)', title)
            if m:
                sec_id = f"{m.group(1)}_{m.group(2)}"
                siblings = section_map[sec_id]
                has_content_sibling = any(len(records[j].get('content','')) > 50 for j in siblings if j != i)
                if not has_content_sibling:
                    orphans += 1
            else:
                orphans += 1
    
    if orphans > 0:
        total_orphan += orphans

print(f'\nTRULY ORPHAN empty records (no content sibling): {total_orphan}')
print(f'These need to be scraped/filled from source PDFs')
