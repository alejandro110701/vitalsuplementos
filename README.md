# Vital Suplementos

Storefront for **Vital Suplementos** — direct-import supplements and skincare for Mexico,
sold with cash on delivery. Implemented from the `Vital Suplementos.dc.html` design canvas
and bound to the **VitalPeptides Design System** (ink + teal, Space Grotesk / Inter / JetBrains Mono).

Peptides are deliberately *not* sold here — the `/peptidos` screen is a gateway to
[vitalpeptides.app](https://vitalpeptides.app).

## Stack

React 18 + Vite, plain CSS custom properties for the design tokens. No CSS framework:
the design system ships its own token layer, and components consume it directly.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static bundle in dist/
npm run preview  # serve the built bundle
```

## Screens

| Route | Screen |
| --- | --- |
| `/` | Home — hero, trust strip, the two worlds, best sellers, goals, manifesto band, peptides teaser |
| `/tienda` | Catálogo, filtered by `?mundo=`, `?objetivo=` and `?q=` |
| `/producto/:slug` | Producto — pack tiers, quantity, spec sheet, related |
| `/carrito` | Carrito |
| `/checkout` | Datos de entrega + payment method |
| `/gracias` | Pedido confirmado |
| `/nosotros` | Nosotros |
| `/peptidos` | Pasarela a Vital Peptides |

## Layout

```
src/
  config.js          commercial knobs (shipping, pack discount, COD-only, peptides URL)
  data/products.js   the 16-product catalogue and the four goals
  ds/                VitalPeptides Design System — tokens + components
  lib/               money/pack pricing helpers, cart context
  components/        header, footer, scroll restoration
  routes/            one file per screen
public/shop/         product photography, 1000×1000 tiles
```

### Commercial configuration

`src/config.js` mirrors the editable props on the design canvas:

| Constant | Default | Effect |
| --- | --- | --- |
| `SHIPPING_COST` | `149` | Flat MXN shipping, charged once per non-empty order |
| `PACK_DISCOUNT` | `0` | Per-piece discount on the 2-pack; the 3-pack adds 6 points. Zero while the shop sells simple products — see below |
| `COD_ONLY` | `true` | When false, checkout also offers SPEI transfer |
| `PEPTIDES_URL` | `https://vitalpeptides.app` | Target of the peptides gateway |

## Notes on the port

- The design routes by internal state; this implementation uses real URLs so products and
  filtered catalogues are shareable and linkable.
- The cart is kept in `localStorage`, which the state-only design did not need.
- Fixed desktop grids from the artboards are kept at their design values and collapse at
  1024px / 720px, which the fixed-width canvas could not express.
- `magnesio-180` has no photo of its own and falls back to the magnesio-cup tile, as in the design.

## Product gallery

Each product page scrolls through three photographs on a sticky stage — the
circle mask of the catalogue tile opens into a sheet at the second beat, and
closes again if you scroll back. The mechanism is one `IntersectionObserver`
plus CSS `position: sticky`: no scroll listener, no `rAF`, no scroll-snap.

### Where the photographs came from

The supplier shipped 73 images per `~/Desktop/dropi-favoritos/por-producto`.
A vision triage pass kept **18**. The other 55 were marketing banners with
baked-in headlines and efficacy claims, importer logo bugs, or saturated
collateral that fights the palette — none of them publishable on a storefront
whose promise is "criterio, no promesas".

Of the survivors, five needed a crop to clear a `HYPER MODA` importer mark, and
four heroes were recovered by retouch (`scripts/` and `assets/retouched/`):
three had the mark on flat white, and `serum-anua` needed its bottle knocked
out of a magenta gel sphere.

The remaining **30 frames were generated** — label-free macros of the raw
format and context shots, on the brand's own off-white teal-haloed field.

**A generated frame never opens a gallery.** Beat 1 is always a real
photograph of the real pack, because the brand quotes what is printed on the
label, and a generated label is an invented claim. Generated frames carry no
type at all, for the same reason.

```bash
python3 scripts/compose-gallery.py   # rebuilds public/shop/gallery + src/data/gallery.json
```

`src/lib/gallery.js` holds the copy ladder — every beat states what the product
IS, CONTAINS, or how it SHIPS. No rung describes an effect.

## The live shop

The 16 products exist in WooCommerce at
[vitalsuplementos.com.mx](https://vitalsuplementos.com.mx). **Price and stock
come from there**, baked into `src/data/woo.js` at build time:

```bash
npm run sync:woo    # re-pull price + stock from the live shop
```

The shop is the only place a customer can actually pay, so its price always
wins — advertising a number the shop will not honour is the failure mode worth
designing against. That is also why `PACK_DISCOUNT` is `0`: the live products
are *simple*, with no pack variations and no sale prices, so the pack picker is
hidden and every quantity costs exactly the shop price. Add variations in
WooCommerce, set `PACK_DISCOUNT` to match, and the picker comes back. Everything editorial stays curated in `src/data/products.js`:
names, claims, bullets, dosing, objectives. The imported products carry the
supplier's own titles, and some of those make claims this brand does not.

Syncing at build time rather than at runtime is deliberate: WordPress.com does
not send `access-control-allow-origin`, so the WooCommerce Store API cannot be
read from a browser on another origin. Baking it means no key in the bundle, no
CORS proxy, and no runtime dependency on the shop being up. `vite.config.js`
proxies `/woo` to the Store API for poking at live data in development.

## Deploying

`.github/workflows/deploy.yml` builds on every push to `main` and publishes to
GitHub Pages. The build always runs, so a broken build is caught immediately;
only the deploy step needs Pages enabled.

Two things to know before switching it on:

- **Pages on a free plan only serves public repositories.** This repo is
  private. Either make it public, or point the workflow at another host.
- **Serve it from the shop's own origin if you can.** WordPress.com sends no
  `access-control-allow-origin`, so the WooCommerce Store API — including the
  cart and checkout endpoints — is unreachable from a browser on a different
  domain. Same-origin turns a read-only catalogue mirror into a real headless
  storefront with a working cart.

The build re-syncs prices from the live shop first, so every deploy ships what
WooCommerce is charging at that moment. If the shop is unreachable the committed
`src/data/woo.js` is used and the build still succeeds.

`BASE_PATH=/vitalsuplementos/ npm run build` produces a bundle for a Pages
subpath; the default builds for a domain root.

### Pushing the catalogue back to the shop

The shop was seeded from the supplier, so its products carry supplier titles,
supplier copy, and — for all 16 — a zero-byte image file. This pushes the
curated name, description and product photo onto each live product:

```bash
WOO_URL=https://vitalsuplementos.com.mx \
WOO_KEY=ck_... WOO_SECRET=cs_... \
npm run fix:woo            # add --dry to preview
```

**The key must have Read/Write permission** — WooCommerce → Settings → Advanced
→ REST API. A read-only key fails with `woocommerce_rest_authentication_error`.

Credentials come from the environment and are never written into the repo. It
does not touch price or stock: the shop stays the source of truth for money, and
this only fixes what the supplier import got wrong.
