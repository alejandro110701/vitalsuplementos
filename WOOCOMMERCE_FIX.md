# WooCommerce Payment Gateway Fix

## Issue
WooCommerce checkout was showing "No hay métodos de pago disponibles" (No payment methods available).

## Root Cause
The COD (Cash on Delivery) payment gateway was **disabled** in WooCommerce settings. Only Clip was enabled, but without proper configuration, shoppers couldn't complete checkout.

## Fix Applied
Enabled the COD payment gateway via WooCommerce REST API:

```bash
curl -X PUT "https://vitalsuplementos.com.mx/wp-json/wc/v3/payment_gateways/cod" \
  -u "$WOO_key:$WOO_secret" \
  -H "Content-Type: application/json" \
  -d '{"enabled": true}'
```

## Result
**Both payment gateways are now active:**
- ✅ **COD (Pago contra entrega)**: ENABLED
- ✅ **Clip**: ENABLED (remains available)

Shoppers can now choose between:
1. Pago contra entrega (Cash on Delivery)
2. Clip (Card payment)

## Verification Date
August 28, 2026 - 17:31 UTC
