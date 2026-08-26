# WooCommerce import

`productos-woocommerce.csv` is the 16-product catalogue in WooCommerce's native
product-importer format: 16 variable parents + 48 variations.

## Why variable products

The design sells each item in three pack tiers (1 / 2 / 3 pieces) with an
escalating per-piece discount. That is modelled as a **`Paquete`** attribute with
three variations, so the discount is a real WooCommerce price rather than
front-end arithmetic — the same shape `vitalpep.shop` uses for `Presentación`.

Pricing per variation:

- **Regular price** — list price (`was` where the product has one, else `price`) × pack size
- **Sale price** — discounted per-piece price × pack size

So a 2-pack always shows a saving against buying two singles, and products that
were already on sale keep showing their original crossed-out price.

## Import order

1. **Upload images first.** Bulk-upload `../public/shop/*.png` to the Media Library.
   The CSV's `Images` column carries bare filenames, which the importer matches
   against existing media.
2. **Import the CSV** — WooCommerce → Products → Import, map columns automatically.
3. **Set shipping** — flat rate $149 MXN (matches `SHIPPING_COST` in `src/config.js`).
4. **Enable Cash on Delivery** — WooCommerce → Settings → Payments.

`magnesio-180` has no photo of its own and reuses `magnesio-cup.png`, as in the design.

## Regenerating

```bash
node woocommerce/build-import.mjs
```

The CSV is generated from `src/data/products.js` and `src/config.js`, so the
storefront and the WooCommerce catalogue never drift apart — change the
catalogue in one place and re-run.
