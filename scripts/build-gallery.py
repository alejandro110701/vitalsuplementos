#!/usr/bin/env python3
"""
Build the web gallery from the Dropi per-product photo sets.

Every source photo is padded to a square on white (the product tiles sit on the
near-white --halo-teal field, so white padding is invisible) and emitted at two
widths plus a tiny blurred placeholder that the gallery paints while the real
image decodes.
"""
from PIL import Image, ImageFilter
import base64, io, json, os, sys

SRC = os.path.expanduser('~/Desktop/dropi-favoritos/por-producto')
OUT = 'public/shop/gallery'
MANIFEST = 'src/data/gallery.json'

# Dropi folder prefix -> storefront slug
MAP = {
    '01_': 'holy-basil',      '02_': 'gel-salicilico',  '03_': 'serum-anua',
    '04_': 'crema-chillab',   '05_': 'medicube-colageno','06_': 'nad-mens',
    '07_': 'tocobo-barra',    '08_': 'magnesio-180',    '09_': 'glutation-gomas',
    '10_': 'joint-support',   '11_': 'bloom-mango',     '12_': 'mentas-cafeina',
    '13_': 'creatina',        '14_': 'magnesio-cup',    '15_': 'serum-4en1',
    '16_': 'parches-ojeras',
}

LARGE, SMALL, LQIP = 1400, 700, 24


def square_on_white(im: Image.Image) -> Image.Image:
    """Pad (never crop) onto a white square so nothing is lost to the circle mask."""
    if im.mode in ('RGBA', 'LA', 'P'):
        im = im.convert('RGBA')
        side = max(im.size)
        canvas = Image.new('RGBA', (side, side), (255, 255, 255, 255))
        canvas.paste(im, ((side - im.width) // 2, (side - im.height) // 2), im)
        return canvas.convert('RGB')
    im = im.convert('RGB')
    side = max(im.size)
    canvas = Image.new('RGB', (side, side), (255, 255, 255))
    canvas.paste(im, ((side - im.width) // 2, (side - im.height) // 2))
    return canvas


def lqip(im: Image.Image) -> str:
    tiny = im.resize((LQIP, LQIP), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.2))
    buf = io.BytesIO()
    tiny.save(buf, 'WEBP', quality=45)
    return 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()


manifest, totals = {}, {'products': 0, 'images': 0, 'bytes_in': 0, 'bytes_out': 0}

for folder in sorted(os.listdir(SRC)):
    prefix = folder[:3]
    slug = MAP.get(prefix)
    if not slug:
        print(f'  !! unmapped folder {folder}', file=sys.stderr)
        continue

    files = sorted(f for f in os.listdir(os.path.join(SRC, folder)) if not f.startswith('.'))
    os.makedirs(os.path.join(OUT, slug), exist_ok=True)
    entries = []

    for i, name in enumerate(files, 1):
        path = os.path.join(SRC, folder, name)
        totals['bytes_in'] += os.path.getsize(path)
        sq = square_on_white(Image.open(path))

        stem = f'{i:02d}'
        big = sq.resize((LARGE, LARGE), Image.LANCZOS)
        big_p = os.path.join(OUT, slug, f'{stem}.webp')
        big.save(big_p, 'WEBP', quality=82, method=6)

        sm = sq.resize((SMALL, SMALL), Image.LANCZOS)
        sm_p = os.path.join(OUT, slug, f'{stem}-sm.webp')
        sm.save(sm_p, 'WEBP', quality=80, method=6)

        totals['bytes_out'] += os.path.getsize(big_p) + os.path.getsize(sm_p)
        entries.append({
            'src': f'/shop/gallery/{slug}/{stem}.webp',
            'srcSmall': f'/shop/gallery/{slug}/{stem}-sm.webp',
            'lqip': lqip(sq),
            'w': LARGE, 'h': LARGE,
        })
        totals['images'] += 1

    manifest[slug] = entries
    totals['products'] += 1
    print(f'  {slug:20s} {len(entries)} images')

os.makedirs(os.path.dirname(MANIFEST), exist_ok=True)
with open(MANIFEST, 'w', encoding='utf-8') as fh:
    json.dump(manifest, fh, ensure_ascii=False, indent=1)

mb = lambda b: f'{b / 1024 / 1024:.1f} MB'
print(f"\n{totals['products']} products · {totals['images']} images")
print(f"source {mb(totals['bytes_in'])} -> web {mb(totals['bytes_out'])}")
