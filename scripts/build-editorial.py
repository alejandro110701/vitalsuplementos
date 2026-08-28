#!/usr/bin/env python3
"""Responsive tiers for the editorial (non-packshot) imagery.

Same idea as build-packshots.py, different source folder and different tiers:
these are wide crops that sit inside vs-wrap (max 1180 CSS px), not square
product tiles, so the ladder is 640 / 1000 / 1400 rather than 320 / 640 / 1000.

The fallback here is JPEG, not PNG. A photographic 1400px PNG is ~2 MB; the
packshots can stay PNG because they are flat-background product cutouts that
compress well. Nothing on this page should ship 2 MB to paint a trust image.

Masters live in editorial-src/ and are deliberately OUTSIDE public/: a 1.6 MB
source PNG in public/ gets copied into dist/ and deployed on every push to
serve nothing. Only the derived tiers ship.

Run: npm run build:editorial
"""
import pathlib
import sys

from PIL import Image

TIERS = (640, 1000, 1400)
WEBP_QUALITY = 80
JPEG_QUALITY = 82
ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'editorial-src'          # masters, NOT shipped
OUT = ROOT / 'public' / 'editorial'   # derived tiers, shipped


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    masters = sorted(SRC.glob('*-master.png'))
    if not masters:
        sys.exit('no *-master.png in %s' % SRC)

    for master in masters:
        stem = master.stem.replace('-master', '')
        img = Image.open(master).convert('RGB')
        w, h = img.size
        print('%s  %dx%d  %.0f KB' % (master.name, w, h, master.stat().st_size / 1024))

        for tier in TIERS:
            if tier > w:
                continue
            resized = img.resize((tier, round(h * tier / w)), Image.LANCZOS)
            out = OUT / ('%s-%d.webp' % (stem, tier))
            resized.save(out, 'WEBP', quality=WEBP_QUALITY, method=6)
            print('   -> %-28s %6.0f KB' % (out.name, out.stat().st_size / 1024))

        # One JPEG at the largest tier, for anything that cannot read webp.
        fallback_w = min(TIERS[-1], w)
        resized = img.resize((fallback_w, round(h * fallback_w / w)), Image.LANCZOS)
        out = OUT / ('%s.jpg' % stem)
        resized.save(out, 'JPEG', quality=JPEG_QUALITY, optimize=True, progressive=True)
        print('   -> %-28s %6.0f KB  (fallback)' % (out.name, out.stat().st_size / 1024))
        print('   intrinsic size for width/height attrs: %d x %d'
              % (fallback_w, round(h * fallback_w / w)))


if __name__ == '__main__':
    main()
