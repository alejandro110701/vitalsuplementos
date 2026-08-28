<?php
/**
 * Plugin Name:  Vital Suplementos — storefront at the root
 * Description:  Serves the deployed React storefront as the site's front page,
 *               so vitalsuplementos.com.mx shows the shop rather than the
 *               WordPress theme. Everything else on the site is untouched.
 * Version:      1.0.0
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
 * Listing the root first means that if the WordPress.com deployment destination
 * is ever changed from /tienda/ to /, this keeps working without an edit.
 */
function vital_storefront_candidates() {
    // NOT ABSPATH. On WordPress.com Atomic the web root holds only wp-config.php
    // and wp-content; core lives outside it and is symlinked in, so ABSPATH is
    // /srv/htdocs/__wp__/ and looking there would find nothing. wp-content is
    // genuinely in the web root, so its parent is the directory the deployment
    // actually writes into.
    $root = defined('WP_CONTENT_DIR') ? dirname(WP_CONTENT_DIR) : '/srv/htdocs';

    return array(
        array('dir' => $root,             'prefix' => '/'),
        array('dir' => $root . '/tienda', 'prefix' => '/tienda/'),
    );
}

function vital_storefront_render() {
    // Never touch the admin, the REST API, feeds, robots.txt, or any URL that
    // is not the front page itself.
    if (is_admin() || is_feed() || is_robots()) {
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

    // Serve the storefront on the front page AND at /tienda/ (the catalog path).
    // This ensures /tienda/ always gets the fresh build from the plugin rather
    // than waiting for WordPress.com GitHub Deployments to copy the artifact.
    $request_path = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
    $is_tienda = $request_path === '/tienda' || $request_path === '/tienda/';
    
    if (!is_front_page() && !$is_tienda) {
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
            pedido → confirmas por WhatsApp → foto de lote y caducidad de tu unidad → pagas al courier
        </p>
        <p style="
            margin: 0.75rem 0 0 0;
            font-size: 13px;
            line-height: 1.6;
            color: #666;
        ">
            Contra entrega. No generamos la guía hasta que confirmes por WhatsApp. Antes de que salga, te mandamos foto del lote y la caducidad de tu unidad.
        </p>
    </div>
    <?php
}

// Display on cart page (including when /checkout/ redirects to empty cart)
add_action('woocommerce_before_cart', 'vital_cod_whatsapp_info', 5);

// Display on checkout page (when cart has items)
add_action('woocommerce_before_checkout_form', 'vital_cod_whatsapp_info', 5);
