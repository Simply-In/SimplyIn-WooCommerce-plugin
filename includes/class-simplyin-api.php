<?php

class SimplyIn_Api {

    protected $simplyin_api_url;
    protected $merchand_api_key;
    protected $version;
    protected $plugin_name;
    protected $saveLogs = true;

    public function __construct($plugin_name, $version) {
        $this->plugin_name = $plugin_name;
        $this->version = $version;
        
        $this->merchand_api_key = get_option('simplyin_api_key');
        global $simplyin_config;
        $this->simplyin_api_url = $simplyin_config['backendSimplyIn'];
    }
    
    public function sendRequest($endpoint, $method = 'GET', $bodyData='', $params = array(), $merchantApiKey = "", $skipMerchantApiKey = false,  ) {
        if (!empty($merchantApiKey)) {
            $this->merchand_api_key = $merchantApiKey;
        }
        
        if (empty($this->merchand_api_key) && !$skipMerchantApiKey) {
            http_response_code(400);  // Bad Request
            echo "Error: Simplyin API Key is empty";
            return;
        }

        $base_url = home_url();
        $headers = array(
            'Content-Type: application/json', 
            'Origin: ' . $base_url
            );
        
        if (!$skipMerchantApiKey) {
            $headers[] = 'X-Auth-Merchant-Api-Key: ' . $this->merchand_api_key;
            if (in_array(strtoupper($method), array("POST","PUT"))) {
                $bodyData['merchantApiKey'] = $this->merchand_api_key;
            }
        }

        $url = $this->simplyin_api_url . $endpoint;

        $ch = curl_init();
        
        if (in_array(strtoupper($method), array("POST","PUT"))) {
            $jsonData = json_encode($bodyData);
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, strtoupper($method));
            curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonData);
            curl_setopt($ch, CURLOPT_POST, 1);
        }
        
        if (!empty($params)) {
            $url .= '?' . http_build_query($params);
        }

        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); 
        
        $response = curl_exec($ch);

        if (curl_errno($ch)) {
            $response = curl_error($ch);
        }
        
        if ($this->saveLogs) {
            $log = date("Y-m-d H:i:s") . " SimplyInApi call endpoint: " . $endpoint . ", method: " . $method .", API url: " . $url. ", response: " . serialize($response);
            if (!empty($params)) {
                $log .= ", Params: " . serialize($params);
            }
            if (!empty($headers)) {
                $log .= ", Headers: " . serialize($headers);
            }
            if (!empty($bodyData)) {
                $log .= ", BodyData: " . serialize($bodyData);
            }
            $this->log($log);
        }
        
        curl_close($ch);
        return json_decode($response);
    }
    
    private function log($message) {
        error_log($message);
        return;
    }
}
