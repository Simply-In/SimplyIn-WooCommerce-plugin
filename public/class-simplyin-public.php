<?php

 class SimplyIn_Public {

	public function __construct( $plugin_name, $version ) {

		$this->plugin_name = $plugin_name;
		$this->version = $version;
	
	}

	public function simplyin_enqueue_styles() {

		wp_enqueue_style( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'css/simplyin-public.css', array(), $this->version, 'all' );

	}

	public function enqueue_scripts() {
		
		 wp_enqueue_script( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'js/simplyin-public.js', array( 'jquery' ), $this->version, false );
		$api_key = get_option("simplyin_api_key");
		$scriptData = array(
        'api_key' => $api_key,
		
	);

		wp_localize_script($this->plugin_name, 'my_key', $scriptData);

	}




	public function custom_orders_list_column_content( $column, $post_id )
	{
		global $post, $the_order;
		global $allowedposttags;
$allowed_atts = array(
	'align'      => array(),
	'class'      => array(),
	'type'       => array(),
	'id'         => array(),
	'dir'        => array(),
	'lang'       => array(),
	'style'      => array(),
	'xml:lang'   => array(),
	'src'        => array(),
	'alt'        => array(),
	'href'       => array(),
	'rel'        => array(),
	'rev'        => array(),
	'target'     => array(),
	'novalidate' => array(),
	'type'       => array(),
	'value'      => array(),
	'name'       => array(),
	'tabindex'   => array(),
	'action'     => array(),
	'method'     => array(),
	'for'        => array(),
	'width'      => array(),
	'height'     => array(),
	'data'       => array(),
	'title'      => array(),
);
$allowedposttags['form']     = $allowed_atts;
$allowedposttags['label']    = $allowed_atts;
$allowedposttags['input']    = $allowed_atts;
$allowedposttags['textarea'] = $allowed_atts;
$allowedposttags['iframe']   = $allowed_atts;
$allowedposttags['script']   = $allowed_atts;
$allowedposttags['style']    = $allowed_atts;
$allowedposttags['strong']   = $allowed_atts;
$allowedposttags['small']    = $allowed_atts;
$allowedposttags['table']    = $allowed_atts;
$allowedposttags['span']     = $allowed_atts;
$allowedposttags['abbr']     = $allowed_atts;
$allowedposttags['code']     = $allowed_atts;
$allowedposttags['pre']      = $allowed_atts;
$allowedposttags['div']      = $allowed_atts;
$allowedposttags['img']      = $allowed_atts;
$allowedposttags['h1']       = $allowed_atts;
$allowedposttags['h2']       = $allowed_atts;
$allowedposttags['h3']       = $allowed_atts;
$allowedposttags['h4']       = $allowed_atts;
$allowedposttags['h5']       = $allowed_atts;
$allowedposttags['h6']       = $allowed_atts;
$allowedposttags['ol']       = $allowed_atts;
$allowedposttags['ul']       = $allowed_atts;
$allowedposttags['li']       = $allowed_atts;
$allowedposttags['em']       = $allowed_atts;
$allowedposttags['hr']       = $allowed_atts;
$allowedposttags['br']       = $allowed_atts;
$allowedposttags['tr']       = $allowed_atts;
$allowedposttags['td']       = $allowed_atts;
$allowedposttags['p']        = $allowed_atts;
$allowedposttags['a']        = $allowed_atts;
$allowedposttags['b']        = $allowed_atts;
$allowedposttags['i']        = $allowed_atts;

	}



	public function addMetatoOrders($order_id)
	{
		$order = wc_get_order( $order_id );
		$order->update_meta_data( 'my_custom_meta_key', 'my data' );
		$order->save();
	} 

	


}
