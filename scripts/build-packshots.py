#!/usr/bin/env python3
"""Derive responsive webp tiers from the 1000px packshots in public/shop.

Every packshot is authored at 1000x1000, but nothing on the site renders one
larger than about 520 CSS px, and the shop grid renders them at 154. Shipping
the master to a 154px tile costs ~291 KB to paint ~10 KB of pixels.

Emits <slug>-320.webp / -640.webp / -1000.webp next to the master. The PNG
stays as the <img src> fallback so a browser without webp still works.

Idempotent: skips a tier whose file is newer than its master. Run:  npm run build:packshots
"""
import pathlib, sys
from PIL import Image

TIERS = (320, 640, 1000)
QUALITY = 82
SRC = pathlib.Path(__file__).resolve().parent.parent / 'public' / 'packshots'

def main():
    masters = sorted(SRC.glob('*.png'))
    if not masters:
        sys.exit(f'no packshots in {SRC}')

    before = after = 0
    written = skipped = 0

    for png in masters:
        before += png.stat().st_size
        with Image.open(png) as im:
            im = im.convert('RGB')
            w, _ = im.size
            for tier in TIERS:
                out = png.with_name(f'{png.stem}-{tier}.webp')
                if out.exists() and out.stat().st_mtime >= png.stat().st_mtime:
                    after += out.stat().st_size
                    skipped += 1
                    continue
                # never upscale past the master; a 1000px master just re-encodes
                edge = min(tier, w)
                im.resize((edge, edge), Image.LANCZOS).save(
                    out, 'WEBP', quality=QUALITY, method=6
                )
                after += out.stat().st_size
                written += 1

    print(f'  {len(masters)} masters -> {written} written, {skipped} up to date')
    print(f'  png masters {before/1e6:.2f} MB  ->  webp tiers {after/1e6:.2f} MB')
    grid = sum(p.stat().st_size for p in SRC.glob('*-320.webp'))
    print(f'  what a 375px shop grid now downloads: {grid/1e3:.0f} KB (was {before/1e3:.0f} KB)')

if __name__ == '__main__':
    main()
