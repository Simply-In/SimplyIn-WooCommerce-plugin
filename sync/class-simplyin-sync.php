<?php

/**
 * BI-directional interface between plugin and BE
 */

class SimplyIn_Sync {

    private $plugin_name;
    private $version;

    /**
     * @var WP_Example_Request
     */
    //protected $process_single;

    /**
     * @var WP_Example_Process
     */
    protected $process_all;
    protected $simplyin_api;
    

    public function __construct($plugin_name, $version) {

        add_action('plugins_loaded', array($this, 'init'));
        add_action('init', array($this, 'process_handler'));
        add_action('woocommerce_order_status_changed', array( $this, 'change_status'), 10, 3);
        add_action('update_option_simplyin_api_key',array( $this, 'simplyin_update_merchand_settings'), 10, 2);
        $this->plugin_name = $plugin_name;
        $this->version = $version;
        
    }

    /**
     * Init
     */
    public function init() {
        require_once plugin_dir_path(__FILE__) . 'simplyin-background-request.php';
        require_once plugin_dir_path(__FILE__) . 'simplyin-background-process.php';

        $this->simplyin_api = new SimplyIn_Api($this->plugin_name, $this->version);
        
        $this->process_single = new SimplyIn_Background_Request();
        $this->process_single->setSimplyInApi($this->simplyin_api);
        
        $this->process_all = new SimplyIn_Background_Process();
        $this->process_all->setSimplyInApi($this->simplyin_api);
    }

    /**
     * Process handler
     */
    public function process_handler() {
        if (!isset($_GET['process']) || !isset($_GET['_wpnonce'])) {
            return;
        }

        if (!wp_verify_nonce($_GET['_wpnonce'], 'process')) {
            return;
        }

        if ('single' === $_GET['process']) {
            //$this->handle_single();
        }

        if ('all' === $_GET['process']) {
            $this->handle_all();
        }

        if ('initial' === $_GET['process']) {
            $this->simplyin_initial_user_sync();
        }

        if ('clean' === $_GET['process']) {
            $this->clean_queue();
        }
    }

    protected function clean_queue() {
        $this->process_all->data->delete_all();
    }

    /**
     * Handle single request
     */
    protected function handle_single() {
        //$this->process_single->data( array( 'name' => $name ) )->dispatch();
    }

    /**
     * Handle status change
     */
    public function change_status($order_id, $old_status, $new_status) {
        $order = wc_get_order($order_id);
        $simplyin_order_id = $order->get_meta('SimplyInOrderId');
        if ($simplyin_order_id) {
            $this->process_all->push_to_queue(array('action' => 'update_order_status', 'simplyin_order_id' => $simplyin_order_id, 'status' => $new_status));
        }
        $this->process_all->save()->dispatch();
    }
    
    /**
     * Handle all requests
     */
    protected function handle_all() {
        $users = get_users(array('role__in' => array('customer', 'subscriber'), 'fields' => array('id')));

        foreach ($users as $user) {
            $this->process_all->push_to_queue(array('action' => 'check_user', 'user_id' => $user->id));
        }
        $this->process_all->save()->dispatch();
    }

    /**
     * Get all users and sync with SimplyIn
     */
    public function simplyin_initial_user_sync() {
        $users = get_users(array('role__in' => array('customer', 'subscriber'), 'fields' => array('user_email', 'id')));

        foreach ($users as $user) {
            $this->process_all->push_to_queue(array('action' => 'verify_user', 'user_email' => $user->user_email, 'user_id' => $user->ID));
        }
        $this->process_all->save()->dispatch();
    }

    /**
     * Handle all requests
     */
    public function simplyin_update_users() {
        $users = get_users(array('role__in' => array('customer', 'subscriber'), 'fields' => array('user_email', 'id')));

        foreach ($users as $user) {
            $this->process_all->push_to_queue(array('action' => 'verify_user', 'user_email' => $user->user_email, 'user_id' => $user->ID));
        }
        $this->process_all->save()->dispatch();
    }
    
    /**
     * when key is updated try to fetch merchand settings, fired when api key is updated
     */
    public function simplyin_update_merchand_settings ($old_api_key, $new_api_key) {
        $params = array (
            'platform' => 'WooCommerce',
            'pluginVersion' => $this->version,
            'shopName' => get_bloginfo('name')
        );
        $response = $this->simplyin_api->sendRequest('plugin-sync/info', 'GET', null, $params, $new_api_key);
        if ($response && isset($response->transactionHistoryLengthDays)) { // this means API responsed correctly
            update_option('SimplyInApiConnection',1);
            update_option('SimplyInApiConnectionLastTry',time());;
            update_option('SimplyInTransactionHistoryLengthDay',$response->transactionHistoryLengthDays);
            update_option('SimplyInSwitchIsChecked',$response->switchInfo->isChecked);
            update_option('SimplyInSwitchLastChange',$response->switchInfo->lastChange);
            update_option('SimplyInLogisticsPartnersOrder',$response->logisticsPartnersOrder->order);
            if (isset($response->docsInfo) && !empty($response->docsInfo) && is_array($response->docsInfo)) {
                foreach ($response->docsInfo as $doc) {
                    if (isset($doc->key)) {
                        update_option('SimplyInDoc_'.$doc->key ,$doc->url);
                    }
                }
            }
        } else {
            update_option('SimplyInApiConnection',0);
            update_option('SimplyInApiConnectedLastTry',time());
        }
    }

    /**
     * Synchronize everything
     */
    public function simplyin_sync() {
        if (get_option('SimplyInApiConnection')) {
            $this->sync_orders();
            $this->sync_shipping();
        }
    }

    protected function sync_shipping() {
        $this->process_all->push_to_queue(array('action' => 'update_shipping_methods'));
        $this->process_all->save()->dispatch();
    }

    /**
     * Sync orders from last time.
     */
    protected function sync_orders() {
        $lastSyncTimestamp = get_option('SimplyInLastSyncTimestamp');
        if (!$lastSyncTimestamp || $lastSyncTimestamp <= 0) { // if never done, take it back from $transactionHistoryLengthDay days.
            $transactionHistoryLengthDay = get_option('SimplyInTransactionHistoryLengthDay', 180);
            $lastSyncTimestamp = time() - 60*60*24*$transactionHistoryLengthDay; 
        } 
        
        $query = new WC_Order_Query(
                array(
                    'limit' => -1,
                    'meta_query' => array(
                        'relation' => 'OR',
                        array(
                            'key' => 'SimplyInOrderExported',
                            'value' => '1',
                            'compare' => '!='
                        ),
                        array(
                            'key' => 'SimplyInOrderInQueue',
                            'value' => '1',
                            'compare' => '!='
                        ),
                        array(
                            'key' => 'SimplyInOrderExported',
                            'compare' => 'NOT EXISTS',
                        ),
                        array(
                            'key' => 'SimplyInOrderInQueue',
                            'compare' => 'NOT EXISTS',
                        ),
                    ),
                    'date_query' => [
                        [
                            'after' => date("Y-m-d H:i:s", $lastSyncTimestamp),
                            'inclusive' => true,
                        ],
                    ],
                    'return' => 'ids'
                )
        );
        $orders = $query->get_orders();
        
        foreach ($orders as $order_id) {
            $this->process_all->push_to_queue(array('action' => 'create_order', 'order_id' => $order_id));
            $order = wc_get_order($order_id);
            $order->update_meta_data('SimplyInOrderInQueue',1);
            $order->save_meta_data();
        }
        $this->process_all->save()->dispatch();
        update_option("SimplyInLastSyncTimestamp",time());
    }
}
