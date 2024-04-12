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
 * Description: SimplyIn application. New order handling. 20.03.2024 08.00
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

require_once plugin_dir_path(__FILE__) . 'includes/class-simplyin.php';

function run_simplyin()
{
	$plugin = new SimplyIn();
	$plugin->run();


}

// global $plugin_data, $plugin_version, $woocommerce_version;

// $plugin_data = get_plugin_data(__FILE__);
// $plugin_version = $plugin_data['Version'];
// $woocommerce_version = get_option('woocommerce_version');

run_simplyin();

// function onOrderUpdate($order_id, $old_status, $new_status, $order)
// {

// 	$real_order = wc_get_order($order_id);
// 	error_log('STATUS UPDATE: ' . $order_id);

// 	$order_status = $order->get_status();

// 	$log_message = 'Custom script executed for order ID: ' . $order_id;
// 	$logs_directory = plugin_dir_path(__FILE__) . 'logs/';

// 	$log_file = $logs_directory . 'order_log.log';
// 	// file_put_contents($log_file, $log_message . PHP_EOL, FILE_APPEND);

// 	// file_put_contents($log_file, "order" . $order_id . "old status: " . $old_status . "new status: " . $new_status . PHP_EOL, FILE_APPEND);


// 	// file_put_contents($log_file, $log_message . PHP_EOL, FILE_APPEND);

// 	// file_put_contents($log_file, json_encode($real_order->get_data()), FILE_APPEND);
// 	file_put_contents($log_file, "order" . $order_id . "old status: " . $old_status . "new status: " . $new_status . PHP_EOL, FILE_APPEND);


// 	// tracking
// 	// file_put_contents($log_file, $order->get_items(), FILE_APPEND);
// 	// file_put_contents($log_file, '-------', FILE_APPEND);


// 	echo json_encode($order);



// }

// add_action('woocommerce_order_status_changed', 'onOrderUpdate', 1, 4);










function custom_override_checkout_fields($fields)
{
	$fields['billing']['billing_email'] = array(
		'label' => __('Email', 'woocommerce'),
		'placeholder' => _x('Wprowadź swój email', 'placeholder', 'woocommerce'),
		'required' => true,
		'clear' => false,
		'type' => 'text',
		'id' => 'billing_email',
		'class' => array('my-css'),
		'priority' => 1,
	);
	return $fields;

}
add_filter('woocommerce_checkout_fields', 'custom_override_checkout_fields', 100, 1);

add_action('woocommerce_after_checkout_form', 'load_Simply_React_App');


function load_Simply_React_App()
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


	$shipping_methods = $woocommerce->shipping->get_shipping_methods();
	$apiKey = get_option('simplyin_api_key');
	$inpostApiKey = get_option('simply_inpost_apikey');

	$base_url = home_url();

	$plugin_data = get_plugin_data(__FILE__);
	$plugin_version = $plugin_data['Version'];
	$woocommerce_version = get_option('woocommerce_version');
	wp_localize_script('AppData', 'appLocalizer', [
		"current_user" => wp_get_current_user(),
		"logged_in" => is_user_logged_in(),
		'woocommerce_version' => $woocommerce_version,
		'plugin_version' => $plugin_version,
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
}



function add_checkbox_flag_field()
{
	$checkout = WC()->checkout();

	if (isset($checkout->checkout_fields['extra_fields'])) {
		foreach ($checkout->checkout_fields['extra_fields'] as $key => $field) {
			woocommerce_form_field($key, $field, $checkout->get_value($key));
		}
	}
}
add_action('woocommerce_checkout_after_order_review', 'add_checkbox_flag_field');


function save_Simply_Flag_Checkbox_Value($order_id)
{

	$checkbox_status = isset($_POST['simply-save-checkbox']) && !empty($_POST['simply-save-checkbox']);
	update_post_meta($order_id, 'simply-save-checkbox', $checkbox_status);

}

add_action('woocommerce_checkout_update_order_meta', 'save_Simply_Flag_Checkbox_Value');

add_filter('woocommerce_checkout_get_value', 'on_Start_Clear_Form', 10, 2);

function on_Start_Clear_Form($value, $input)
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
		'billing_tax_id_simply',
		'_billing_tax_id_simply',
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

function taxIdFieldTranslate($string)
{
	$translations = array(
		'pl_PL' => array(
			'Tax ID' => 'Numer identyfikacji podatkowej (NIP)',
			'Enter your Tax ID' => 'Wprowadź swój numer NIP',
		),
		'en_US' => array(
			'Tax ID' => 'Tax ID',
			'Enter your Tax ID' => 'Enter your Tax ID',
		),
	);

	$locale = get_locale();
	if (isset($translations[$locale][$string])) {
		return $translations[$locale][$string];
	} else {
		return $string; // Fallback to English if no translation found
	}
}

function add_tax_id_to_billing($fields)
{
	$fields['billing']['billing_tax_id_simply'] = array(
		'type' => 'text',
		'label' => taxIdFieldTranslate('Tax ID'),
		'placeholder' => taxIdFieldTranslate('Enter your Tax ID'),
		'required' => false,
		'class' => array('form-row-wide'),
	);
	$fields['billing']['simplyinTokenInput'] = array(
		'type' => 'hidden',
		'class' => array('input-hidden'),
		'label' => __('Simply Token Input'),
	);

	$fields['extra_fields']['simply-save-checkbox'] = array(
		'type' => 'checkbox',
		'label' => __('My Checkbox Field Label', 'myplugin'),
		'required' => false,
		'class' => array('form-row-wide'),
		'clear' => true
	);
	$fields['extra_fields']['simply_tax_label_id'] = array(
		'type' => 'text',
		'label' => __('simply_tax_label_id'),
		'required' => false,
		'class' => array('form-row-wide'),
		'clear' => true
	);
	$fields['extra_fields']['simply_billing_id'] = array(
		'type' => 'text',
		'label' => __('simply_billing_id'),
		'required' => false,
		'class' => array('form-row-wide'),
		'clear' => true
	);
	$fields['extra_fields']['simply_shipping_id'] = array(
		'type' => 'text',
		'label' => __('simply_shipping_id'),
		'required' => false,
		'class' => array('form-row-wide'),
		'clear' => true
	);

	return $fields;
}

add_filter('woocommerce_checkout_fields', 'add_tax_id_to_billing');


add_action('wp_head', 'custom_checkout_css');

function custom_checkout_css()
{
	?>
	<style>
		#simplyinTokenInput_field {
			display: none;
		}

		#simply_tax_label_id_field, #simply_billing_id_field, #simply_shipping_id_field{
			display: none;
		}
	</style>
	<?php
}





add_action('woocommerce_checkout_update_order_meta', 'save_tax_id_to_order');

function save_tax_id_to_order($order_id)
{
	if (!empty($_POST['billing_tax_id_simply'])) {
		update_post_meta($order_id, '_billing_tax_id_simply', sanitize_text_field($_POST['billing_tax_id_simply']));
	}

	if (!empty($_POST['simplyinTokenInput'])) {
		update_post_meta($order_id, '_simplyinTokenInput', sanitize_text_field($_POST['simplyinTokenInput']));
	}
	if (!empty($_POST['simply_tax_label_id'])) {
		update_post_meta($order_id, '_simply_tax_label_id', sanitize_text_field($_POST['simply_tax_label_id']));
	}
	if (!empty($_POST['simply_billing_id'])) {
		update_post_meta($order_id, '_simply_billing_id', sanitize_text_field($_POST['simply_billing_id']));
	}
	if (!empty($_POST['simply_shipping_id'])) {
		update_post_meta($order_id, '_simply_shipping_id', sanitize_text_field($_POST['simply_shipping_id']));
	}
	if (!empty($_POST['phoneAppInputField'])) {
		update_post_meta($order_id, '_phoneAppInputField', sanitize_text_field($_POST['phoneAppInputField']));
	}
	update_post_meta($order_id, '_simply-save-checkbox', sanitize_text_field($_POST['simply-save-checkbox']));

}




function add_custom_string_to_order_details_customer($order)
{

	$billing_tax_id = get_post_meta($order->id, '_billing_tax_id_simply', true);

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
	if ($_POST['billing_tax_id_simply']) {
		update_post_meta($order_id, 'billing_tax_id_simply', sanitize_text_field($_POST['billing_tax_id_simply']));
	}
}

add_action('woocommerce_admin_order_data_after_billing_address', 'display_custom_order_data');

function display_custom_order_data($order)
{
	$billing_tax_id = get_post_meta($order->get_id(), 'billing_tax_id_simply', true);
	if (!empty($billing_tax_id)) {
		echo '<p><strong>Tax ID:</strong> ' . esc_html($billing_tax_id) . '</p>';
	}
}


function customRestApiEndpoint()
{
	register_rest_route(
		'simplyin',
		'/data/',
		array(
			'methods' => array('GET', 'POST'),
			'callback' => 'customRestApiCallback',
		)
	);
}
$simplyin_config = array(
	'backendSimplyIn' => 'https://dev.backend.simplyin.app/api/',
);
function customRestApiCallback()
{
	global $simplyin_config;

	$base_url = home_url();
	$headers = array('Content-Type: application/json', 'Origin: ' . $base_url);
	// $headers = array('Content-Type: application/json');
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

	update_option('Backend_SimplyIn', $simplyin_config['backendSimplyIn']);

	if (!empty($token)) {
		$url = $simplyin_config['backendSimplyIn'] . $endpoint . '?api_token=' . urlencode($token);
	} else {
		$url = $simplyin_config['backendSimplyIn'] . $endpoint;
	}

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

add_action('rest_api_init', 'customRestApiEndpoint');



function sendPostRequest($bodyData, $endpoint, $token)
{

	$merchantToken = get_option('simplyin_api_key');

	if (empty($merchantToken)) {
		http_response_code(400);  // Bad Request
		echo "Error: Simplyin API key is empty";
		return;
	}
	$bodyData['merchantApiKey'] = $merchantToken;

	// $headers = array('Content-Type: application/json');
	$base_url = home_url();
	$headers = array('Content-Type: application/json', 'Origin: ' . $base_url);

	global $simplyin_config;
	update_option('Backend_SimplyIn', $simplyin_config['backendSimplyIn']);
	if (!empty($token)) {
		$url = $simplyin_config['backendSimplyIn'] . $endpoint . '?api_token=' . urlencode($token);
	} else {
		$url = $simplyin_config['backendSimplyIn'] . $endpoint;
	}

	// Convert data to JSON format
	$jsonData = json_encode($bodyData);


	print_r($jsonData);
	// Initialize cURL session
	$ch = curl_init();

	// Set cURL options
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_POST, 1);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonData);
	curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); // Return the response as a string instead of outputting it

	// Execute cURL session
	$response = curl_exec($ch);


	// $log_message = $jsonData;

	// $logs_directory = plugin_dir_path(__FILE__) . 'logs/';

	// $log_file = $logs_directory . 'order_log.log';
	// file_put_contents($log_file, $log_message . PHP_EOL, FILE_APPEND);



	// Check for cURL errors
	if (curl_errno($ch)) {
		echo 'Curl error: ' . curl_error($ch);
	}

	// Close cURL session
	curl_close($ch);

	print_r($response);

	// Return the response
	return $response;
}

add_action('woocommerce_checkout_order_created', 'onOrderCreate', 10, 3);

function onOrderCreate($order)
{


	global $woocommerce;

	$items_data = [];
	if ($order) {
		$items = $order->get_items();
		foreach ($items as $item) {
			$product_id = $item->get_product_id();
			$product = wc_get_product($product_id);
			$items_data[] = [
				'name' => $item->get_name(),
				'url' => get_permalink($product_id),
				'price' => (float) $order->get_item_total($item),
				'quantity' => $item->get_quantity(),
				'thumbnailUrl' => wp_get_attachment_image_url($product->get_image_id(), 'thumbnail') ?? "",
				"currency" => $order->get_currency(),
			];
		}
	}


	$phoneAppInputField = isset($_POST['phoneAppInputField']) ? sanitize_text_field($_POST['phoneAppInputField']) : '';

	//user authToken
	$simplyin_Token_Input_Value = isset($_POST['simplyinTokenInput']) ? sanitize_text_field($_POST['simplyinTokenInput']) : '';
	//create new account checkbox
	$create_new_accountVal = isset($_POST['simply-save-checkbox']) ? sanitize_text_field($_POST['simply-save-checkbox']) : '';
	//parcel machine id
	$parcel_machine_id = isset($_POST['parcel_machine_id']) ? sanitize_text_field($_POST['parcel_machine_id']) : '';
	//identify custom or default tax id field
	$custom_tax_field_id = isset($_POST['simply_tax_label_id']) ? sanitize_text_field($_POST['simply_tax_label_id']) : '';
	$simply_billing_id = isset($_POST['simply_billing_id']) ? sanitize_text_field($_POST['simply_billing_id']) : '';
	$simply_shipping_id = isset($_POST['simply_shipping_id']) ? sanitize_text_field($_POST['simply_shipping_id']) : '';
	//get tax id from field in form
	$taxId = isset($_POST[$custom_tax_field_id]) ? sanitize_text_field($_POST[$custom_tax_field_id]) : '';

	$plugin_data = get_plugin_data(__FILE__);
	$plugin_version = $plugin_data['Version'];
	$woocommerce_version = get_option('woocommerce_version');

	if ($create_new_accountVal === "on" && empty($simplyin_Token_Input_Value)) {
		echo 'new account';
		$locale = get_locale();
		$languageCode = strtoupper(substr($locale, 0, 2));

		$body_data = array(
			"newAccountData" => array(
				"name" => $order->get_billing_first_name(),
				"surname" => $order->get_billing_last_name(),
				"phoneNumber" => $phoneAppInputField,
				"email" => $order->get_billing_email(),
				"uniqueId" => "string",
				"language" => $languageCode,
				"marketingConsent" => false,
			),
			"newOrderData" => array(
				"price" => (float) $order->get_total(),
				"currency" => $order->get_currency(),
				"items" => $items_data,
				"placedDuringAccountCreation" => true,
				"billingData" => array(
					"icon" => "🏡",
					"addressName" => "",
					"name" => $order->get_billing_first_name(),
					"surname" => $order->get_billing_last_name(),
					"street" => $order->get_billing_address_1(),
					"appartmentNumber" => $order->get_billing_address_2(),
					"city" => $order->get_billing_city(),
					"postalCode" => $order->get_billing_postcode(),
					"country" => $order->get_billing_country(),
					"state" => $order->get_billing_state(),
					"companyName" => $order->get_billing_company(),
					"taxId" => $taxId
				),

				"shopName" => get_bloginfo('name'),
				"pluginVersion" => $plugin_version,
				"shopVersion" => $woocommerce_version,
				"shopUserEmail" => wp_get_current_user()->data->user_email ?? ''
			),
		);

		if (!empty($parcel_machine_id)) {
			$body_data["newOrderData"]["parcelLockerMinimalInfo"] = array(
				"lockerId" => $parcel_machine_id,
				"providerName" => "inpost"
			);
		}
		if (empty($parcel_machine_id)) {
			$body_data["newOrderData"]["shippingData"] = array(
				"icon" => "🏡",
				"addressName" => "",
				"name" => $order->get_shipping_first_name(),
				"surname" => $order->get_shipping_last_name(),
				"street" => $order->get_shipping_address_1(),
				"appartmentNumber" => $order->get_shipping_address_2(),
				"city" => $order->get_shipping_city(),
				"postalCode" => $order->get_shipping_postcode(),
				"country" => $order->get_shipping_country(),
				"state" => $order->get_shipping_state(),
				"companyName" => $order->get_shipping_company(),
			);
		}

		sendPostRequest($body_data, 'checkout/createOrderAndAccount', "");
	}

	if (isset($simplyin_Token_Input_Value) && $simplyin_Token_Input_Value !== "") {
		echo 'simplyin_Token_Input_Value HAS VALUE: ' . $simplyin_Token_Input_Value;

		$body_data = array(
			"newOrderData" => array(
				"price" => (float) $order->get_total(),
				"currency" => $order->get_currency(),
				"items" => $items_data,
				"placedDuringAccountCreation" => false,
				"billingData" =>
					array(
						"_id" => $simply_billing_id,
						"name" => $order->get_billing_first_name(),
						"surname" => $order->get_billing_last_name(),
						"street" => $order->get_billing_address_1(),
						"appartmentNumber" => $order->get_billing_address_2(),
						"city" => $order->get_billing_city(),
						"postalCode" => $order->get_billing_postcode(),
						"country" => $order->get_billing_country(),
						"state" => $order->get_billing_state(),
						"companyName" => $order->get_billing_company(),
						"taxId" => $taxId
					),

				"shopName" => get_bloginfo('name'),
				"pluginVersion" => $plugin_version,
				"shopVersion" => $woocommerce_version,
				"shopUserEmail" => wp_get_current_user()->data->user_email ?? "",

			),
		);

		if (!empty($parcel_machine_id)) {
			$body_data["newOrderData"]["parcelLockerMinimalInfo"] = array(
				"lockerId" => $parcel_machine_id,
				"providerName" => "inpost"
			);
		}
		if (empty($parcel_machine_id)) {
			$body_data["newOrderData"]["shippingData"] = array(
				"_id" => $simply_shipping_id,
				"icon" => "🏡",
				"addressName" => "",
				"name" => $order->get_shipping_first_name(),
				"surname" => $order->get_shipping_last_name(),
				"street" => $order->get_shipping_address_1(),
				"appartmentNumber" => $order->get_shipping_address_2(),
				"city" => $order->get_shipping_city(),
				"postalCode" => $order->get_shipping_postcode(),
				"country" => $order->get_shipping_country(),
				"state" => $order->get_shipping_state(),
				"companyName" => $order->get_shipping_company(),
			);
		}

		sendPostRequest($body_data, 'checkout/createOrderWithoutAccount', $simplyin_Token_Input_Value);

		

	}


}

