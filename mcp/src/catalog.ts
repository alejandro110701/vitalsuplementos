/**
 * Maps live WooCommerce Store API products onto Vital catalogue slugs.
 * IDs stay in lockstep with scripts/sync-woo.mjs.
 */
export const PRODUCT_BY_ID: Record<number, string> = {
  103: "parches-ojeras",
  98: "serum-4en1",
  91: "creatina",
  86: "mentas-cafeina",
  81: "bloom-mango",
  75: "joint-support",
  71: "glutation-gomas",
  67: "magnesio-180",
  58: "tocobo-barra",
  53: "nad-mens",
  46: "medicube-colageno",
  41: "crema-chillab",
  35: "serum-anua",
  30: "gel-salicilico",
  21: "holy-basil",
  17: "magnesio-cup",
};

export type StoreProduct = {
  id: number;
  name: string;
  slug?: string;
  sku?: string;
  permalink?: string;
  is_in_stock?: boolean;
  on_sale?: boolean;
  prices?: {
    price?: string;
    regular_price?: string;
    currency_code?: string;
    currency_minor_unit?: number;
  };
};

export type CatalogProduct = {
  slug: string;
  id: number;
  sku: string | null;
  name: string;
  permalink: string | null;
  price: number;
  was: number;
  inStock: boolean;
  currency: string;
  mapped: boolean;
};

export function money(minor: string | number | undefined, unit: number): number {
  return Math.round(Number(minor ?? 0) / 10 ** unit);
}

export function mapStoreProduct(product: StoreProduct): CatalogProduct {
  const unit = product.prices?.currency_minor_unit ?? 2;
  const regular = money(product.prices?.regular_price, unit);
  const price = money(product.prices?.price, unit);
  const slug = PRODUCT_BY_ID[product.id] ?? product.slug ?? String(product.id);
  return {
    slug,
    id: product.id,
    sku: product.sku || null,
    name: product.name,
    permalink: product.permalink ?? null,
    price,
    was: product.on_sale && regular > price ? regular : 0,
    inStock: product.is_in_stock !== false,
    currency: product.prices?.currency_code ?? "MXN",
    mapped: product.id in PRODUCT_BY_ID,
  };
}

export function findCatalogProduct(
  products: CatalogProduct[],
  query: { slug?: string; id?: number },
): CatalogProduct | undefined {
  if (typeof query.id === "number") {
    return products.find((product) => product.id === query.id);
  }
  if (query.slug) {
    return products.find((product) => product.slug === query.slug);
  }
  return undefined;
}
