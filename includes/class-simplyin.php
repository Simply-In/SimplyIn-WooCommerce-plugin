<?php

class SimplyIn {

	/**
	 * The loader that's responsible for maintaining and registering all hooks that power
	 * the plugin.
	 *
	 * @since    1.0.0
	 * @access   protected
	 * @var      SimplyIn_Loader    $loader    Maintains and registers all hooks for the plugin.
	 */
	protected $loader;


	
	/**
	 * The unique identifier of this plugin.
	 *
	 * @since    1.0.0
	 * @access   protected
	 * @var      string    $plugin_name    The string used to uniquely identify this plugin.
	 */
	protected $plugin_name;
	
	
	/**
	 * The current version of the plugin.
	 *
	 * @since    1.0.0
	 * @access   protected
	 * @var      string    $version    The current version of the plugin.
	 */
	protected $version;

	public function __construct() {
		// echo'test';
		if ( defined( 'SIMPLYIN_VERSION' ) ) {
			$this->version = SIMPLYIN_VERSION;
		} else {
			$this->version = '1.0.0';
		}

		$this->plugin_name = 'simplyin';

		$this->load_dependencies();
		// $this->set_locale();
		$this->define_admin_hooks();
		$this->define_public_hooks();
		// $this->define_shortcodes();
	}




private function load_dependencies() {

		require_once plugin_dir_path(dirname(__FILE__)) . 'includes/class-simplyin-loader.php';


	require_once plugin_dir_path( dirname( __FILE__ ) ) . 'admin/class-simplyin-admin.php';


	require_once plugin_dir_path( dirname( __FILE__ ) ) . 'public/class-simplyin-public.php';
	$this->loader = new SimplyIn_Loader();


		
}


private function define_admin_hooks() {

	$plugin_admin = new SimplyIn_Admin( $this->get_plugin_name(), $this->get_version() );
}


private function define_public_hooks() {

	$plugin_public = new SimplyIn_Public( $this->get_plugin_name(), $this->get_version() );

	$this->loader->add_action( 'wp_enqueue_scripts', $plugin_public, 'simplyin_enqueue_styles' );
	$this->loader->add_action( 'wp_enqueue_scripts', $plugin_public, 'enqueue_scripts' );
	$this->loader->add_action( 'admin_post_nopriv_process_form', $plugin_public ,'submitAPIKey' );
	$this->loader->add_action( 'admin_post_process_form', $plugin_public ,'submitAPIKey' );
		add_action('wp_footer', [$this, 'frontFooter'], 75);

	}


public function run() {
	$this->loader->run();


	}



public function get_loader() {
	return $this->loader;
}
	

public function get_plugin_name() {
	return $this->plugin_name;
}


public function get_version() {
	return $this->version;
}

	public
		function frontFooter(
	) {
		if (true === is_checkout()) {

			$domain_url = site_url();
			$path = 'wp-content/plugins/simplyin/public/dist/bundle.js';
			$full_url = trailingslashit($domain_url) . $path;
			// echo esc_url($full_url);

			echo '<script async src=' . esc_url($full_url) . '></script>';

		}

	}


}

