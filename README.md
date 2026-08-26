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
| `PACK_DISCOUNT` | `12` | Per-piece discount on the 2-pack; the 3-pack adds 6 points |
| `COD_ONLY` | `true` | When false, checkout also offers SPEI transfer |
| `PEPTIDES_URL` | `https://vitalpeptides.app` | Target of the peptides gateway |

## Notes on the port

- The design routes by internal state; this implementation uses real URLs so products and
  filtered catalogues are shareable and linkable.
- The cart is kept in `localStorage`, which the state-only design did not need.
- Fixed desktop grids from the artboards are kept at their design values and collapse at
  1024px / 720px, which the fixed-width canvas could not express.
- `magnesio-180` has no photo of its own and falls back to the magnesio-cup tile, as in the design.
