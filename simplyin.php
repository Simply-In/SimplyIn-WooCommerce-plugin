<?php

/**
 *
 * @link              https://simply.in
 * @since             1.0.0
 * @package           Simplyin
 *
 * @wordpress-plugin
 * Plugin Name: SimplyIn  
 * Plugin URI:       
 * Description: SimplyIn application. 26.01.2024 17.00
 * Version:           1.0.0
 * Author:            Simply.in
 * Author URI:        https://simply.in
 * License:           GPL-2.0+
 * Domain Path:       /languages
 */


if (!defined('WPINC')) {
	die;
}
define('SIMPLYIN_VERSION', '1.0.0');

require plugin_dir_path(__FILE__) . 'includes/class-simplyin.php';

function run_simplyin()
{
	$plugin = new SimplyIn();
	$plugin->run();
	
	
}





run_simplyin();


add_action('wp_ajax_my_plugin_function', 'my_plugin_function');
add_action('wp_ajax_nopriv_my_plugin_function', 'my_plugin_function');


$ajaxurl = admin_url('admin-ajax.php');


add_action('woocommerce_before_customer_login_form', 'beforeLogin');


function hook_tschaki_ajax()
{
	wp_enqueue_script('script-checker', plugin_dir_url(__FILE__) . 'js/script-checker.js');
	wp_localize_script(
		'script-checker',
		'account_script_checker',
		array(
			'ajaxurl' => admin_url('admin-ajax.php'),
			'fail_message' => __('Connection to server failed. Check the mail credentials.', 'script-checker'),
			'success_message' => __('Connection successful. ', 'script-checker')
		)
	);
}
add_action('enqueue_scripts', 'hook_tschaki_ajax');
add_action('admin_enqueue_scripts', 'hook_tschaki_ajax');



function custom_override_checkout_fields($fields)
{
	$fields['billing']['billing_email'] = array(
		'label' => __('Email', 'woocommerce'),
		'placeholder' => _x('Wprowadź swój email. 🤠🙈💥', 'placeholder', 'woocommerce'),
		'required' => false,
		'clear' => false,
		'type' => 'text',
		'id' => 'billing_email',
		'class' => array('my-css'),
		'priority' => 1,
	);
	return $fields;

}
add_filter('woocommerce_checkout_fields', 'custom_override_checkout_fields', 100, 1);

add_action('woocommerce_after_checkout_form', 'load_scripts');


function load_scripts()
{
	wp_enqueue_script(
		'AppData',
		plugin_dir_url(__FILE__) . 'public/dist/bundle.js',
		['jquery', 'wp-element'],
		wp_rand(),
		true
	);


	global $woocommerce;

	$shipping_methods = $woocommerce->shipping->load_shipping_methods();

	$methods = array();

	
	foreach ($shipping_methods as $method) {
		
		$methods[] = array(
			
			"id" => $method->id,
			"title" => $method->title,
			"method_title" => $method->method_title,
			"method_description" => $method->method_description,
			"instance_id" => $method->instance_id,
			"enabled" => $method->enabled,
			"tax_status" => $method->tax_status,
			"shipping_zone_id" => $method->instance_id,
			"plugin_id" => $method->plugin_id,
			"settings" => $method->settings,


		);
	}


	$zones = \WC_Shipping_Zones::get_zones();

	$shipping_titles = array();
	foreach ($zones as $zone) {
		$shipping = $zone['shipping_methods'];

		foreach ($shipping as $method) {
			$shipping_titles[] = $method->get_title();
		}
	}
	// $shipping_methodsss = WC()->shipping()->get_shipping_methods();

	$shipping_methods = $woocommerce->shipping->get_shipping_methods();
	$apiKey = get_option('simplyin_api_key');
	$inpostApiKey = get_option('simply_inpost_apikey');

	$base_url = home_url();


	wp_localize_script('AppData', 'appLocalizer', [
		'apiUrl' => home_url('/wp-json'),
		'nonce' => wp_create_nonce('wp_rest'),
		'language' => get_locale(),
		'shippingMethods' => $methods,
		'apiKey' => $apiKey,
		'inpostApiKey' => $inpostApiKey,
		'shipping' => $shipping_titles,
		'base_url' => $base_url,
		'plugin_url' => plugin_dir_url(__FILE__)
	]);





	// print_r($shipping_methods);
}

add_action('woocommerce_thankyou', 'enqueue_and_localize_order_created_script', 10);
// echo plugin_dir_url(__FILE__) . 'public/dist/bundle.js';
function enqueue_and_localize_order_created_script($order_id)
{

	$order = wc_get_order($order_id);


	foreach ($order->get_items('shipping') as $item_id => $shipping_item_obj) {
		$item_data = $shipping_item_obj->get_data();
	}

	$base_url = home_url();

	// $parcel_machine_parcel_sizes = $shipx_api->get_parcel_machine_parcel_sizes();
	$billing_tax_id = get_post_meta($order_id, '_billing_tax_id', true);

	$myplugin_checkbox_value = get_post_meta($order_id, 'simply-save-checkbox', true);
	$currentShopUrl = wc_get_page_permalink('shop');
	$order_data = array(
		'base_url' => $base_url,
		'create_new_account' => $myplugin_checkbox_value,
		'order_id' => $order_id,
		'total' => $order->get_total(),
		'date_created' => $order->get_date_created()->date('Y-m-d H:i:s'),
		'billingAddresses' => array(
			'first_name' => $order->get_billing_first_name(),
			'last_name' => $order->get_billing_last_name(),
			'email' => $order->get_billing_email(),
			'phone' => $order->get_billing_phone(),
			'address_1' => $order->get_billing_address_1(),
			'address_2' => $order->get_billing_address_2(),
			'city' => $order->get_billing_city(),
			'state' => $order->get_billing_state(),
			'postcode' => $order->get_billing_postcode(),
			'companyName' => $order->get_billing_company(),
			'country' => $order->get_billing_country(),
			'tax_id' => $billing_tax_id
		),
		'shippingAddresses' => array(
			'first_name' => $order->get_shipping_first_name(),
			'last_name' => $order->get_shipping_last_name(),
			'address_1' => $order->get_shipping_address_1(),
			'address_2' => $order->get_shipping_address_2(),
			'city' => $order->get_shipping_city(),
			'state' => $order->get_shipping_state(),
			'postcode' => $order->get_shipping_postcode(),
			'companyName' => $order->get_shipping_company(),
			'country' => $order->get_shipping_country(),

		),
		'line_items' => array(),
		'payment_method' => $order->get_payment_method_title(),
		'shipping_method' => $item_data,
		'order' => $order->get_shipping_company(),
		'orderTotal' => $order->get_data(),
		'language' => get_locale(),
		'shopName' => get_bloginfo('name'),
		'shopUrl' => $currentShopUrl
	);

	foreach ($order->get_items() as $item_id => $item) {
		$product = $item->get_product();
		$order_data['line_items'][] = array(
			'product_id' => $item->get_product_id(),
			'name' => $item->get_name(),
			'quantity' => $item->get_quantity(),
			'price' => $order->get_item_total($item),
			'subtotal' => $item->get_subtotal(),
			'total' => $item->get_total(),
			'image_url' => wp_get_attachment_image_url($product->get_image_id(), 'thumbnail'),
			'product_url' => $product->get_permalink(),
			'product' => $product->get_data(),
		);
	}

	wp_enqueue_script(
		'order-created',
		plugin_dir_url(__FILE__) . 'includes/js/order-created.js',
		array('jquery'),
		'1.0.0',
		true
	);

	wp_localize_script('order-created', 'orderData', $order_data);
}


function myplugin_add_checkout_checkbox_field($checkout_fields)
{
	$checkout_fields['extra_fields'] = array(
		'simply-save-checkbox' => array(
			'type' => 'checkbox',
			'label' => __('My Checkbox Field Label', 'myplugin'),
			'required' => false,
			'class' => array('form-row-wide'),
			'clear' => true
		),

	);

	return $checkout_fields;
}

add_filter('woocommerce_checkout_fields', 'myplugin_add_checkout_checkbox_field');

function myplugin_display_checkout_checkbox_field()
{
	$checkout = WC()->checkout();

	if (isset($checkout->checkout_fields['extra_fields'])) {
		foreach ($checkout->checkout_fields['extra_fields'] as $key => $field) {
			woocommerce_form_field($key, $field, $checkout->get_value($key));
		}
	}
}
add_action('woocommerce_checkout_after_order_review', 'myplugin_display_checkout_checkbox_field');


function myplugin_save_checkout_checkbox_value($order_id)
{

	$checkbox_status = isset($_POST['simply-save-checkbox']) && !empty($_POST['simply-save-checkbox']);
	update_post_meta($order_id, 'simply-save-checkbox', $checkbox_status);

}

add_action('woocommerce_checkout_update_order_meta', 'myplugin_save_checkout_checkbox_value');


add_action('woocommerce_after_order_notes', 'add_phone_token_input_field');

function add_phone_token_input_field($checkout)
{
	echo '<div id="simply_token_input_field" style="visibility: hidden" ><h2>' . __('Simply Token') . '</h2>';
	woocommerce_form_field('simplyinTokenInput', array(
		'type' => 'hidden',
		'class' => array('input-hidden'),
		'label' => __('Simply Token Input'),
	), $checkout->get_value('simplyinTokenInput'));
	echo '</div>';
	echo '<div id="phone_token_input_field" style="visibility: hidden" ><h2>' . __('Phone Token') . '</h2>';
	woocommerce_form_field('simplyinPhoneTokenInput', array(
		'type' => 'hidden',
		'class' => array('input-hidden'),
		'label' => __('Phone Token Input'),
	), $checkout->get_value('simplyinTokenInput'));
	echo '</div>';
}


add_filter('woocommerce_checkout_get_value', 'bks_remove_values', 10, 2);

function bks_remove_values($value, $input)
{
	$item_to_set_null = array(
		'billing_first_name',
		'billing_last_name',
		'billing_company',
		'billing_address_1',
		'billing_address_2',
		'billing_city',
		'billing_postcode',
		'billing_country',
		'billing_state',
		'billing_email',
		'billing_phone',
		'billing_tax_id',
		'tax_id',
		'shipping_first_name',
		'shipping_last_name',
		'shipping_company',
		'shipping_address_1',
		'shipping_address_2',
		'shipping_city',
		'shipping_postcode',
		'shipping_country',
		'shipping_state',
	);

	if (in_array($input, $item_to_set_null)) {
		$value = '';
	}

	return $value;
}


// function reset_default_shipping_method()
// {

// 	$available_methods = WC()->shipping->packages[0]['rates'];

// 	print_r($available_methods);


// 	// $chosen_method = key($available_methods);
// 	// WC()->session->set( 'chosen_shipping_methods', $chosen_method );

// }
// add_action('woocommerce_shipping_method_chosen', 'reset_default_shipping_method');



// Step 1: Add the "Tax ID" field to the billing section of the checkout page
add_filter('woocommerce_checkout_fields', 'add_tax_id_to_billing');

function add_tax_id_to_billing($fields)
{
	$fields['billing']['billing_tax_id'] = array(
		'type' => 'text',
		'label' => __('Tax ID', 'woocommerce'),
		'placeholder' => __('Enter your Tax ID', 'woocommerce'),
		'required' => false,
		// You can change this to true if you want it to be required
		'class' => array('form-row-wide'),
	);

	return $fields;
}



// Step 2: Save the "Tax ID" field data to the order
add_action('woocommerce_checkout_update_order_meta', 'save_tax_id_to_order');

function save_tax_id_to_order($order_id)
{
	if (!empty($_POST['billing_tax_id'])) {
		update_post_meta($order_id, '_billing_tax_id', sanitize_text_field($_POST['billing_tax_id']));
	}
}




function add_custom_string_to_order_details_customer($order)
{

	$billing_tax_id = get_post_meta($order->id, '_billing_tax_id', true);

	echo '<script>const areaname = document.querySelector(".woocommerce-column--billing-address").querySelector(".woocommerce-customer-details--email");
	const newNode = document.createElement("div");
	const taxIdText =  "tax id: " + ' . json_encode($billing_tax_id) . ' 
	newNode.innerText=taxIdText;
	areaname.parentNode.appendChild(newNode);
	</>';
}
add_action('woocommerce_order_details_after_customer_details', 'add_custom_string_to_order_details_customer', 10, 1);

add_action('woocommerce_checkout_update_order_meta', 'save_custom_checkout_field');

function save_custom_checkout_field($order_id)
{
	if ($_POST['billing_tax_id']) {
		update_post_meta($order_id, 'billing_tax_id', sanitize_text_field($_POST['billing_tax_id']));
	}
}

add_action('woocommerce_admin_order_data_after_billing_address', 'display_custom_order_data');

function display_custom_order_data($order)
{
	$billing_tax_id = get_post_meta($order->get_id(), 'billing_tax_id', true);
	if (!empty($billing_tax_id)) {
		echo '<p><strong>Tax ID:</strong> ' . esc_html($billing_tax_id) . '</p>';
	}
}


function custom_rest_api_endpoint()
{
	register_rest_route(
		'simplyin',
		'/data/',
		array(
			'methods' => array('GET', 'POST'),
			'callback' => 'custom_rest_api_callback',
		)
	);
}

function custom_rest_api_callback($data)
{

	$data = json_decode(file_get_contents("php://input"), true);
	$endpoint = $data['endpoint'];
	$method = strtoupper($data['method']);
	$body = $data['requestBody'];

	if (isset($data['token'])) {
		$token = $data['token'];
	} else {
		$token = '';
	}

	$apiKey = get_option('simplyin_api_key');

	if (empty($apiKey)) {
		http_response_code(400);  // Bad Request
		echo "Error: Simplyin API key is empty";
		return;
	}

	$body['apiKey'] = $apiKey;



	if (empty($apiKey)) {
		echo "Simplyin apikey is empty";
		return;
	}


	$Backend_SimplyIn = 'https://dev.backend.simplyin.app/api/';
	update_option('Backend_SimplyIn', $Backend_SimplyIn);

	if (!empty($token)) {
		$url = $Backend_SimplyIn . $endpoint . '?api_token=' . urlencode($token);
	} else {
		$url = $Backend_SimplyIn . $endpoint;
	}




	$headers = array('Content-Type: application/json');
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $url);

	switch ($method) {
		case 'GET':
			curl_setopt($ch, CURLOPT_HTTPGET, 1);
			break;
		case 'POST':
			curl_setopt($ch, CURLOPT_POST, 1);
			break;
		case 'PATCH':
			curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PATCH');
			break;
		default:
			break;
	}

	curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
	curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

	$response = curl_exec($ch);

	curl_close($ch);
	echo $response;
}

add_action('rest_api_init', 'custom_rest_api_endpoint');