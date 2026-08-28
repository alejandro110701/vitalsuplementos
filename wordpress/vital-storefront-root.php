<?php
/**
 * Plugin Name:  Vital Suplementos — storefront at the root
 * Description:  Serves the deployed React storefront as the site's front page,
 *               so vitalsuplementos.com.mx shows the shop rather than the
 *               WordPress theme. Everything else on the site is untouched.
 * Version:      1.1.0
 *
 * Installed as a must-use plugin at wp-content/mu-plugins/, so it needs no
 * activation and cannot be switched off by accident from the Plugins screen.
 *
 * Why this exists rather than a theme: WooCommerce owns /cart/, /checkout/,
 * /shop/ and /product/..., and those must keep rendering with the real theme so
 * checkout keeps working. This hook fires on the front page only.
 *
 * It serves the *deployed* index.html rather than a copy, so it never goes
 * stale when the asset hashes change on the next deploy. If that file cannot be
 * read for any reason it returns quietly and WordPress renders as it always
 * did — a missing build shows the old homepage, never a blank page.
 *
 * ---------------------------------------------------------------------------
 * v1.1.0 — the catalogue index (added 28 Aug 2026)
 *
 * The storefront is a HashRouter SPA. Every internal link it paints is a
 * fragment ("#/producto/serum-anua"), and a fragment is not a URL: no crawler
 * can follow one, so the 16 server-rendered WooCommerce product pages — which
 * carry the real <h1>, the meta description and valid Product+Offer schema —
 * were orphans with no inbound link anywhere on the site.
 *
 * This appends a real, visible catalogue index to the served shell, after the
 * SPA's own markup and outside #root, so React never touches it. It is plain
 * HTML with plain <a href> to the canonical /product/ permalinks. It is the
 * same bytes for every visitor and every crawler — there is no user-agent
 * branching here and there must never be, both because that is cloaking and
 * because a bottom-of-page catalogue index is genuinely useful.
 *
 * Product data is read from WooCommerce at render time rather than hardcoded,
 * so prices, new SKUs and de-listings follow the shop without a redeploy.
 * ---------------------------------------------------------------------------
 *
 * To remove: delete this file. Nothing else is changed.
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Where the build lands, most specific first.
 *
 * Each entry maps the directory holding index.html to the URL prefix its assets
 * are served from. The build emits document-relative URLs ("./assets/..."), so
 * serving it at / requires rewriting those to point back at the real directory.
 * Listing /tienda/ first ensures that if a stale index.html ends up at the root,
 * the plugin still serves the fresh build from /tienda/ rather than 404ing on
 * outdated asset hashes.
 */
function vital_storefront_candidates() {
    // NOT ABSPATH. On WordPress.com Atomic the web root holds only wp-config.php
    // and wp-content; core lives outside it and is symlinked in, so ABSPATH is
    // /srv/htdocs/__wp__/ and looking there would find nothing. wp-content is
    // genuinely in the web root, so its parent is the directory the deployment
    // actually writes into.
    $root = defined('WP_CONTENT_DIR') ? dirname(WP_CONTENT_DIR) : '/srv/htdocs';

    // 28 Aug 2026: a deploy changed the build layout from /tienda/index.html to
    // /tienda/dist/index.html and the homepage silently fell back to the
    // WordPress theme for ~7 minutes. The fallback is the designed behaviour —
    // a missing build must never blank the page — but it is a silent failure,
    // so the list now covers both layouts and any future one is one line.
    //
    // Listing /tienda/ paths first ensures that if a stale index.html ends up
    // at the root, the plugin still serves the fresh build from /tienda/ rather
    // than 404ing on outdated asset hashes.
    return array(
        array('dir' => $root . '/tienda/dist', 'prefix' => '/tienda/dist/'),
        array('dir' => $root . '/tienda',      'prefix' => '/tienda/'),
        array('dir' => $root,                  'prefix' => '/'),
    );
}

/**
 * Every published, purchasable product as [name, permalink, price_html].
 *
 * Cached for an hour: the shell is deliberately served uncached (the asset
 * hashes change on deploy), so without this every homepage hit would run a
 * product query. Deleting the transient is not necessary after a price change —
 * an hour is well inside the window that matters for a crawler.
 */
function vital_storefront_catalog_items() {
    $cached = get_transient('vital_storefront_catalog');
    if (is_array($cached)) {
        return $cached;
    }

    if (!function_exists('wc_get_products')) {
        return array();
    }

    $products = wc_get_products(array(
        'status'  => 'publish',
        'limit'   => 100,
        'orderby' => 'title',
        'order'   => 'ASC',
    ));

    $items = array();
    foreach ($products as $product) {
        if (!$product || !$product->is_visible()) {
            continue;
        }
        $items[] = array(
            'name'  => $product->get_name(),
            'url'   => get_permalink($product->get_id()),
            'price' => wc_price($product->get_price()),
        );
    }

    set_transient('vital_storefront_catalog', $items, HOUR_IN_SECONDS);

    return $items;
}

/**
 * The catalogue index appended to the shell.
 *
 * Styles are inline and every selector is prefixed, so this cannot collide with
 * the SPA's design tokens whatever the build ships. Nothing here is hidden:
 * no display:none, no off-screen positioning, no zero height. If a change ever
 * makes this invisible to a person while a crawler can still read it, that is
 * cloaking and the block must be removed instead.
 */
function vital_storefront_catalog_html() {
    $items = vital_storefront_catalog_items();
    if (empty($items)) {
        return '';
    }

    $shop = function_exists('wc_get_page_permalink') ? wc_get_page_permalink('shop') : home_url('/shop/');

    $css = '.vs-index{background:#fff;border-top:1px solid #e6e8ea;'
         . 'font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif;color:#1a1d21}'
         . '.vs-index__in{max-width:1180px;margin:0 auto;padding:48px 24px 56px}'
         . '.vs-index__h{margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:.2em;'
         . 'text-transform:uppercase;color:#6b7280}'
         . '.vs-index__sub{margin:0 0 22px;font-size:13px;line-height:1.7;color:#6b7280;max-width:60ch}'
         . '.vs-index__grid{display:grid;gap:10px 28px;'
         . 'grid-template-columns:repeat(auto-fill,minmax(260px,1fr));list-style:none;margin:0;padding:0}'
         . '.vs-index__grid a{color:#1a1d21;text-decoration:none;font-size:13.5px;line-height:1.6}'
         . '.vs-index__grid a:hover{text-decoration:underline}'
         . '.vs-index__price{color:#6b7280;font-size:12px}'
         . '.vs-index__all{display:inline-block;margin-top:26px;font-size:12px;font-weight:700;'
         . 'letter-spacing:.14em;text-transform:uppercase;color:#1a1d21}';

    $out  = '<style>' . $css . '</style>';
    $out .= '<nav class="vs-index" aria-label="Índice del catálogo">';
    $out .= '<div class="vs-index__in">';
    $out .= '<h2 class="vs-index__h">Índice del catálogo</h2>';
    $out .= '<p class="vs-index__sub">Ficha completa de cada producto: ingredientes declarados, '
          . 'contenido neto y modo de uso.</p>';
    $out .= '<ul class="vs-index__grid">';

    foreach ($items as $item) {
        $out .= '<li><a href="' . esc_url($item['url']) . '">'
              . esc_html($item['name'])
              . ' <span class="vs-index__price">' . wp_kses_post($item['price']) . '</span>'
              . '</a></li>';
    }

    $out .= '</ul>';
    $out .= '<a class="vs-index__all" href="' . esc_url($shop) . '">Ver la tienda completa →</a>';
    $out .= '</div></nav>';

    return $out;
}

function vital_storefront_disable_tienda_redirect($redirect_url, $requested_url) {
    // WordPress wants to redirect /tienda to /tienda/ but gets the scheme wrong
    // (http instead of https). Since this plugin serves /tienda directly without
    // needing a redirect, prevent redirect_canonical from running on that path.
    $request_path = parse_url($requested_url, PHP_URL_PATH);
    if ($request_path === '/tienda') {
        return false;
    }
    return $redirect_url;
}
add_filter('redirect_canonical', 'vital_storefront_disable_tienda_redirect', 10, 2);

function vital_storefront_render() {
    // Never touch the admin, the REST API, feeds, robots.txt, or any URL that
    // is not the front page itself.
    if (is_admin() || is_feed() || is_robots() || !is_front_page()) {
        return;
    }
    if (defined('REST_REQUEST') && REST_REQUEST) {
        return;
    }
    if (defined('DOING_AJAX') && DOING_AJAX) {
        return;
    }
    // A logged-in editor asking for the customiser or a preview wants
    // WordPress, not the storefront.
    if (is_customize_preview() || isset($_GET['preview'])) {
        return;
    }

    foreach (vital_storefront_candidates() as $candidate) {
        $index = $candidate['dir'] . '/index.html';

        // The root candidate is the WordPress directory itself; only take it if
        // a build has actually been deployed there.
        if (!is_readable($index)) {
            continue;
        }

        $html = file_get_contents($index);
        if ($html === false || strpos($html, 'id="root"') === false) {
            continue;
        }

        $html = str_replace(
            array('src="./', 'href="./'),
            array('src="' . $candidate['prefix'], 'href="' . $candidate['prefix']),
            $html
        );

        // Append the catalogue index just inside </body>, after #root. React
        // mounts into #root and replaces only its children, so this survives
        // hydration and stays in the DOM for people as well as crawlers.
        $catalog = vital_storefront_catalog_html();
        if ($catalog !== '' && strpos($html, '</body>') !== false) {
            $html = str_replace('</body>', $catalog . '</body>', $html);
        }

        // The shell names hashed asset files that disappear on the next deploy,
        // so a cached copy would eventually point at bundles that 404 and paint
        // nothing. Keep it out of the page cache.
        if (!defined('DONOTCACHEPAGE')) {
            define('DONOTCACHEPAGE', true);
        }
        nocache_headers();

        status_header(200);
        header('Content-Type: text/html; charset=utf-8');
        echo $html;
        exit;
    }

    // No build found — fall through and let WordPress render the site.
    //
    // But do not let that fallback be cached. On 28 Aug 2026 a deploy moved the
    // build to /tienda/dist/, this function fell through for about seven
    // minutes, and Automattic's edge cache stored the WordPress theme page as
    // the homepage. Fixing the path then did nothing: the edge kept serving the
    // cached theme until `wp edge-cache purge --domain` was run by hand. A
    // fallback is by definition a temporary wrong answer, so it must never be
    // the thing that gets cached.
    if (!defined('DONOTCACHEPAGE')) {
        define('DONOTCACHEPAGE', true);
    }
    nocache_headers();
}

add_action('template_redirect', 'vital_storefront_render', 0);

/**
 * Display COD WhatsApp information on WooCommerce cart and checkout pages.
 *
 * Prints the Shop-Lead-approved phone number, four-step process, and exact copy
 * on /checkout/ whether the cart is empty (shows cart page) or has items (shows
 * checkout form). Also displays on /cart/ for shoppers who land there directly.
 */
function vital_cod_whatsapp_info() {
    // Only display on cart or checkout pages
    if (!is_cart() && !is_checkout()) {
        return;
    }
    ?>
    <div style="
        margin: 0 0 2rem 0;
        padding: 1.25rem 1.5rem;
        background: #f5f5f5;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
    ">
        <p style="
            margin: 0 0 0.5rem 0;
            font-size: 14px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: #000;
        ">
            Pedidos por WhatsApp:
            <a 
                href="https://wa.me/525520791699" 
                style="
                    color: #0891b2;
                    text-decoration: none;
                    border-bottom: 1px solid #0891b2;
                "
            >+52 55 2079 1699</a>
        </p>
        <p style="
            margin: 0.75rem 0 0 0;
            font-size: 13px;
            line-height: 1.6;
            color: #666;
        ">
            pedido → confirmas por WhatsApp → pagas en efectivo al recibir
        </p>
        <p style="
            margin: 0.75rem 0 0 0;
            font-size: 13px;
            line-height: 1.6;
            color: #666;
        ">
            Contra entrega. No generamos la guía hasta que confirmes por WhatsApp, y no pagas nada hasta que el paquete esté en tus manos.
        </p>
    </div>
    <?php
}

// Display on cart page (including when /checkout/ redirects to empty cart)
add_action('woocommerce_before_cart', 'vital_cod_whatsapp_info', 5);

// Display on checkout page (when cart has items)
add_action('woocommerce_before_checkout_form', 'vital_cod_whatsapp_info', 5);

/**
 * Drop the cached catalogue whenever a product changes, so a price edit or a
 * new SKU shows up on the homepage index without waiting out the hour.
 */
function vital_storefront_flush_catalog() {
    delete_transient('vital_storefront_catalog');
}
add_action('save_post_product', 'vital_storefront_flush_catalog');
add_action('woocommerce_update_product', 'vital_storefront_flush_catalog');
add_action('woocommerce_delete_product', 'vital_storefront_flush_catalog');
