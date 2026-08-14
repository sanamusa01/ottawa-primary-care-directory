<?php
/**
 * Plugin Name: Ottawa Directory Presentation Adapter
 * Description: Read-only Ottawa OHT directory interface powered by Business Directory Plugin listings.
 * Version: 2.1.6
 * Author: Ottawa OHT-ÉSO
 * Text Domain: ottawa-primary-care-directory
 * Requires at least: 6.3
 * Requires PHP: 7.4
 * Requires Plugins: business-directory-plugin
 */

defined( 'ABSPATH' ) || exit;

define( 'OPCD_VERSION', '2.1.6' );
define( 'OPCD_FILE', __FILE__ );
define( 'OPCD_DIR', plugin_dir_path( __FILE__ ) );
define( 'OPCD_URL', plugin_dir_url( __FILE__ ) );

require_once OPCD_DIR . 'includes/class-opcd-bdp-data-adapter.php';

OPCD_BDP_Data_Adapter::register();

/**
 * Enqueue the directory application assets.
 */
function opcd_enqueue_assets() {
	$css_path = OPCD_DIR . 'assets/css/directory.css';
	$js_path  = OPCD_DIR . 'assets/js/directory.js';

	wp_enqueue_style(
		'opcd-directory',
		OPCD_URL . 'assets/css/directory.css',
		array(),
		file_exists( $css_path ) ? (string) filemtime( $css_path ) : OPCD_VERSION
	);

	wp_enqueue_script(
		'opcd-directory',
		OPCD_URL . 'assets/js/directory.js',
		array(),
		file_exists( $js_path ) ? (string) filemtime( $js_path ) : OPCD_VERSION,
		true
	);

	wp_script_add_data( 'opcd-directory', 'strategy', 'defer' );
}

/**
 * Load assets early when the shortcode is present in normal page content.
 */
function opcd_maybe_enqueue_assets() {
	global $post;

	if ( $post instanceof WP_Post && has_shortcode( $post->post_content, 'ottawa_primary_care_directory' ) ) {
		opcd_enqueue_assets();
	}
}
add_action( 'wp_enqueue_scripts', 'opcd_maybe_enqueue_assets' );

/**
 * Render the directory shell. Public data is read from Business Directory Plugin
 * through the adapter's read-only REST route.
 *
 * @return string
 */
function opcd_render_directory() {
	static $rendered = false;

	if ( $rendered ) {
		return '<p class="opcd-duplicate-warning">' . esc_html__( 'The directory can only be displayed once per page.', 'ottawa-primary-care-directory' ) . '</p>';
	}
	$rendered = true;

	opcd_enqueue_assets();

	if ( ! post_type_exists( 'wpbdp_listing' ) || ! function_exists( 'wpbdp_get_form_fields' ) ) {
		return '<div class="opcd-dependency-warning" role="alert">' .
			esc_html__( 'The directory is temporarily unavailable because Business Directory Plugin is not active.', 'ottawa-primary-care-directory' ) .
			'</div>';
	}

	$directory_data_url = rest_url( OPCD_BDP_Data_Adapter::REST_NAMESPACE . OPCD_BDP_Data_Adapter::REST_ROUTE );
	$leaflet_css_url    = OPCD_URL . 'vendor/leaflet/leaflet.css';
	$leaflet_js_url     = OPCD_URL . 'vendor/leaflet/leaflet.js';
	$locale              = function_exists( 'determine_locale' ) ? determine_locale() : get_locale();
	$directory_language = 0 === stripos( (string) $locale, 'fr' ) ? 'fr' : 'en';

	ob_start();
	include OPCD_DIR . 'templates/directory.php';
	return (string) ob_get_clean();
}
add_shortcode( 'ottawa_primary_care_directory', 'opcd_render_directory' );
