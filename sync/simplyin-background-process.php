<?php

class SimplyIn_Background_Process extends WP_Background_Process {

    /**
     * @var string
     */
    protected $action = 'simplyin_background_process';
    protected $simplyin_api;

    /**
     * Task
     *
     * Override this method to perform any actions required on each
     * queue item. Return the modified item for further processing
     * in the next pass through. Or, return false to remove the
     * item from the queue.
     *
     * @param mixed $item Queue item to iterate over
     *
     * @return mixed
     */
    
    public function setSimplyInApi($simplyInApi) {
        $this->simplyin_api = $simplyInApi;
    }
    
    protected function task($item) {
        if (isset($item['action'])) {
            switch ($item['action']) {
                case 'check_user':
                    $this->checkUserExist($item['user_email'], $item['user_id']);
                    break;
                case 'verify_user':
                    $this->checkUserExist($item['user_email'], $item['user_id']);
                    break;
                case 'export_order':
                    $this->updateHistory($item['user_id']);
                    break;
                case 'create_order':
                    $this->createOrder($item['order_id']);
                    break;
                case 'update_shipping_methods':
                    $this->updateShippingMethods();
                    break;
                case 'update_order_status':
                    $this->updateOrderStatus($item['simplyin_order_id'], $item['status']);
                    break;
                case 'set_gdpr_links':
                    $this->setGDPRLinks($item['simplyin_order_id'], $item['status']);
                    break;
                case 'set_register_by_default':
                    $this->setRegisterByDefault($item['simplyin_order_id'], $item['status']);
                    break;
                case 'plugin_sync':
                    $this->setRegisterByDefault($item['simplyin_order_id'], $item['status']);
                    break;
            }
        }
        return false;
    }

    /**
     * Complete
     *
     * Override if applicable, but ensure that the below actions are
     * performed, or, call parent::complete().
     */
    protected function complete() {
        parent::complete();
    }

    /**
     * This method check user exist in SimplyIn and mark him
     * 
     * @param type $user_email
     * @param type $user_id
     */
    protected function checkUserExist($user_email, $user_id = null) {
        $bodyData = array("data"=>array(hash('sha256', $user_email)));
        $response = $this->simplyin_api->sendRequest('users/verifyHashedEmailsExist','POST', $bodyData);

        if (!isset($response->ok) || empty($response->data) || !isset($response->data[0])) {
            if ($user_id) {
                update_user_meta($user_id, 'SimplyInUserExist', 0);
            }
            return false;
        } else {
            if ($response->data[0]->email == hash('sha256', $user_email)) {
                if ($user_id) {
                    update_user_meta($user_id, 'SimplyInUserExist', 1);
                    update_user_meta($user_id, 'SimplyInUserHmacEmail', $response->data[0]->hmacEmail);
                    update_user_meta($user_id, 'SimplyInUserStatus', $response->data[0]->status);
                }
                return true;
            } else {
                if ($user_id) {
                    update_user_meta($user_id, 'SimplyInUserExist', 0);
                }
                return false;
            }
        }
    }

    protected function updateHistory($user_id) {
        
    }
    
    protected function updateOrderStatus($simplyin_order_status,$status) {
        return;
        $status_mappings = array(
            "processing" => "",
            "pending" => "",
            "on-hold" => "",
            "cancelled" => "",
            "completed" => "",
            "refunded" => "",
            "failed" => "",
            "checkout-draft" => "",
        );
        $body_data['orderId'] = $simplyin_order_status;
        $body_data['status'] = $status;
        $response = $this->simplyin_api->sendRequest('orders/updateStatus','PUT',$body_data);
    }
    
    protected function updateShippingMethods() {
        $methods = array_values($this->get_all_shipping_methods());
        $body_data['providers'] = $methods;
        $response = $this->simplyin_api->sendRequest('merchants/setLogisticsProviders','POST',$body_data);
    }

    protected function createOrder($order_id) {
        $order = wc_get_order($order_id);
        $order->delete_meta_data('SimplyInOrderInQueue');
        $order->save_meta_data();
        
        $user_email = $order->get_billing_email();
        // if user in SimplyIn create order for him
        if ($this->checkUserExist($user_email)) {
            $plugin_version = get_plugin_version();
            $woocommerce_version = get_option('woocommerce_version');
            $items_data = get_order_items_data($order);
            $payment_method_data = get_payment_method_data($order);
            
            $body_data = $this->build_existing_account_order_data($order, $items_data, $payment_method_data, $plugin_version, $woocommerce_version, $user_email);
            $response = $this->simplyin_api->sendRequest('checkout/createOrder',"POST",$body_data);
            if ($response && isset($response->createdOrder) && isset($response->createdOrder->shopOrderNumber) && $response->createdOrder->shopOrderNumber == $order->get_order_number()) {
                $order->update_meta_data('SimplyInOrderId', $response->createdOrder->_id);
                $order->update_meta_data('SimplyInOrderExported', 1);
            } elseif ($response && isset($response->message) && $response->message == "Order already exists") {
                $order->update_meta_data('SimplyInOrderExported', 1);
            }
        }
        
        $order->save_meta_data();
    }

    protected function build_existing_account_order_data($order, $items_data, $payment_method_data, $plugin_version, $woocommerce_version, $user_email, $merchantApiKey = "") {
        $billingData = [
		"name" => trim($order->get_billing_first_name()),
		"surname" => trim($order->get_billing_last_name()),
		"street" => trim($order->get_billing_address_1()),
		"appartmentNumber" => trim($order->get_billing_address_2()),
		"city" => trim($order->get_billing_city()),
		"postalCode" => trim($order->get_billing_postcode()),
		"country" => trim($order->get_billing_country()),
		"state" => trim($order->get_billing_state()),
		"companyName" => trim($order->get_billing_company())
	];
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
                "shippingData" => $shippingData
            ],
            "shopName" => get_bloginfo('name'),
            "pluginVersion" => $plugin_version,
            "shopVersion" => $woocommerce_version,
            "shopUserEmail" => $user_email ?? '',
        ];

        if ($merchantApiKey) {
            $body_data["merchantApiKey"] = $merchantApiKey;
        }

        return $body_data;
    }
    
    protected function get_all_shipping_methods() {
        $methods = [];
        $methodsIds = [];
        $data_store = WC_Data_Store::load( 'shipping-zone' );
        $raw_zones = $data_store->get_zones();
        foreach ( $raw_zones as $raw_zone ) {
           $zone = new WC_Shipping_Zone( $raw_zone );
           $zone_shipping_methods = $zone->get_shipping_methods();
           foreach ( $zone_shipping_methods as $index => $method ) {
               if ($method->is_enabled()) {
                   $methodsIds[] = $method->get_rate_id();
                   $methods[$method->get_rate_id()] = $method->get_method_title();
               }
           }
        }
        return $methods;
    }
}
