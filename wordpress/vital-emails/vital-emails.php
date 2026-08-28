<?php
/**
 * Plugin Name: Vital Suplementos — Correos transaccionales
 * Description: Rediseña los correos de WooCommerce con la identidad de Vital Suplementos y dice, sin ambigüedad, cuánto se paga al recibir.
 * Version:     1.0.0
 * Author:      Vital Suplementos
 * Text Domain: vital-emails
 *
 * ---------------------------------------------------------------------------
 * WHY THIS EXISTS
 *
 * The shop sells cash on delivery. WooCommerce's stock emails were written for
 * prepaid orders: they say "we received your order" and show a total that the
 * shopper has *already paid*. For a contra-entrega order that total is money
 * still owed, and an email that does not say so is the single most expensive
 * ambiguity in the funnel — it is what turns into a refused parcel at the door,
 * and a refused parcel is freight billed against us with no sale.
 *
 * So the one thing every template here states, above the fold and in the
 * subject line, is the amount due and the moment it is due.
 *
 * Delivery is via Brevo (WP Mail SMTP). This plugin does not touch delivery —
 * it only changes what WooCommerce renders. Nothing here needs an API key.
 *
 * INSTALL: drop the folder in wp-content/plugins and activate, or paste the
 * body of this file (without the opening <?php) into a new Code Snippets
 * snippet set to "Run everywhere".
 * ---------------------------------------------------------------------------
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'Vital_Emails' ) ) :

final class Vital_Emails {

	/* Brand palette. Converted from the design system's oklch tokens, because
	   no mail client resolves oklch() — Outlook does not even resolve hsl(). */
	const INK    = '#0E1216';
	const INK_2  = '#2A343C';
	const PAPER  = '#FCFEFF';
	const MIST   = '#F1F4F6';
	const SLATE  = '#53595D';
	const LINE   = '#E2E5E8';
	const TEAL   = '#3FC0C0';
	const TEAL_D = '#00ABCA';

	/* The only support channel that is actually staffed. The site's footer
	   still carries a placeholder address and hi@example.com; until those are
	   real, pointing shoppers anywhere else would be pointing them nowhere. */
	const WHATSAPP     = '525520791699';
	const WHATSAPP_TXT = '+52 55 2079 1699';

	/* What the storefront promises. Kept as constants so the promise lives in
	   one place instead of being retyped into each template. */
	const DELIVERY_MIN = 2;
	const DELIVERY_MAX = 5;

	public static function init() {
		$self = new self();

		add_filter( 'woocommerce_email_styles',            [ $self, 'styles' ], 20, 2 );
		add_filter( 'woocommerce_email_order_items_args',  [ $self, 'show_thumbnails' ] );
		add_action( 'woocommerce_email_before_order_table',[ $self, 'lede' ], 8, 4 );
		add_action( 'woocommerce_email_after_order_table', [ $self, 'support' ], 25, 4 );
		add_filter( 'woocommerce_email_footer_text',       [ $self, 'footer_text' ] );

		/* Subjects and headings. WooCommerce exposes one filter pair per email
		   id; the stock Spanish strings are literal translations of prepaid
		   copy, so every customer-facing one is replaced. */
		foreach ( [ 'customer_processing_order', 'customer_completed_order', 'customer_on_hold_order' ] as $id ) {
			add_filter( "woocommerce_email_subject_{$id}", [ $self, "subject_{$id}" ], 10, 2 );
			add_filter( "woocommerce_email_heading_{$id}", [ $self, "heading_{$id}" ], 10, 2 );
		}
	}

	/* ------------------------------------------------------------------ */
	/* Helpers                                                            */
	/* ------------------------------------------------------------------ */

	/** True when the order will be paid in cash at the door. */
	private function is_cod( $order ) {
		return $order instanceof WC_Order && 'cod' === $order->get_payment_method();
	}

	/**
	 * The tracking number, wherever it happens to live.
	 *
	 * Fulfilment runs through Dropi, and the shipment number is written by
	 * whichever integration touched the order last. Reading a single meta key
	 * would silently drop the number for orders that took another path, and a
	 * shipping email with no tracking is the email that generates the support
	 * message it was sent to prevent.
	 */
	private function tracking( $order ) {
		foreach ( [ '_dropi_tracking', '_tracking_number', '_wc_shipment_tracking_number', '_guia', '_numero_guia' ] as $key ) {
			$v = $order->get_meta( $key );
			if ( is_string( $v ) && '' !== trim( $v ) ) {
				return trim( $v );
			}
		}

		/* The Shipment Tracking extension stores an array of shipments. */
		$items = $order->get_meta( '_wc_shipment_tracking_items' );
		if ( is_array( $items ) && ! empty( $items[0]['tracking_number'] ) ) {
			return (string) $items[0]['tracking_number'];
		}

		return '';
	}

	private function whatsapp_url( $order ) {
		$msg = sprintf(
			/* translators: %s: order number */
			__( 'Hola, escribo por mi pedido #%s', 'vital-emails' ),
			$order instanceof WC_Order ? $order->get_order_number() : ''
		);

		return 'https://wa.me/' . self::WHATSAPP . '?text=' . rawurlencode( $msg );
	}

	/* ------------------------------------------------------------------ */
	/* Subjects + headings                                                */
	/* ------------------------------------------------------------------ */

	public function subject_customer_processing_order( $subject, $order ) {
		if ( ! $order instanceof WC_Order ) {
			return $subject;
		}

		/* The amount goes in the subject line because a good share of shoppers
		   never open the mail — the preview pane is the only surface that is
		   guaranteed to be read, so the number they owe has to survive there. */
		if ( $this->is_cod( $order ) ) {
			return sprintf(
				/* translators: 1: order number, 2: total */
				__( 'Pedido #%1$s confirmado · pagas %2$s al recibir', 'vital-emails' ),
				$order->get_order_number(),
				wp_strip_all_tags( wc_price( $order->get_total(), [ 'currency' => $order->get_currency() ] ) )
			);
		}

		return sprintf( __( 'Pedido #%s confirmado', 'vital-emails' ), $order->get_order_number() );
	}

	public function heading_customer_processing_order( $heading, $order ) {
		return __( 'Tu pedido está confirmado', 'vital-emails' );
	}

	public function subject_customer_completed_order( $subject, $order ) {
		if ( ! $order instanceof WC_Order ) {
			return $subject;
		}

		return sprintf( __( 'Pedido #%s en camino', 'vital-emails' ), $order->get_order_number() );
	}

	public function heading_customer_completed_order( $heading, $order ) {
		return __( 'Tu pedido va en camino', 'vital-emails' );
	}

	public function subject_customer_on_hold_order( $subject, $order ) {
		if ( ! $order instanceof WC_Order ) {
			return $subject;
		}

		return sprintf( __( 'Pedido #%s recibido', 'vital-emails' ), $order->get_order_number() );
	}

	public function heading_customer_on_hold_order( $heading, $order ) {
		return __( 'Recibimos tu pedido', 'vital-emails' );
	}

	/* ------------------------------------------------------------------ */
	/* Order table                                                        */
	/* ------------------------------------------------------------------ */

	/**
	 * Put the product photograph back in the order table.
	 *
	 * The catalogue's whole argument is the pack itself — label, lot, expiry —
	 * so a receipt that lists it as a line of text throws away the one thing
	 * the shopper recognises when the parcel arrives.
	 */
	public function show_thumbnails( $args ) {
		$args['show_image'] = true;
		$args['image_size'] = [ 68, 68 ];

		return $args;
	}

	/* ------------------------------------------------------------------ */
	/* Blocks                                                             */
	/* ------------------------------------------------------------------ */

	/**
	 * The panel above the order table: what happens next, and what is owed.
	 */
	public function lede( $order, $sent_to_admin = false, $plain_text = false, $email = null ) {
		if ( ! $order instanceof WC_Order || $sent_to_admin ) {
			return;
		}

		$id = $email && isset( $email->id ) ? $email->id : '';

		if ( $plain_text ) {
			echo $this->lede_plain( $order, $id );
			return;
		}

		if ( 'customer_completed_order' === $id ) {
			$this->panel_shipping( $order );
		} else {
			$this->panel_confirmed( $order );
		}
	}

	private function panel_confirmed( $order ) {
		$cod   = $this->is_cod( $order );
		$total = wc_price( $order->get_total(), [ 'currency' => $order->get_currency() ] );

		?>
		<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 28px;border-collapse:separate;">
			<tr>
				<td style="padding:0 0 18px;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.65;color:<?php echo esc_attr( self::INK_2 ); ?>;">
					<?php
					printf(
						/* translators: %s: customer first name */
						esc_html__( 'Hola %s, ya tenemos tu pedido y lo estamos preparando para enviarlo.', 'vital-emails' ),
						esc_html( $order->get_billing_first_name() )
					);
					?>
				</td>
			</tr>

			<?php if ( $cod ) : ?>
			<tr>
				<td style="padding:0;">
					<!-- The amount due. Everything else in this mail is secondary to it. -->
					<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:separate;background:<?php echo esc_attr( self::MIST ); ?>;border-left:3px solid <?php echo esc_attr( self::TEAL ); ?>;border-radius:4px;">
						<tr>
							<td style="padding:20px 22px;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
								<p style="margin:0 0 6px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:<?php echo esc_attr( self::SLATE ); ?>;">
									<?php esc_html_e( 'Pago contra entrega', 'vital-emails' ); ?>
								</p>
								<p style="margin:0 0 8px;font-size:26px;font-weight:700;color:<?php echo esc_attr( self::INK ); ?>;">
									<?php echo wp_kses_post( $total ); ?>
								</p>
								<p style="margin:0;font-size:14px;line-height:1.6;color:<?php echo esc_attr( self::INK_2 ); ?>;">
									<?php esc_html_e( 'Es el total que pagas en efectivo a quien te entregue el paquete. No pagas nada por adelantado.', 'vital-emails' ); ?>
								</p>
							</td>
						</tr>
					</table>
				</td>
			</tr>
			<?php endif; ?>

			<tr>
				<td style="padding:22px 0 0;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.7;color:<?php echo esc_attr( self::INK_2 ); ?>;">
					<p style="margin:0 0 6px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:<?php echo esc_attr( self::SLATE ); ?>;">
						<?php esc_html_e( 'Qué sigue', 'vital-emails' ); ?>
					</p>
					<?php
					printf(
						/* translators: 1: minimum days, 2: maximum days */
						esc_html__( 'Preparamos tu paquete y te escribimos por WhatsApp cuando salga. La entrega toma de %1$d a %2$d días hábiles, con envío gratis.', 'vital-emails' ),
						(int) self::DELIVERY_MIN,
						(int) self::DELIVERY_MAX
					);
					?>
				</td>
			</tr>
		</table>
		<?php
	}

	private function panel_shipping( $order ) {
		$cod      = $this->is_cod( $order );
		$tracking = $this->tracking( $order );
		$total    = wc_price( $order->get_total(), [ 'currency' => $order->get_currency() ] );

		?>
		<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 28px;border-collapse:separate;">
			<tr>
				<td style="padding:0 0 18px;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.65;color:<?php echo esc_attr( self::INK_2 ); ?>;">
					<?php
					printf(
						esc_html__( 'Hola %s, tu paquete ya salió de nuestro almacén.', 'vital-emails' ),
						esc_html( $order->get_billing_first_name() )
					);
					?>
				</td>
			</tr>

			<?php if ( $tracking ) : ?>
			<tr>
				<td style="padding:0 0 18px;">
					<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:separate;background:<?php echo esc_attr( self::MIST ); ?>;border-radius:4px;">
						<tr>
							<td style="padding:18px 22px;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
								<p style="margin:0 0 6px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:<?php echo esc_attr( self::SLATE ); ?>;">
									<?php esc_html_e( 'Número de guía', 'vital-emails' ); ?>
								</p>
								<p style="margin:0;font-size:19px;font-weight:700;letter-spacing:0.04em;color:<?php echo esc_attr( self::INK ); ?>;font-family:'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace;">
									<?php echo esc_html( $tracking ); ?>
								</p>
							</td>
						</tr>
					</table>
				</td>
			</tr>
			<?php endif; ?>

			<?php if ( $cod ) : ?>
			<tr>
				<td style="padding:0;">
					<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:separate;background:<?php echo esc_attr( self::MIST ); ?>;border-left:3px solid <?php echo esc_attr( self::TEAL ); ?>;border-radius:4px;">
						<tr>
							<td style="padding:20px 22px;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
								<p style="margin:0 0 6px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:<?php echo esc_attr( self::SLATE ); ?>;">
									<?php esc_html_e( 'Ten listo el pago', 'vital-emails' ); ?>
								</p>
								<p style="margin:0 0 8px;font-size:26px;font-weight:700;color:<?php echo esc_attr( self::INK ); ?>;">
									<?php echo wp_kses_post( $total ); ?>
								</p>
								<p style="margin:0;font-size:14px;line-height:1.6;color:<?php echo esc_attr( self::INK_2 ); ?>;">
									<?php esc_html_e( 'En efectivo, al momento de la entrega. Si no estás, avísanos por WhatsApp y reprogramamos.', 'vital-emails' ); ?>
								</p>
							</td>
						</tr>
					</table>
				</td>
			</tr>
			<?php endif; ?>
		</table>
		<?php
	}

	/** The plain-text arm. Every mail client that refuses HTML still gets the number. */
	private function lede_plain( $order, $id ) {
		$out   = '';
		$total = wp_strip_all_tags( wc_price( $order->get_total(), [ 'currency' => $order->get_currency() ] ) );

		if ( 'customer_completed_order' === $id ) {
			$out .= sprintf( __( 'Hola %s, tu paquete ya salió de nuestro almacén.', 'vital-emails' ), $order->get_billing_first_name() ) . "\n\n";
			$tracking = $this->tracking( $order );
			if ( $tracking ) {
				$out .= __( 'Número de guía: ', 'vital-emails' ) . $tracking . "\n\n";
			}
		} else {
			$out .= sprintf( __( 'Hola %s, ya tenemos tu pedido y lo estamos preparando.', 'vital-emails' ), $order->get_billing_first_name() ) . "\n\n";
		}

		if ( $this->is_cod( $order ) ) {
			$out .= strtoupper( __( 'Pago contra entrega', 'vital-emails' ) ) . "\n";
			$out .= sprintf( __( 'Pagas %s en efectivo al recibir. No pagas nada por adelantado.', 'vital-emails' ), $total ) . "\n\n";
		}

		$out .= sprintf( __( 'Dudas por WhatsApp: %s', 'vital-emails' ), self::WHATSAPP_TXT ) . "\n\n";

		return $out;
	}

	/**
	 * Support block. One channel, one button, no dead ends.
	 *
	 * The button is table-based with a VML fallback because Outlook on Windows
	 * renders a padded anchor as a bare underlined link — the CTA disappears
	 * for the desktop client most likely to be reading a receipt.
	 */
	public function support( $order, $sent_to_admin = false, $plain_text = false, $email = null ) {
		if ( ! $order instanceof WC_Order || $sent_to_admin || $plain_text ) {
			return;
		}

		$url = $this->whatsapp_url( $order );

		?>
		<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin:30px 0 0;border-collapse:separate;border-top:1px solid <?php echo esc_attr( self::LINE ); ?>;">
			<tr>
				<td style="padding:26px 0 0;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.7;color:<?php echo esc_attr( self::INK_2 ); ?>;">
					<p style="margin:0 0 16px;">
						<?php esc_html_e( '¿Algo no cuadra con tu pedido? Escríbenos y lo resolvemos.', 'vital-emails' ); ?>
					</p>

					<!--[if mso]>
					<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word"
						href="<?php echo esc_url( $url ); ?>" style="height:42px;v-text-anchor:middle;width:230px;" arcsize="10%"
						stroke="f" fillcolor="<?php echo esc_attr( self::INK ); ?>">
						<w:anchorlock/>
						<center style="color:#ffffff;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;">
							<?php esc_html_e( 'Escribir por WhatsApp', 'vital-emails' ); ?>
						</center>
					</v:roundrect>
					<![endif]-->
					<!--[if !mso]><!-- -->
					<a href="<?php echo esc_url( $url ); ?>"
						style="display:inline-block;padding:13px 26px;background:<?php echo esc_attr( self::INK ); ?>;color:#ffffff;text-decoration:none;border-radius:4px;font-size:14px;font-weight:700;">
						<?php esc_html_e( 'Escribir por WhatsApp', 'vital-emails' ); ?>
					</a>
					<!--<![endif]-->
				</td>
			</tr>
		</table>
		<?php
	}

	public function footer_text( $text ) {
		return sprintf(
			/* translators: %s: WhatsApp number */
			__( 'Vital Suplementos · México · WhatsApp %s{newline}Suplementos alimenticios y productos cosméticos: no son medicamentos. Este sitio no ofrece diagnóstico ni tratamiento.', 'vital-emails' ),
			self::WHATSAPP_TXT
		);
	}

	/* ------------------------------------------------------------------ */
	/* Styles                                                             */
	/* ------------------------------------------------------------------ */

	/**
	 * Appended after WooCommerce's own stylesheet, so these rules win.
	 *
	 * Everything is inlined by WooCommerce through Emogrifier before sending,
	 * which is why the selectors stay flat: descendant combinators survive,
	 * pseudo-classes and media queries do not get inlined and are only honoured
	 * by clients that keep the <style> block.
	 */
	public function styles( $css, $email = null ) {
		$ink   = self::INK;
		$ink2  = self::INK_2;
		$paper = self::PAPER;
		$mist  = self::MIST;
		$slate = self::SLATE;
		$line  = self::LINE;
		$teal  = self::TEAL;

		return $css . "
			body { background-color: {$mist}; }

			#wrapper { background-color: {$mist}; padding: 40px 12px; }

			#template_container {
				box-shadow: none !important;
				border: 1px solid {$line} !important;
				border-radius: 6px !important;
				background-color: {$paper} !important;
			}

			#template_header {
				background-color: {$ink} !important;
				border-radius: 6px 6px 0 0 !important;
				border-bottom: 3px solid {$teal} !important;
			}

			#template_header h1, #template_header h1 a {
				color: {$paper} !important;
				font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
				font-size: 24px !important;
				font-weight: 700 !important;
				letter-spacing: -0.01em !important;
				text-align: left !important;
				text-shadow: none !important;
				line-height: 1.3 !important;
			}

			#template_header_image img { margin: 0 0 12px !important; }

			#body_content { background-color: {$paper} !important; }

			#body_content_inner {
				color: {$ink2} !important;
				font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
				font-size: 14px !important;
				line-height: 1.7 !important;
				text-align: left !important;
			}

			#body_content h2, #body_content h2 a {
				color: {$ink} !important;
				font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
				font-size: 13px !important;
				font-weight: 700 !important;
				letter-spacing: 0.16em !important;
				text-transform: uppercase !important;
			}

			#body_content h3 { color: {$ink} !important; font-size: 14px !important; }

			/* Order table: hairlines and a mono column for money, so the
			   figures line up on their decimal the way they do on the site. */
			.td, #body_content table.td {
				border-color: {$line} !important;
				color: {$ink2} !important;
				font-size: 14px !important;
				padding: 14px 12px !important;
				vertical-align: middle !important;
			}

			#body_content table.td th {
				color: {$slate} !important;
				font-size: 11px !important;
				font-weight: 600 !important;
				letter-spacing: 0.14em !important;
				text-transform: uppercase !important;
				border-color: {$line} !important;
			}

			#body_content table.td tfoot th, #body_content table.td tfoot td {
				border-color: {$line} !important;
				color: {$ink} !important;
			}

			/* The grand total is the number the shopper hands over at the door. */
			#body_content table.td tfoot tr:last-child th,
			#body_content table.td tfoot tr:last-child td {
				font-size: 17px !important;
				font-weight: 700 !important;
				color: {$ink} !important;
			}

			#body_content table.td img { border-radius: 4px !important; border: 1px solid {$line} !important; }

			.address {
				border-color: {$line} !important;
				background-color: {$mist} !important;
				color: {$ink2} !important;
				border-radius: 4px !important;
				padding: 14px 16px !important;
			}

			#template_footer #credit {
				color: {$slate} !important;
				font-size: 11px !important;
				line-height: 1.7 !important;
				padding: 24px 12px !important;
			}

			a { color: {$ink} !important; }

			/* Dark mode. Only the clients that honour the <style> block get
			   this — the inlined rules above still carry the light design, so
			   nothing depends on it landing. */
			@media (prefers-color-scheme: dark) {
				body, #wrapper { background-color: #0B0E11 !important; }
				#template_container { background-color: #14181C !important; border-color: #262C32 !important; }
				#body_content, #body_content_inner { background-color: #14181C !important; color: #C7CDD2 !important; }
				#body_content h2, #body_content h3 { color: {$paper} !important; }
				.td, #body_content table.td { color: #C7CDD2 !important; border-color: #262C32 !important; }
				.address { background-color: #1B2126 !important; border-color: #262C32 !important; color: #C7CDD2 !important; }
				a { color: {$teal} !important; }
			}

			@media only screen and (max-width: 600px) {
				#wrapper { padding: 16px 0 !important; }
				#template_container { border-radius: 0 !important; border-left: none !important; border-right: none !important; }
				#template_header h1 { font-size: 20px !important; }
				.td, #body_content table.td { padding: 11px 8px !important; font-size: 13px !important; }
			}
		";
	}
}

add_action( 'woocommerce_init', [ 'Vital_Emails', 'init' ] );

endif;
