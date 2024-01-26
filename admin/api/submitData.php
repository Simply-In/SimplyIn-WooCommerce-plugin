<?php


$data = json_decode(file_get_contents("php://input"), true);
$endpoint = $data['endpoint'];
$method = strtoupper($data['method']);
$body = $data['requestBody'];
if (isset($data['token'])) {
	$token = $data['token'];
} else {
	$token = '';
}

define('WP_USE_THEMES', false);
require('../../../../../wp-load.php');
$apiKey = get_option('simplyin_api_key');
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

?>