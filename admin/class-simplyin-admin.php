<?php

class SimplyIn_Admin
{

	private $plugin_name;
	private $version;
	public function __construct($plugin_name, $version)
	{

		$this->plugin_name = $plugin_name;
		$this->version = $version;
		add_action('admin_menu', array($this, 'addPluginAdminMenu'), 9);
		add_action('admin_init', array($this, 'registerAndBuildFields'));
		add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_styles'));

	}

	/**
	 * Register the stylesheets for the admin area.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_admin_styles()
	{

		wp_enqueue_style('admincss', plugin_dir_url(__FILE__) . 'css/simplyin-admin.css', array(), $this->version, 'all');
		wp_enqueue_script($this->plugin_name, plugin_dir_url(__FILE__) . 'js/simplyin-admin.js', array('jquery'), $this->version, false);
	}

	public function addPluginAdminMenu()
	{
		add_menu_page($this->plugin_name, 'SimplyIn', 'administrator', $this->plugin_name . '-settings', array($this, 'displayPluginAdminSettings'), 'dashicons-chart-area', 26);

	}



	public function displayPluginAdminDashboard()
	{
		require_once plugin_dir_path(dirname(__FILE__)) . 'admin/partials/' . $this->plugin_name . '-admin-display.php';
	}

	public function displayPluginAdminSettings()
	{

		if (isset($_GET['error_message'])) {
			add_action('admin_notices', array($this, 'simplyinSettingsMessages'));
			do_action('admin_notices', $_GET['error_message']);
		}
		require_once 'partials/' . $this->plugin_name . '-admin-settings-display.php';
	}

	public function simplyinSettingsMessages($error_message)
	{
		switch ($error_message) {
			case '1':
				$message = __('There was an error adding this setting. Please try again.  If this persists, shoot us an email.', 'my-text-domain');
				$err_code = esc_attr('plugin_name_example_setting');
				$setting_field = 'plugin_name_example_setting';
				break;
			default:
				$message = __('An unexpected error occurred.', 'my-text-domain');
				$err_code = esc_attr('plugin_name_unexpected_error');
				$setting_field = 'plugin_name_unexpected_error';
				break;
		}
		$type = 'error';
		add_settings_error(
			$setting_field,
			$err_code,
			$message,
			$type
		);
	}

	public function registerAndBuildFields()
	{

		add_settings_section(
			'simplyin_settings_page_general_section',
			'API Key',
			array($this, 'settings_page_display_general_account'),
			'settings_simply_apikey'
		);

		// SimplyIN API Key field
		add_settings_field(
			'simplyin_api_key',
			'SimplyIN API Key',
			array($this, 'settings_page_render_settings_field'),
			'settings_simply_apikey',
			'simplyin_settings_page_general_section',
			array(
				'type' => 'input',
				'subtype' => 'password',
				'id' => 'simplyin_api_key',
				'name' => 'simplyin_api_key',
				'required' => 'true',
				'value_type' => 'normal',
				'wp_data' => 'option'
			)
		);

		// Register by Default checkbox field
		add_settings_field(
			'register_by_default',
			'Register by Default',
			array($this, 'settings_page_render_settings_field'),
			'settings_simply_apikey',
			'simplyin_settings_page_general_section',
			array(
				'type' => 'input',
				'subtype' => 'checkbox',
				'id' => 'register_by_default',
				'name' => 'register_by_default',
				'value_type' => 'normal',
				'wp_data' => 'option'
			)
		);

		// Register settings
		register_setting(
			'settings_simply_apikey',
			'simplyin_api_key'
		);

		register_setting(
			'settings_simply_apikey',
			'register_by_default'
		);

	}

	public function settings_page_display_general_account()
	{
		echo '<p>To activate <a href="https://www.simply.in" target="_blank">Simply.IN</a> in your store, paste below the API key generated in the <a href="https://merchant.simplyin.app/" target="_blank">merchant panel</a>. Detailed instructions are available in the panel.</p>';
	}



	public $allowed_tags = array(
		'form',
		'label',
		'input',
		'textarea',
		'iframe',
		'script',
		'style',
		'strong',
		'small',
		'table',
		'span',
		'abbr',
		'code',
		'pre',
		'div',
		'img',
		'h1',
		'h2',
		'h3',
		'h4',
		'h5',
		'h6',
		'ol',
		'ul',
		'li',
		'em',
		'hr',
		'br',
		'tr',
		'td',
		'p',
		'a',
		'b',
		'i'
	);
	public $allowed_atts = array(
		'align',
		'class',
		'type',
		'id',
		'dir',
		'lang',
		'style',
		'xml:lang',
		'src',
		'alt',
		'href',
		'rel',
		'rev',
		'target',
		'novalidate',
		'value',
		'name',
		'tabindex',
		'action',
		'method',
		'for',
		'width',
		'height',
		'data',
		'title'
	);


	public function settings_page_render_settings_field($args)
	{
		$wp_data_value = $this->get_wp_data_value($args);

		global $allowedposttags;
		$this->update_allowed_tags($allowedposttags);

		switch ($args['type']) {
			case 'input':
				$this->render_input_field($args, $wp_data_value, $allowedposttags);
				break;
			case 'checkbox':
				$this->render_checkbox_field($args, $wp_data_value);
				break;
			default:
				break;
		}
	}

	private function get_wp_data_value($args)
	{
		if ($args['wp_data'] == 'option') {
			return get_option($args['name']);
		} elseif ($args['wp_data'] == 'post_meta') {
			return get_post_meta($args['post_id'], $args['name'], true);
		}
		return '';
	}

	private function update_allowed_tags(&$allowedposttags)
	{
		foreach ($this->allowed_tags as $tag) {
			$allowedposttags[$tag] = array_combine($this->allowed_atts, array_fill(0, count($this->allowed_atts), true));
		}
	}

	private function render_input_field($args, $wp_data_value, $allowedposttags)
	{
		$value = ($args['value_type'] == 'serialized') ? serialize($wp_data_value) : $wp_data_value;
		$prependStart = $args['prepend_value'] ?? '';
		$prependEnd = $args['prepend_value'] ? '</div>' : '';
		$step = $args['step'] ? 'step="' . $args['step'] . '"' : '';
		$min = $args['min'] ? 'min="' . $args['min'] . '"' : '';
		$max = $args['max'] ? 'max="' . $args['max'] . '"' : '';
		$disabled_attr = $args['disabled'] ? 'disabled' : '';
		$required_attr = ($args['required'] ?? 'false') == 'true' ? 'required' : '';

		echo wp_kses(
			$prependStart . '<input type="' . $args['subtype'] . '" id="' . $args['id'] . '" ' . $required_attr . ' ' . $step . ' ' . $max . ' ' . $min . ' name="' . $args['name'] . '" size="40" value="' . esc_attr($value) . '" ' . $disabled_attr . ' />' . $prependEnd,
			$allowedposttags
		);
	}

	private function render_checkbox_field($args, $wp_data_value)
	{
		$checked = $wp_data_value ? 'checked' : '';
		echo '<div class="registerByDefaultContainer">
            <div>
                <h2>User registration during checkout</h2>
                <div class="row">
                <p>The "Save your details <a href="https://www.simply.in" target="_blank">Simply.IN</a>" checkbox is selected by default for users who do not have an account at <a href="https://www.simply.in" target="_blank">Simply.IN</a></p>
                    <div>
                        <label class="switch">
                            <input type="' . $args['subtype'] . '" id="' . $args['id'] . '" name="' . $args['name'] . '" ' . $checked . ' />
                            <span class="slider round"></span>
                        </label>
                    </div>
                </div>
            </div>
        </div>';
	}


}
