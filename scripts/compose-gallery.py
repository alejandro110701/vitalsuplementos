#!/usr/bin/env python3
"""
Compose the shipping gallery for each product.

Of the 73 photographs the supplier shipped, only 18 survived triage — the rest
are marketing banners with baked-in claims, importer logo bugs or off-palette
collateral. Four heroes were recovered by retouch. Everything else is
label-free product-context photography generated to brand.

Each product ships exactly three beats: an establishing packshot, a macro of
the raw format, then packaging or context.
"""
from PIL import Image, ImageFilter
import base64, io, json, os

SRC = os.path.expanduser('~/Desktop/dropi-favoritos/por-producto')
GEN = 'assets/generated'
RET = 'assets/retouched'
OUT = 'public/packshots/gallery'
MANIFEST = 'src/data/gallery.json'
LARGE, SMALL, LQIP = 1400, 700, 24

FOLDER = {
    'holy-basil': '01_mascarilla-para-cara-holy-basil-viral_62919',
    'gel-salicilico': '02_gel-salicylic-acid-limpiador-80-gr_62604',
    'serum-anua': '03_serum-anua-niacinamide-para-manchas_60822',
    'crema-chillab': '04_crema-chillab-aclaradora-blanqueadora_57924',
    'medicube-colageno': '05_mascarilla-medicube-facial-colageno_57921',
    'nad-mens': '06_suplemento-selerb-nad-mens-complex-60cp_48811',
    'tocobo-barra': '07_protector-solar-tocobo-19gr-barra_47062',
    'magnesio-180': '08_suplemento-magnesio-complex-180-capsulas_38580',
    'glutation-gomas': '09_suplemento-glutation-blanqueador-gomas_35744',
    'joint-support': '10_suplemento-joint-support-windboss-60-cap_35058',
    'bloom-mango': '11_suplemento-bloom-mango-225-gr_34985',
    'mentas-cafeina': '12_mentas-de-cafeina-energy-focus_30764',
    'creatina': '13_dropi-cup-creatina_27177',
    'magnesio-cup': '14_dropi-cup-capsulas-de-magnesio_26409',
    'serum-4en1': '15_serum-4-en-1-antiarrugas-y-manchas_23947',
    'parches-ojeras': '16_mascarilla-ojeras-wokali-con-hialuronico_21425',
}

# importer logo bugs that a plain rectangular crop removes cleanly
CROP = {
    ('joint-support', 1): (0.17, 0.0, 0.79, 1.0),
    ('bloom-mango', 1): (0.117, 0.115, 0.887, 0.881),
    ('magnesio-180', 1): (0.0, 0.0, 0.75, 1.0),
    ('glutation-gomas', 1): (0.22, 0.10, 0.77, 0.92),
    ('magnesio-cup', 2): (0.165, 0.04, 0.833, 0.875),
}

R, G, T = 'real', 'gen', 'retouched'   # source kinds

# slug -> ordered beats: (source, ref, alt)
PLAN = {
    'holy-basil': [(R, 1, None),
                   (G, 1, 'Pico de barro verde oscuro sobre loseta mate, con una pasada extendida al lado.'),
                   (G, 2, 'Pomo verde abierto con el barro al ras y el aplicador de silicona de doble extremo al frente.')],
    'tocobo-barra': [(R, 2, None),
                     (G, 3, 'Barra destapada mostrando la cara de bálsamo azul menta girada unos milímetros hacia arriba.'),
                     (G, 4, 'Pasada ancha de bálsamo azul blanquecino extendida sobre superficie mate.')],
    'creatina': [(R, 2, None),
                 (G, 5, 'Medida colmada de creatina en polvo cristalino blanco, con cristales sueltos al frente.'),
                 (G, 6, 'Bote blanco abierto con la tapa al lado y el polvo al ras, con un hueco de medida.')],
    'medicube-colageno': [(R, 2, None),
                          (G, 7, 'Gota de gel perlado durazno sobre caja de Petri de vidrio, con dos gotas más al lado.'),
                          (R, 1, None)],
    'serum-anua': [(T, 1, None),
                   (G, 8, 'Pipeta de vidrio con una gota de serum transparente a punto de caer sobre un platillo.'),
                   (G, 9, 'Extendido delgado de serum sobre mármol frío, con tres gotas pequeñas al lado.')],
    'nad-mens': [(T, 1, None),
                 (G, 10, 'Montón de cápsulas vegetales translúcidas con polvo claro, sobre superficie mate.'),
                 (G, 11, 'Frasco ámbar destapado con la tapa negra al lado y cinco cápsulas en arco al frente.')],
    'joint-support': [(R, 1, None),
                      (G, 12, 'Siete cápsulas de gelatina color tabaco dispersas sobre superficie mate.'),
                      (G, 13, 'Frasco PET transparente lleno de cápsulas color tabaco, en capas visibles a contraluz.')],
    'gel-salicilico': [(R, 1, None),
                       (G, 14, 'Hilo grueso de gel transparente con microperlas cayendo de la boquilla y formando un rizo.'),
                       (G, 15, 'Tubo blanco de pie sobre su tapa de bisagra, destapado, con una gota de gel al frente.')],
    'crema-chillab': [(R, 1, None),
                      (G, 16, 'Porción de crema blanca opaca en pico suave sobre superficie mate.'),
                      (G, 17, 'Frasco de bomba lila mate con la sobretapa transparente al lado y una gota en la boquilla.')],
    'bloom-mango': [(R, 1, None),
                    (G, 18, 'Medida colmada de polvo verde profundo, con polvo espolvoreado al frente.'),
                    (G, 19, 'Bote blanco abierto con tapa verde salvia al lado y el polvo verde con un hueco de medida.')],
    'mentas-cafeina': [(T, 1, None),
                       (G, 20, 'Cinco cuadros de goma masticable blanca con motas, sueltos sobre superficie mate.'),
                       (G, 21, 'Bolsa azul cielo abierta por el cierre, con cuatro gomas derramadas en arco al frente.')],
    'serum-4en1': [(T, 1, None),
                   (G, 22, 'Pipeta de vidrio con una gota de serum rosa pálido colgando de la punta.'),
                   (G, 23, 'Mancha ovalada de serum rosa pálido extendida sobre superficie mate, con dos gotas al lado.')],
    'magnesio-180': [(R, 1, None),
                     (G, 24, 'Seis cápsulas blancas de dos piezas dispersas sobre superficie mate.'),
                     (G, 25, 'Frasco negro mate destapado con la tapa al lado y cuatro cápsulas blancas en línea.')],
    'glutation-gomas': [(R, 1, None),
                        (G, 26, 'Montón de siete gomas de pectina color coral con espolvoreado mate.'),
                        (G, 27, 'Frasco PET transparente lleno de gomas coral, en capas visibles a contraluz.')],
    'magnesio-cup': [(R, 2, None),
                     (G, 28, 'Cinco cápsulas vegetales blancas sobre superficie mate, una separada al frente.'),
                     (G, 29, 'Frasco ámbar cerrado con tapa blanca estriada y dos cápsulas blancas junto a la base.')],
    'parches-ojeras': [(R, 1, None),
                       (G, 30, 'Dos parches de hidrogel azul verdoso, uno levantado con pinzas de acero.'),
                       (R, 2, None)],
}


def flatten(im):
    if im.mode in ('RGBA', 'LA', 'P'):
        im = im.convert('RGBA')
        bg = Image.new('RGBA', im.size, (255, 255, 255, 255))
        bg.paste(im, (0, 0), im)
        return bg.convert('RGB')
    return im.convert('RGB')


def load(slug, source, ref):
    if source == 'gen':
        return flatten(Image.open(os.path.join(GEN, f'gen-{ref:02d}.webp')))
    if source == 'retouched':
        return flatten(Image.open(os.path.join(RET, slug, f'{ref:02d}.webp')))
    folder = os.path.join(SRC, FOLDER[slug])
    name = sorted(f for f in os.listdir(folder) if not f.startswith('.'))[ref - 1]
    im = flatten(Image.open(os.path.join(folder, name)))
    box = CROP.get((slug, ref))
    if box:
        w, h = im.size
        im = im.crop((int(box[0] * w), int(box[1] * h), int(box[2] * w), int(box[3] * h)))
    return im


def square(im):
    side = max(im.size)
    c = Image.new('RGB', (side, side), (255, 255, 255))
    c.paste(im, ((side - im.width) // 2, (side - im.height) // 2))
    return c


def lqip(im):
    tiny = im.resize((LQIP, LQIP), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.2))
    buf = io.BytesIO()
    tiny.save(buf, 'WEBP', quality=45)
    return 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()


manifest, count, out_bytes = {}, 0, 0
for slug, beats in PLAN.items():
    d = os.path.join(OUT, slug)
    for old in os.listdir(d) if os.path.isdir(d) else []:
        os.remove(os.path.join(d, old))
    os.makedirs(d, exist_ok=True)

    entries = []
    for i, (source, ref, alt) in enumerate(beats, 1):
        sq = square(load(slug, source, ref))
        stem = f'{i:02d}'
        big_p = os.path.join(d, f'{stem}.webp')
        sm_p = os.path.join(d, f'{stem}-sm.webp')
        sq.resize((LARGE, LARGE), Image.LANCZOS).save(big_p, 'WEBP', quality=82, method=6)
        sq.resize((SMALL, SMALL), Image.LANCZOS).save(sm_p, 'WEBP', quality=80, method=6)
        out_bytes += os.path.getsize(big_p) + os.path.getsize(sm_p)
        entries.append({
            'src': f'/packshots/gallery/{slug}/{stem}.webp',
            'srcSmall': f'/packshots/gallery/{slug}/{stem}-sm.webp',
            'lqip': lqip(sq),
            'w': LARGE, 'h': LARGE,
            'kind': 'GENERATED' if source == 'gen' else 'PACKSHOT',
            'ok': True,
            **({'alt': alt} if alt else {}),
        })
        count += 1
    manifest[slug] = entries
    kinds = ''.join('G' if e['kind'] == 'GENERATED' else 'P' for e in entries)
    print(f'  {slug:20s} {len(entries)} beats  [{kinds}]')

with open(MANIFEST, 'w', encoding='utf-8') as fh:
    json.dump(manifest, fh, ensure_ascii=False, indent=1)
print(f'\n{len(manifest)} products · {count} frames · {out_bytes/1024/1024:.1f} MB')
