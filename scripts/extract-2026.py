from pathlib import Path
import json
import fitz

root = Path(__file__).resolve().parent.parent
for party in ['pp', 'vox']:
    doc = fitz.open(root / 'research' / '2026' / (party + '.pdf'))
    pages = [{'page': i + 1, 'text': p.get_text(sort=True)} for i, p in enumerate(doc)]
    (root / 'research' / '2026' / (party + '-pages.json')).write_text(json.dumps(pages, ensure_ascii=False, indent=2), encoding='utf-8')
    (root / 'research' / '2026' / (party + '.txt')).write_text('\n\n'.join('=== PDF PÁGINA ' + str(p['page']) + ' ===\n' + p['text'] for p in pages), encoding='utf-8')
    print(party, len(pages), 'páginas', sum(len(p['text']) for p in pages), 'caracteres')
    for n in [0, 4, min(15, len(doc)-1)]:
        doc[n].get_pixmap(matrix=fitz.Matrix(1, 1)).save(root / 'research' / '2026' / (party + '-page-' + str(n+1) + '.png'))
