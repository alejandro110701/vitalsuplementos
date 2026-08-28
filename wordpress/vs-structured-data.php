<?php
/**
 * Plugin Name:  Vital Suplementos — product structured data
 * Description:  Fills the gaps WooCommerce leaves in Product/Offer JSON-LD:
 *               shipping, tax treatment, brand and MPN. These are the fields
 *               Merchant Center, Search rich results and AI assistants read.
 * Version:      1.0.0
 *
 * Installed as a must-use plugin. Separate file from vital-storefront-root.php
 * on purpose: that one serves the SPA shell and a fatal in it takes the
 * homepage down. This one only decorates JSON-LD on WooCommerce pages, so
 * keeping them apart limits the blast radius of either.
 *
 * WHAT IS DELIBERATELY NOT HERE
 *
 * `hasMerchantReturnPolicy`. /refund_returns/ is still WooCommerce's untouched
 * sample page — in English, on a Spanish store, containing the literal strings
 * "{email address}" and "{physical address}", and discussing VHS tapes and gift
 * cards. Emitting a returns policy in structured data while the page a reviewer
 * opens says that would be asserting something untrue, and the mismatch is
 * worse than the omission. Write a real policy first, then add the property.
 *
 * `gtin13`. Nobody has captured barcodes for this catalogue. An invented GTIN
 * is a Merchant Center suspension, not a warning.
 *
 * `aggregateRating` / `review`. There are no reviews. Fabricating them is
 * both a Google policy violation and the thing this store's whole positioning
 * is supposed to be against.
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Brands taken from the product titles, which state them plainly.
 *
 * Only the ones a human can read off the label are here. Seven SKUs in this
 * catalogue — the generic magnesium, glutathione, caffeine mints, salicylic
 * cleanser, 4-in-1 serum, Holy Basil mask and Joint Support — do not name a
 * manufacturer anywhere in the shop data, and a brand is a factual claim about
 * who made the product. Guessing one to fill a schema field is how you end up
 * asserting a manufacturer that never made it. They stay absent until someone
 * reads the actual packaging.
 */
function vs_sd_brand_for($product) {
    $known = array(
        'anua'      => 'Anua',
        'medicube'  => 'Medicube',
        'tocobo'    => 'Tocobo',
        'selerb'    => 'Selerb',
        'chillab'   => 'Chillab',
        'wokali'    => 'Wokali',
        'windboss'  => 'Windboss',
        'bloom'     => 'Bloom Nutrition',
        'dropi cup' => 'Dropi Cup',
    );

    $haystack = mb_strtolower($product->get_name(), 'UTF-8');
    foreach ($known as $needle => $brand) {
        if (mb_strpos($haystack, $needle) !== false) {
            return $brand;
        }
    }
    return null;
}

/**
 * Shipping, read from the live WooCommerce zone rather than hardcoded.
 *
 * The store charges a MX$200 flat rate nationally with free shipping above
 * MX$2,000. Both tiers are declared: a shopper searching from Google sees the
 * real cost before clicking, and Merchant Center stops guessing. The handling
 * and transit windows match the 2–5 days the site promises.
 */
function vs_sd_shipping_details() {
    $flat = null;
    $free_threshold = null;

    // class_exists, not function_exists: WC_Shipping_Zones is a class. The
    // first version of this used function_exists, which is always false, so
    // shippingDetails silently never emitted.
    $zones = class_exists('WC_Shipping_Zones') ? WC_Shipping_Zones::get_zones() : array();
    foreach ((array) $zones as $zone) {
        foreach ((array) $zone['shipping_methods'] as $method) {
            if ($method->id === 'flat_rate' && $method->is_enabled()) {
                $flat = (float) $method->get_option('cost');
            }
            if ($method->id === 'free_shipping' && $method->is_enabled()) {
                $free_threshold = (float) $method->get_option('min_amount');
            }
        }
    }

    if ($flat === null) {
        return null;
    }

    $delivery = array(
        '@type'              => 'ShippingDeliveryTime',
        'handlingTime'       => array(
            '@type'    => 'QuantitativeValue',
            'minValue' => 0,
            'maxValue' => 1,
            'unitCode' => 'DAY',
        ),
        'transitTime'        => array(
            '@type'    => 'QuantitativeValue',
            'minValue' => 2,
            'maxValue' => 5,
            'unitCode' => 'DAY',
        ),
    );

    $destination = array(
        '@type'          => 'DefinedRegion',
        'addressCountry' => 'MX',
    );

    $details = array(
        array(
            '@type'               => 'OfferShippingDetails',
            'shippingRate'        => array(
                '@type'    => 'MonetaryAmount',
                'value'    => $flat,
                'currency' => get_woocommerce_currency(),
            ),
            'shippingDestination' => $destination,
            'deliveryTime'        => $delivery,
        ),
    );

    if ($free_threshold) {
        $details[] = array(
            '@type'                    => 'OfferShippingDetails',
            'shippingRate'             => array(
                '@type'    => 'MonetaryAmount',
                'value'    => 0,
                'currency' => get_woocommerce_currency(),
            ),
            'shippingDestination'      => $destination,
            'deliveryTime'             => $delivery,
            'eligibleTransactionVolume' => array(
                '@type'    => 'PriceSpecification',
                'priceCurrency' => get_woocommerce_currency(),
                'minPrice' => $free_threshold,
            ),
        );
    }

    return $details;
}

/**
 * Decorate the Product node WooCommerce already builds.
 *
 * Filter, not a second JSON-LD block: two Product nodes for one page is a
 * duplicate-entity problem, and Google picks one arbitrarily.
 */
function vs_sd_product($markup, $product) {
    if (!is_array($markup) || !$product) {
        return $markup;
    }

    $brand = vs_sd_brand_for($product);
    if ($brand) {
        $markup['brand'] = array(
            '@type' => 'Brand',
            'name'  => $brand,
        );
    }

    // The supplier SKU is a real manufacturer part number. Unlike a GTIN it is
    // not a checksummed global identifier, so publishing it asserts nothing
    // that could be false.
    $sku = $product->get_sku();
    if ($sku) {
        $markup['mpn'] = $sku;
    }

    if (empty($markup['offers']) || !is_array($markup['offers'])) {
        return $markup;
    }

    $shipping = vs_sd_shipping_details();

    foreach ($markup['offers'] as $i => $offer) {
        if (!is_array($offer)) {
            continue;
        }

        if ($shipping) {
            $markup['offers'][$i]['shippingDetails'] = $shipping;
        }

        // Mexican consumer prices are quoted IVA included. WooCommerce leaves
        // this unset, so a reader cannot tell whether MX$799 is the amount the
        // customer pays. It is.
        // WooCommerce emits priceSpecification as a LIST of specs, not a single
        // map, and marks them valueAddedTaxIncluded:false. Writing the flag at
        // the top level produced {"0": {...}, "valueAddedTaxIncluded": true},
        // which is malformed. Set it on each spec instead.
        if (!empty($markup['offers'][$i]['priceSpecification']) && is_array($markup['offers'][$i]['priceSpecification'])) {
            foreach ($markup['offers'][$i]['priceSpecification'] as $j => $spec) {
                if (is_array($spec)) {
                    $markup['offers'][$i]['priceSpecification'][$j]['valueAddedTaxIncluded'] = true;
                }
            }
        }

        // What the shopper can actually pay with, as configured. Today that is
        // cash on delivery only; when Clip is credentialed this picks up card
        // automatically rather than needing an edit here.
        // Whitelisted, not a catch-all. The first version mapped every
        // non-cod gateway to ByBankTransferInAdvance, which advertised bank
        // transfer on a store that does not accept it. Only gateways we can
        // name honestly appear; anything unrecognised is simply omitted.
        $map = array(
            'cod'             => 'http://purl.org/goodrelations/v1#COD',
            'wc_clipredirect' => 'https://schema.org/CreditCard',
        );
        $methods = array();
        if (function_exists('WC') && WC()->payment_gateways) {
            foreach (WC()->payment_gateways->payment_gateways() as $gw) {
                if (!isset($map[$gw->id]) || !$gw->is_available()) {
                    continue;
                }
                // Clip reports is_available() true on the front end even with
                // no API credentials saved, but the checkout will not offer it
                // and the settings screen shows "Invalid credentials". Claiming
                // card acceptance a customer cannot use is exactly the kind of
                // mismatch Merchant Center treats as misrepresentation, so the
                // credentials are checked directly.
                if ($gw->id === 'wc_clipredirect') {
                    $key    = $gw->get_option('api_key');
                    $secret = $gw->get_option('api_secret');
                    if (empty($key) || empty($secret)) {
                        continue;
                    }
                }
                $methods[] = $map[$gw->id];
            }
        }
        $methods = array_values(array_unique($methods));
        if ($methods) {
            $markup['offers'][$i]['acceptedPaymentMethod'] = count($methods) === 1 ? $methods[0] : $methods;
        }
    }

    return $markup;
}
add_filter('woocommerce_structured_data_product', 'vs_sd_product', 20, 2);
