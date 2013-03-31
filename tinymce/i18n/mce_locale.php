<?php
/**
 * @var string $strings a JavaScript snippet to add another language pack to TinyMCE
 * @var string $mce_locale an ISO 639-1 formated string of the current language e.g. en, de...
 * @deprecated wp_tiny_mce() at wp-admin/includes/post.php (for versions prior WP 3.3)
 * @see _WP_Editors::editor_settings in wp-includes/class-wp-editor.php
 */
$strings =
	'tinyMCE.addI18n(
		"' . $mce_locale . '.gridster_shortcode",
		{
			buttonTitle : "' . esc_js( __( 'Insert Gridster', 'cbach-wp-gridster' ) ) . '",
			popupTitle  : "' . esc_js( __( 'Choose from your avaiable Gridsters', 'cbach-wp-gridster' ) ) . '",
			changeButton: "' . esc_js( __( 'Change which Gridster to show here.', 'cbach-wp-gridster' ) ) . '",      
			editButton  : "' . esc_js( __( 'Edit this Gridster (will load a new page)', 'cbach-wp-gridster' ) ) . '",
			dellButton  : "' . esc_js( __( 'Delete Gridster-Shortcode', 'cbach-wp-gridster' ) ) . '",
			AjaxNonce   : "' . wp_create_nonce( 'gridster_nonce' ) . '",      
		}
	);';
?>  