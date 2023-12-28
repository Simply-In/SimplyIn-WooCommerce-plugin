<?php

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
	'onclick'      => array(),
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

	
?>
<?php $dir=plugin_dir_url(__FILE__); ?>

<div class="container">
	<div class="white-box">
		<div class="d-flex align-items-center justify-content-between">
			<p class="m-0 bold mb-1">API Key</p>
			<a href="https://simply.in/" target="_blank" class="mb-1 d-inline-block">View SimplyIn <?php  echo wp_kses('<img class="middle ml-5" src='.$dir.'../img/icons/exit-top-right.png alt="" width="12">',$allowedposttags); ?></a>
		</div>

		<div class="form-group form-pw">
		<?php settings_errors(); ?>  
		        <form method="POST" action="options.php">  
				<div class="form-pw">					
		            <?php
					// settings_fields( 'simplyin_admin_api_key' );
						echo wp_kses('<img src='.$dir.'../img/icons/view.png alt="" onclick="showhides()" class="show-pass eye-icon"><img src='.$dir.'../img/icons/hidden.png alt="" onclick="showhides()" class="hide-pass eye-icon" style=" display: none; ">',$allowedposttags);
					// do_settings_sections('simplyin_admin_api_key');

					settings_fields('settings_simply_inpost');
					
					do_settings_sections('settings_simply_inpost');
					?>
				</div>  
			    <?php submit_button(); ?>  
				</form> 
		</div>
	</div>

	