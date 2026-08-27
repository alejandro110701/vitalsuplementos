import { describe, expect, it } from "vitest";
import {
  findCatalogProduct,
  mapStoreProduct,
  money,
  PRODUCT_BY_ID,
} from "../src/catalog";

describe("money", () => {
  it("converts Woo minor units", () => {
    expect(money("49900", 2)).toBe(499);
    expect(money(15000, 2)).toBe(150);
    expect(money(undefined, 2)).toBe(0);
  });
});

describe("mapStoreProduct", () => {
  it("maps a known Woo id onto a Vital slug and sale price", () => {
    const mapped = mapStoreProduct({
      id: 35,
      name: "Serum Anua Niacinamida 10 + TXA 4",
      sku: "SERUM-ANUA-NIACINAMIDE",
      permalink: "https://vitalsuplementos.com.mx/product/serum-anua/",
      is_in_stock: true,
      on_sale: true,
      prices: {
        price: "49900",
        regular_price: "74900",
        currency_code: "MXN",
        currency_minor_unit: 2,
      },
    });

    expect(mapped).toMatchObject({
      slug: "serum-anua",
      id: 35,
      price: 499,
      was: 749,
      inStock: true,
      mapped: true,
      currency: "MXN",
    });
  });

  it("does not invent a strike-through when the shop is not on sale", () => {
    const mapped = mapStoreProduct({
      id: 91,
      name: "Creatina",
      on_sale: false,
      prices: { price: "35000", regular_price: "59900", currency_minor_unit: 2 },
    });
    expect(mapped.slug).toBe("creatina");
    expect(mapped.was).toBe(0);
  });
});

describe("findCatalogProduct", () => {
  const products = [
    mapStoreProduct({ id: 91, name: "Creatina", prices: { price: "35000", currency_minor_unit: 2 } }),
    mapStoreProduct({ id: 35, name: "Serum", prices: { price: "49900", currency_minor_unit: 2 } }),
  ];

  it("finds by slug and id", () => {
    expect(findCatalogProduct(products, { slug: "creatina" })?.id).toBe(91);
    expect(findCatalogProduct(products, { id: 35 })?.slug).toBe("serum-anua");
  });
});

describe("PRODUCT_BY_ID", () => {
  it("covers the 16 live shop products", () => {
    expect(Object.keys(PRODUCT_BY_ID)).toHaveLength(16);
  });
});
