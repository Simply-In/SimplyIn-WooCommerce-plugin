<?php

/**
 *
 * @link              https://simply.in
 * @since             1.0.0
 * @package           SimplyIN
 *
 * @wordpress-plugin
 * Plugin Name: SimplyIN
 * Plugin URI:       
 * Description: SimplyIN application st 
 * Version:           2.1.0 

 

 * Author:            Simply.IN Sp. z o.o.
 * Author URI:        https://simply.in
 * License:           https://joinup.ec.europa.eu/software/page/eupl
 * Domain Path:       /languages
 */


if (!defined('WPINC')) {
	die;
}

define('CONTENT_TYPE_JSON', 'Content-Type: application/json');

require_once plugin_dir_path(__FILE__) . 'includes/class-simplyin.php';

$env = parse_ini_file('.env');

$backendEnvironment = $env['BACKEND_ENVIRONMENT_STAGE'];



$simplyin_plugin = new SimplyIn();
$simplyin_plugin->run();


$simplyin_config = array(
	'backendSimplyIn' => $backendEnvironment,
);

function send_encrypted_data($encrypted_data)
{
	global $simplyin_config;
	update_option('Backend_SimplyIn', $simplyin_config['backendSimplyIn']);

	$url = $simplyin_config['backendSimplyIn'] . 'encryption/saveEncryptedOrderStatusChange';


	$base_url = home_url();
	$headers = array(CONTENT_TYPE_JSON, 'Origin: ' . $base_url);


	$ch = curl_init();

	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_POST, 1);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $encrypted_data);
	curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); // Return the response as a string instead of outputting it

	// Execute cURL session
	// $response = curl_exec($ch);



	curl_close($ch);

}

function onOrderUpdate($order_id, $old_status, $new_status, $order)
{

	$stopStatuses = [
		"processing",
		"pending",
		"on-hold",
		"",
		"cancelled",
		"refunded",
		"failed",
		"checkout-draft",
	];
	if (in_array($new_status, $stopStatuses, true)) {
		return;
	}


	$order_data = $order->get_data();
	$order_email = $order_data['billing']['email'];



	if (empty($order_email)) {
		return;
	}

	$order_items = $order->get_items();

	$_order_id = $order->get_id(); // Assuming $order is an instance of WC_Order


	$order = wc_get_order($_order_id); // Get an instance of the WC_Order object
	$order_items = $order->get_items();

	$tracking_numbers = [];

	if ($order_items) {
		foreach ($order_items as $item_id => $item) {
			$data = json_decode($item->get_meta('_vi_wot_order_item_tracking_data'), true);
			foreach ($data as $item) {
				if (isset($item['tracking_number'])) {
					$tracking_numbers[] = array(
						"number" => $item['tracking_number'],
						"provider" => $item['carrier_slug'] ?? ""
					);
				}
			}
		}
	}


	$shipment_tracking_items = $order->get_meta('_wc_shipment_tracking_items');

	if (is_array($shipment_tracking_items)) {
		foreach ($shipment_tracking_items as $item) {
			if (isset($item['tracking_number'])) {
				$tracking_numbers[] = array(
					"number" => $item['tracking_number'],
					"provider" => $item['carrier_slug'] ?? ""
				);
			}
		}
	}

	if ($order_items) {
		foreach ($order_items as $item_id => $item) {
			$data = json_encode($item->get_meta('_vi_wot_order_item_tracking_data'), true);
			foreach ($data as $item) {
				if (isset($item['tracking_number'])) {
					$tracking_numbers[] = array(
						"number" => $item['tracking_number'],
						"provider" => $item['carrier_slug'] ?? ""
					);
				}
			}
		}
	}


	$delimiter = "[{;;}]";
	$apiKey = get_option('simplyin_api_key');
	$parts = explode($delimiter, $apiKey);

	$secretKey = $parts[0];
	$publicKey = $parts[1];

	if (empty($publicKey)) {
		$body_data = array(
			"email" => $order_email,
			"shopOrderNumber" => $order_data['id'],
			"newOrderStatus" => $new_status,
			"merchantApiKey" => $secretKey,
			"trackings" => $tracking_numbers
		);

	} else {
		$signature = generateSignature();
		$body_data = array(
			"email" => $order_email,
			"shopOrderNumber" => $order_data['id'],
			"newOrderStatus" => $new_status,
			"signature" => $signature,
			"trackings" => $tracking_numbers
		);
	}



	$plaintext = json_encode($body_data);

	function encryptSimplyIn($plaintext, $secret_key, $cipher = "aes-256-cbc")
	{
		$ivlen = openssl_cipher_iv_length($cipher);
		$iv = openssl_random_pseudo_bytes($ivlen);

		$ciphertext_raw = openssl_encrypt($plaintext, $cipher, $secret_key, OPENSSL_RAW_DATA, $iv);
		if ($ciphertext_raw === false) {
			return false;
		}

		return base64_encode($iv . $ciphertext_raw);
	}



	function decryptSimplyIn($ciphertext, $secret_key, $cipher = "aes-256-cbc")
	{ {
			$ciphertext_raw = base64_decode($ciphertext);
			if ($ciphertext_raw === false) {
				return false; // Failed to base64 decode ciphertext
			}

			$plaintext = openssl_decrypt($ciphertext_raw, $cipher, $secret_key, OPENSSL_RAW_DATA);
			if ($plaintext === false) {
				return false; // Failed to decrypt
			}

			return $plaintext;
		}
	}



	function hashEmail($order_email)
	{
		return hash('sha256', "--" . $order_email . "--"); // Get raw binary output
	}
	function getSecretKey($order_email)
	{
		return hash('sha256', "__" . $order_email . "__", true); // Get raw binary output
	}


	$key = getSecretKey($order_email);

	$encryptedData = encryptSimplyIn($plaintext, $key);


	$hashedEmail = hashEmail($order_email);

	$orderData =
		array(
			"encryptedOrderStatusChangeContent" => $encryptedData,
			"hashedEmail" => $hashedEmail
		);

	send_encrypted_data(json_encode($orderData));

}

add_action('woocommerce_order_status_changed', 'onOrderUpdate', 1, 4);

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
		'inpostApiKey' => $inpostApiKey,
		'shipping' => $shipping_titles,
		'base_url' => $base_url,
		'plugin_url' => plugin_dir_url(__FILE__),
		'test' => getenv('BACKEND_ENVIRONMENT')
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
	update_post_meta($order_id, 'simply-save-checkbox', $checkbox_status); // depricated
        $order = wc_get_order($order_id); 
        $order->update_meta_data('simply-save-checkbox',$checkbox_status);
        $order->save_meta_data();

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
	$register_by_default = get_option('register_by_default');


	$fields['extra_fields']['simply-save-checkbox'] = array(
		'type' => 'checkbox',
		'label' => __('My Checkbox Field Label', 'myplugin'),
		'required' => false,
		'class' => array('form-row-wide'),
		'clear' => true,
		'id' => 'simply-save-checkbox',
		'default' => $register_by_default == 'on' ? '1' : '0'
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

		#simply-save-checkbox,
		#simply_tax_label_id_field,
		#simply_billing_id_field,
		#simply_shipping_id_field {
			display: none;
		}
	</style>
	<?php
}





add_action('woocommerce_checkout_update_order_meta', 'save_tax_id_to_order');

function save_tax_id_to_order($order_id)
{
        $order = wc_get_order( $order_id );
        
	if (!empty($_POST['billing_tax_id_simply'])) {
		update_post_meta($order_id, '_billing_tax_id_simply', sanitize_text_field($_POST['billing_tax_id_simply'])); // deprecated
                $order->update_meta_data('_billing_tax_id_simply',sanitize_text_field($_POST['billing_tax_id_simply']));
	}

	if (!empty($_POST['simplyinTokenInput'])) {
		update_post_meta($order_id, '_simplyinTokenInput', sanitize_text_field($_POST['simplyinTokenInput']));// depricated
                $order->update_meta_data('_simplyinTokenInput',sanitize_text_field($_POST['simplyinTokenInput']));
	}
	if (!empty($_POST['simply_tax_label_id'])) {
		update_post_meta($order_id, '_simply_tax_label_id', sanitize_text_field($_POST['simply_tax_label_id']));// depricated
                $order->update_meta_data('_simply_tax_label_id',sanitize_text_field($_POST['simply_tax_label_id']));
	}
	if (!empty($_POST['simply_billing_id'])) {
		update_post_meta($order_id, '_simply_billing_id', sanitize_text_field($_POST['simply_billing_id']));// depricated
                $order->update_meta_data('_simply_billing_id',sanitize_text_field($_POST['simply_billing_id']));
	}
	if (!empty($_POST['simply_shipping_id'])) {
		update_post_meta($order_id, '_simply_shipping_id', sanitize_text_field($_POST['simply_shipping_id']));// depricated
                $order->update_meta_data('_simply_shipping_id',sanitize_text_field($_POST['simply_shipping_id']));
	}
	if (!empty($_POST['phoneAppInputField'])) {
		update_post_meta($order_id, '_phoneAppInputField', sanitize_text_field($_POST['phoneAppInputField']));// depricated
                $order->update_meta_data('_phoneAppInputField',sanitize_text_field($_POST['phoneAppInputField']));
	}
        
        $aimplyin_save_checkbox = isset($_POST['simply-save-checkbox']) ? $_POST['simply-save-checkbox'] : false;
        
	update_post_meta($order_id, '_simply-save-checkbox', sanitize_text_field($aimplyin_save_checkbox)); // depricated
        $order->update_meta_data('_simply-save-checkbox',sanitize_text_field($aimplyin_save_checkbox));
        $order->save_meta_data();

}




function add_custom_string_to_order_details_customer($order)
{

	$billing_tax_id = get_post_meta($order->get_id(), '_billing_tax_id_simply', true);

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
                $order = wc_get_order( $order_id );
                $order->update_meta_data('billing_tax_id_simply',sanitize_text_field($_POST['billing_tax_id_simply']));
                $order->save_meta_data();
		update_post_meta($order_id, 'billing_tax_id_simply', sanitize_text_field($_POST['billing_tax_id_simply'])); //depricated
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
			'permission_callback' => '__return_true'
		)
	);
}



function generateSignature()
{

	global $simplyin_config;
	$apiKey = get_option('simplyin_api_key');


	if (empty($apiKey)) {
		http_response_code(400);  // Bad Request
		echo "Error: Simplyin API key is empty";
		return;
	}


	$base_url = home_url();

	$headers = array(CONTENT_TYPE_JSON, 'Origin: ' . $base_url);

	$delimiter = "[{;;}]";
	$parts = explode($delimiter, $apiKey);

	$secretKey = $parts[0];
	$publicKey = $parts[1];

	$endpoint = "checkout/generateNonce";
	$url = $simplyin_config['backendSimplyIn'] . $endpoint;

	$ch = curl_init();


	$body['publicKey'] = $publicKey;


	curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_POST, 1);
	curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

	$response = curl_exec($ch);

	curl_close($ch);


	function getSignature($secretKey, $nonce)
	{
		return hash_hmac('sha256', $nonce, $secretKey);
	}


	$data = json_decode($response, true); // true converts it into an associative array

	$nonce = $data['nonce'];

	$signature = getSignature($secretKey, $nonce);





	logData($nonce);
	logData($signature);



	// sleep(45);





	return $signature;

}



function logData($data)
{
	return;
	$logs_directory = plugin_dir_path(__FILE__) . 'logs/';
	$log_file = $logs_directory . 'order_log.json';
	file_put_contents($log_file, json_encode($data), FILE_APPEND);



}

function customRestApiCallback()
{


	global $simplyin_config;

	$base_url = home_url();
	$headers = array(CONTENT_TYPE_JSON, 'Origin: ' . $base_url);
	$data = json_decode(file_get_contents("php://input"), true);
	$endpoint = $data['endpoint'];
	$method = strtoupper($data['method']);
	$body = $data['requestBody'];

	if (isset($data['token'])) {
		$token = $data['token'];
	} else {
		$token = '';
	}


	$delimiter = "[{;;}]";
	$apiKey = get_option('simplyin_api_key');
	$parts = explode($delimiter, $apiKey);

	// $secretKey = $parts[0];
	$publicKey = $parts[1];

	if (empty($publicKey)) {
		$body['merchantApiKey'] = $apiKey;

	} else {
		$signature = generateSignature();
		$body['signature'] = $signature;   //signature

	}



	// $body['signature'] = $signature;   //signature
	// $body['apiKey'] = $apiKey;   // do wywalenia
	$body["shopName"] = get_bloginfo('name');


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


	logData($response);


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

	$bodyData["shopName"] = get_bloginfo('name');


	$delimiter = "[{;;}]";
	$apiKey = get_option('simplyin_api_key');
	$parts = explode($delimiter, $apiKey);
	$publicKey = $parts[1];

	if (empty($publicKey)) {
		$bodyData['merchantApiKey'] = $apiKey;
	} else {
		$signature = generateSignature();
		$bodyData['signature'] = $signature;

	}




	$base_url = home_url();

	$headers = array(CONTENT_TYPE_JSON, 'Origin: ' . $base_url);

	global $simplyin_config;
	update_option('Backend_SimplyIn', $simplyin_config['backendSimplyIn']);
	if (!empty($token)) {
		$url = $simplyin_config['backendSimplyIn'] . $endpoint . '?api_token=' . urlencode($token);
	} else {
		$url = $simplyin_config['backendSimplyIn'] . $endpoint;
	}

	// Convert data to JSON format
	$jsonData = json_encode($bodyData);

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


	// Check for cURL errors
	if (curl_errno($ch)) {
		echo 'Curl error: ' . curl_error($ch);
	}

	// Close cURL session
	curl_close($ch);

	// print_r($response);

	// Return the response
	return $response;
}

add_action('woocommerce_checkout_order_created', 'onOrderCreate', 10, 3);

function onOrderCreate($order)
{

	global $woocommerce;
	$plugin_version = get_plugin_version();
	$woocommerce_version = get_option('woocommerce_version');
	
	$items_data = get_order_items_data($order);
	$payment_method_data = get_payment_method_data($order);


	$shipping_total = $order->get_shipping_total();
	


	$phoneAppInputField = get_sanitized_post_data_simplyin('phoneAppInputField');
	$simplyin_Token_Input_Value = get_sanitized_post_data_simplyin('simplyinTokenInput');
	$create_new_accountVal = get_sanitized_post_data_simplyin('simply-save-checkbox');
	$parcel_machine_id = get_sanitized_post_data_simplyin('parcel_machine_id');
	$custom_tax_field_id = get_sanitized_post_data_simplyin('simply_tax_label_id');
	$simply_billing_id = get_sanitized_post_data_simplyin('simply_billing_id');
	$simply_shipping_id = get_sanitized_post_data_simplyin('simply_shipping_id');
	$taxId = get_sanitized_post_data_simplyin($custom_tax_field_id);

	if (should_create_new_account($create_new_accountVal, $simplyin_Token_Input_Value)) {
		$body_data = build_new_account_order_data($order, $phoneAppInputField, $taxId, $parcel_machine_id, $items_data, $payment_method_data, $plugin_version, $woocommerce_version, $shipping_total);
		$response = json_decode(sendPostRequest($body_data, 'checkout/createOrderAndAccount', ""));
                if ($response && isset($response->createdOrder) && isset($response->createdOrder->shopOrderNumber) && $response->createdOrder->shopOrderNumber == $order->get_order_number()) {
                    $order->update_meta_data('SimplyInOrderId',$response->createdOrder->_id);
                    $order->update_meta_data('SimplyInOrderExported',1);
                    $order->save_meta_data();

                }
	} elseif (has_auth_token($simplyin_Token_Input_Value)) {
		$body_data = build_existing_account_order_data($order, $simply_billing_id, $simply_shipping_id, $taxId, $parcel_machine_id, $items_data, $payment_method_data, $plugin_version, $woocommerce_version, $shipping_total);
		$response = json_decode(sendPostRequest($body_data, 'checkout/createOrderWithoutAccount', $simplyin_Token_Input_Value));
                if ($response && isset($response->createdOrder) && isset($response->createdOrder->shopOrderNumber) && $response->createdOrder->shopOrderNumber == $order->get_order_number()) {
                    $order->update_meta_data('SimplyInOrderId',$response->createdOrder->_id);
                    $order->update_meta_data('SimplyInOrderExported',1);
                    $order->save_meta_data();
                }
	}
}

function get_plugin_version()
{
	$plugin_data = get_plugin_data(__FILE__);
	return $plugin_data['Version'];
}

function get_order_items_data($order)
{
	$items_data = [];
	if ($order) {
		$items = $order->get_items();
		foreach ($items as $item) {
			$product_id = $item->get_product_id();
			$product = wc_get_product($product_id);

			// Get tax information for the item
			$taxes = $item->get_taxes(); // This returns an array with tax data

			$quantity = $item->get_quantity() ?? 1;

			$tax_amount = array_sum($taxes['total']) / $quantity; // Sum of all tax amounts for the item

			$tax_rate = $tax_amount > 0 ? ($tax_amount / $item->get_total()) * 100 : 0; // Calculate tax rate as a percentage

			$price_net = (float) $order->get_item_total($item);

			$price_total = (float) $price_net + $tax_amount;

			$items_data[] = [
				'name' => $item->get_name(),
				'url' => get_permalink($product_id),
				'price_net' => $price_net, // Item price excluding tax
				'price' => $price_total,
				'quantity' => $quantity,
				'tax_amount' => (float) $tax_amount, // Tax amount for this item
				'tax_rate' => (float) $tax_rate, // Tax rate for this item
				'thumbnailUrl' => wp_get_attachment_image_url($product->get_image_id(), 'thumbnail') ?? "",
				'currency' => $order->get_currency(),
			];
		}
	}
	// logData($items_data);
	return $items_data;
}

function get_payment_method_data($order)
{
	$payment_method = $order->get_payment_method();
	$payment_gateways = WC()->payment_gateways->get_available_payment_gateways();
	$payment_method_title = isset($payment_gateways[$payment_method]) ? $payment_gateways[$payment_method]->get_title() : '';
	return ['method' => $payment_method, 'title' => $payment_method_title];
}

function get_sanitized_post_data_simplyin($field_name)
{
	return isset($_POST[$field_name]) ? sanitize_text_field($_POST[$field_name]) : '';
}

function should_create_new_account($create_new_accountVal, $simplyin_Token_Input_Value)
{
	return $create_new_accountVal === "on" && empty($simplyin_Token_Input_Value);
}

function has_auth_token($simplyin_Token_Input_Value)
{
	return !empty($simplyin_Token_Input_Value);
}

function build_new_account_order_data($order, $phoneAppInputField, $taxId, $parcel_machine_id, $items_data, $payment_method_data, $plugin_version, $woocommerce_version, $shipping_total)
{
	$locale = get_locale();
	$languageCode = strtoupper(substr($locale, 0, 2));

	$body_data = [
		"newAccountData" => [
			"name" => trim($order->get_billing_first_name()),
			"surname" => trim($order->get_billing_last_name()),
			"phoneNumber" => trim($phoneAppInputField),
			"email" => trim($order->get_billing_email()),
			"uniqueId" => "string",
			"language" => $languageCode,
			"marketingConsent" => false,
		],
		"newOrderData" => [
			"payment_method" => $payment_method_data['method'],
			"payment_method_title" => $payment_method_data['title'],
			"shopOrderNumber" => $order->get_order_number(),
			"price" => (float) $order->get_total(),
			"currency" => $order->get_currency(),
			"items" => $items_data,
			"placedDuringAccountCreation" => true,
			"billingData" => get_billing_data($order, $taxId),
			"shippingPrice" => $shipping_total,
			"shopName" => get_bloginfo('name'),
			"pluginVersion" => $plugin_version,
			"shopVersion" => $woocommerce_version,
			"shopUserEmail" => wp_get_current_user()->data->user_email ?? '',
		],
	];

	if (!empty($parcel_machine_id)) {
		$body_data["newOrderData"]["parcelLockerMinimalInfo"] = [
			"lockerId" => $parcel_machine_id,
			"providerName" => "inpost"
		];
	} else {
		$body_data["newOrderData"]["shippingData"] = get_shipping_data($order);
	}

	return $body_data;
}

function build_existing_account_order_data($order, $simply_billing_id, $simply_shipping_id, $taxId, $parcel_machine_id, $items_data, $payment_method_data, $plugin_version, $woocommerce_version, $shipping_total)

{
	$billingData = get_billing_data($order, $taxId, $simply_billing_id);

	$body_data = [
		"newOrderData" => [
			"payment_method" => $payment_method_data['method'],
			"payment_method_title" => $payment_method_data['title'],
			"shopOrderNumber" => $order->get_order_number(),
			"price" => (float) $order->get_total(),
			"currency" => $order->get_currency(),
			"items" => $items_data,
			"placedDuringAccountCreation" => false,
			"billingData" => $billingData,
			"shippingPrice" => $shipping_total,
			"shopName" => get_bloginfo('name'),
			"pluginVersion" => $plugin_version,
			"shopVersion" => $woocommerce_version,
			"shopUserEmail" => wp_get_current_user()->data->user_email ?? '',
		],
	];

	if (!empty($parcel_machine_id)) {
		$body_data["newOrderData"]["parcelLockerMinimalInfo"] = [
			"lockerId" => $parcel_machine_id,
			"providerName" => "inpost"
		];
	} else {
		$shippingData = get_shipping_data($order, $simply_shipping_id);
		$body_data["newOrderData"]["shippingData"] = $shippingData;
	}

	return $body_data;
}

function get_billing_data($order, $taxId, $simply_billing_id = '')
{
	$billingData = [
		"name" => trim($order->get_billing_first_name()),
		"surname" => trim($order->get_billing_last_name()),
		"street" => trim($order->get_billing_address_1()),
		"appartmentNumber" => trim($order->get_billing_address_2()),
		"city" => trim($order->get_billing_city()),
		"postalCode" => trim($order->get_billing_postcode()),
		"country" => trim($order->get_billing_country()),
		"state" => trim($order->get_billing_state()),
		"companyName" => trim($order->get_billing_company()),
		"taxId" => trim($taxId)
	];

	if (!empty($simply_billing_id)) {
		$billingData["_id"] = $simply_billing_id;
	}

	return $billingData;
}

function get_shipping_data($order, $simply_shipping_id = '')
{
	$shippingData = [
		"icon" => "🏡",
		"addressName" => "",
		"name" => trim($order->get_shipping_first_name()),
		"surname" => trim($order->get_shipping_last_name()),
		"street" => trim($order->get_shipping_address_1()),
		"appartmentNumber" => trim($order->get_shipping_address_2()),
		"city" => trim($order->get_shipping_city()),
		"postalCode" => trim($order->get_shipping_postcode()),
		"country" => trim($order->get_shipping_country()),
		"state" => trim($order->get_shipping_state()),
		"companyName" => trim($order->get_shipping_company()),
	];

	if (!empty($simply_shipping_id)) {
		$shippingData["_id"] = $simply_shipping_id;
	}

	return $shippingData;
}


add_filter( 'cron_schedules', 'simplyin_add_udpate_cron_interval' );
function simplyin_add_udpate_cron_interval( $schedules ) { 
    $schedules['simplyin_update_interval'] = array(
        'interval' => 60*60*2,
        'display'  => esc_html__( 'SimplyIn Update Interval' ), );
    return $schedules;
}

// Schedule an action if it's not already scheduled
if ( ! wp_next_scheduled( 'simplyin_add_udpate_cron_interval' ) ) {
    wp_schedule_event( time(), 'simplyin_update_interval', 'simplyin_add_udpate_cron_interval' );
}

// Hook into that action that'll fire every three minutes
add_action( 'simplyin_add_udpate_cron_interval', 'simplyin_update_interval_event_func' );
function simplyin_update_interval_event_func() {
    global $simplyin_plugin;
    $data = date("Y-m-d H:i:s") . " [cronjob-sunc] updating everything \n";
    $simplyin_plugin->sync->simplyin_sync();
}

/**
 * Deactivation hook.
 */
function simpyin_deactivate() {
    wp_clear_scheduled_hook( 'simplyin_add_udpate_cron_interval' );
}
register_deactivation_hook( __FILE__, 'simpyin_deactivate' );



