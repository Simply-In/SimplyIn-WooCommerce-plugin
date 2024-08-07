<?php

global $allowedposttags;
$allowed_atts = array(
	'align' => array(),
	'class' => array(),
	'type' => array(),
	'id' => array(),
	'dir' => array(),
	'lang' => array(),
	'style' => array(),
	'xml:lang' => array(),
	'src' => array(),
	'alt' => array(),
	'href' => array(),
	'rel' => array(),
	'rev' => array(),
	'target' => array(),
	'novalidate' => array(),
	'value' => array(),
	'name' => array(),
	'tabindex' => array(),
	'action' => array(),
	'method' => array(),
	'for' => array(),
	'width' => array(),
	'height' => array(),
	'data' => array(),
	'title' => array(),
	'onclick' => array(),
);
$allowedposttags['form'] = $allowed_atts;
$allowedposttags['label'] = $allowed_atts;
$allowedposttags['input'] = $allowed_atts;
$allowedposttags['textarea'] = $allowed_atts;
$allowedposttags['iframe'] = $allowed_atts;
$allowedposttags['script'] = $allowed_atts;
$allowedposttags['style'] = $allowed_atts;
$allowedposttags['strong'] = $allowed_atts;
$allowedposttags['small'] = $allowed_atts;
$allowedposttags['table'] = $allowed_atts;
$allowedposttags['span'] = $allowed_atts;
$allowedposttags['abbr'] = $allowed_atts;
$allowedposttags['code'] = $allowed_atts;
$allowedposttags['pre'] = $allowed_atts;
$allowedposttags['div'] = $allowed_atts;
$allowedposttags['img'] = $allowed_atts;
$allowedposttags['h1'] = $allowed_atts;
$allowedposttags['h2'] = $allowed_atts;
$allowedposttags['h3'] = $allowed_atts;
$allowedposttags['h4'] = $allowed_atts;
$allowedposttags['h5'] = $allowed_atts;
$allowedposttags['h6'] = $allowed_atts;
$allowedposttags['ol'] = $allowed_atts;
$allowedposttags['ul'] = $allowed_atts;
$allowedposttags['li'] = $allowed_atts;
$allowedposttags['em'] = $allowed_atts;
$allowedposttags['hr'] = $allowed_atts;
$allowedposttags['br'] = $allowed_atts;
$allowedposttags['tr'] = $allowed_atts;
$allowedposttags['td'] = $allowed_atts;
$allowedposttags['p'] = $allowed_atts;
$allowedposttags['a'] = $allowed_atts;
$allowedposttags['b'] = $allowed_atts;
$allowedposttags['i'] = $allowed_atts;


?>
<?php $dir = plugin_dir_url(__FILE__); ?>
<style>
	body {
		font-size: 14px;
	}

	.m-0 {
		margin: 0px;
	}

	.mb-1 {
		margin-bottom: 10px;
	}

	.mb-2 {
		margin-bottom: 20px;
	}

	.mt-1 {
		margin-top: 10px;
	}

	.mt-2 {
		margin-top: 20px;
	}

	.mt-3 {
		margin-top: 30px;
	}

	.container {
		width: 60%;
		margin: 0 auto;
		padding-right: 15px;
		padding-left: 15px;
	}

	.white-box {
		background: #fff;
		padding: 15px;
		margin-bottom: 15px;
		border-radius: 8px;
		box-shadow: 0 2px 3px #ccc;
	}

	.p-0 {
		padding: 0px;
	}

	.d-flex {
		display: flex;
	}

	.d-inline-block {
		display: inline-block;
	}

	.align-items-center {
		align-items: center;
	}

	.justify-content-between {
		justify-content: space-between;
	}

	.bold {
		font-weight: bold;
	}

	.form-group {
		margin-bottom: 10px;
	}

	.form-control {
		width: 100%;
		height: 36px;
		border: 1px solid #ccc !important;
	}

	.form-pw {
		position: relative;
	}

	.form-pw img {
		width: 19px;
		/* position: absolute; */
		/* right: 14px; */
		/* bottom: 7px; */
		cursor: pointer;
	}

	.form-pw #settings_page_example_setting {
		font-size: 23px;
		width: 100%;
		height: 36px;
		border: 1px solid #ccc !important;
	}

	.submit {
		margin-top: 10px !important;
	}

	.submit .button .btn,
	.submit .button {
		border: 0px;
		padding: 8px 22px;
		border-radius: 3px;
		cursor: pointer;
	}

	.btn-green,
	.submit .button {
		background: #008060 !important;
		color: #fff;
	}

	.faq-box {
		padding: 15px 20px;
		border-bottom: 1px solid #e2e2e2;
	}

	.faq-box h4 {
		margin-top: 0px;
		margin-bottom: 8px;
		font-size: 16px;
		color: #000;
	}

	.faq-box p {
		margin: 0px;
		font-size: 14px;
	}

	a {
		color: #3e9be6;
	}

	.ml-5 {
		margin-left: 5px;
	}

	.middle {
		vertical-align: middle;
	}

	.form-table td {
		padding: 0;
	}

	.form-table th {
		display: none;
	}

	.form-pw {
		position: relative;
	}

	.eye-icon {
		position: absolute;
		/* right: 3px !important; */
		padding: 0px 8px;
		z-index: 100;
		/* top: 5px; */
		background: white;
		pointer-events: auto;
	}

	#register_by_default {
		margin-top: 30px;
		margin-bottom: 30px;
		margin-left: 5px;
	}

	#simplyin_api_key {
		width: 100%;
	}

	.registerByDefaultContainer {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
	}
	
	.registerByDefaultContainer > div{
		width: 100%
	}
	.switch {
		position: relative;
		display: inline-block;
		width: 60px;
		height: 34px;
	}

	.switch input {
		opacity: 0;
		width: 0;
		height: 0;
	}

	.slider {
		position: absolute;
		cursor: pointer;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: #ccc;
		-webkit-transition: .4s;
		transition: .4s;
	}

	.slider:before {
		position: absolute;
		content: "";
		height: 26px;
		width: 26px;
		left: 4px;
		bottom: 4px;
		background-color: white;
		-webkit-transition: .4s;
		transition: .4s;
	}

	input:checked+.slider {
		background-color: #DCEBFF;
	}

	input:focus+.slider {
		box-shadow: 0 0 1px #DCEBFF;
	}

	input:checked+.slider:before {
		-webkit-transform: translateX(26px);
		-ms-transform: translateX(26px);
		transform: translateX(26px);
		background-color: #3167B9;

	}

	/* Rounded sliders */
	.slider.round {
		border-radius: 34px;
	}

	.slider.round:before {
		border-radius: 50%;
	}

	.row {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
	}

	.form-table {
		position: relative
	}
	#eye-container{
		position:absolute;
		width:100%;
		height:100%;
		display:flex;
		flex-direction:row;
		justify-content: flex-end;
		align-items: center;
		top:0;
		right:0;
		pointer-events:none;
	}
</style>


<div class="container">
	<div class="white-box">
		<div class="d-flex align-items-center justify-content-between">
			<p class="m-0 bold mb-1" style=" margin-top: 10px;">
				<a href="https://www.simply.in" target="_blank">
					<svg width="155" height="24" viewBox="0 0 155 24" fill="none" xmlns="http://www.w3.org/2000/svg"
						{...props}>
						<g clipPath="url(#clip0_2966_28163)" style='transform: scale(0.8)'>
							<path
								d="M16.7406 3.14222C16.7406 4.49662 15.6029 5.58014 14.1943 5.58014C13.6525 5.58014 13.6525 5.58014 12.1898 5.09256C11.3771 4.82168 10.402 4.65915 9.6435 4.65915C7.96404 4.65915 6.71799 5.47179 6.71799 6.55531C6.71799 7.0429 7.04305 7.58466 7.53063 7.85554C8.23492 8.28895 8.23492 8.28894 10.6187 8.88488C16.1988 10.2393 18.5284 12.4063 18.5284 16.0903C18.5284 18.0948 17.7157 19.991 16.3613 21.3454C14.7902 22.9165 12.1356 23.7833 8.93921 23.7833C3.90084 23.7833 0.379395 22.158 0.379395 19.9368C0.379395 18.5824 1.51709 17.4447 2.87149 17.4447C3.57578 17.4447 3.57578 17.4447 6.33876 18.4199C7.20558 18.7449 8.2891 18.9075 9.15592 18.9075C11.1063 18.9075 12.3523 17.9323 12.3523 16.5237C12.3523 15.8194 12.0272 15.2235 11.3771 14.8984C10.6728 14.465 10.1311 14.3025 7.36811 13.544C4.38842 12.623 3.25073 12.1354 2.1672 11.1603C1.08368 10.2393 0.541923 8.77653 0.541923 7.0429C0.541923 2.76299 4.4426 -0.270874 9.86021 -0.270874C13.8692 -0.270874 16.7406 1.1377 16.7406 3.14222Z"
								fill="#303030" />
							<path
								d="M21.2373 3.46727C21.2373 2.22122 21.2915 1.89616 21.6165 1.30023C22.1041 0.541761 23.1335 0 24.1628 0C25.1922 0 26.2215 0.541761 26.6549 1.30023C26.98 1.89616 27.0341 2.16704 27.0341 3.46727V19.991C27.0341 21.237 26.98 21.5621 26.6549 22.158C26.2215 22.9165 25.1922 23.4582 24.1628 23.4582C23.0793 23.4582 22.1041 22.9165 21.6165 22.158C21.2915 21.5621 21.2373 21.2912 21.2373 19.991V3.46727Z"
								fill="#303030" />
							<path
								d="M35.1606 20.3702C34.9439 21.6163 34.8355 21.9413 34.4021 22.4831C33.9687 23.079 33.0477 23.4582 32.1267 23.4582C30.5014 23.4582 29.3096 22.3205 29.3096 20.8036C29.3096 20.4786 29.3637 20.0993 29.4721 19.5576L32.4518 2.92551C32.7768 1.02935 34.1312 0 36.3525 0C38.0319 0 39.4405 0.866817 39.9281 2.22122L44.1538 13.9774L48.0545 2.7088C48.6504 0.975169 50.1132 0 51.8468 0C53.743 0 55.3683 1.1377 55.6391 2.7088L58.8355 19.5034C58.9981 20.316 58.9981 20.4786 58.9981 20.8578C58.9981 22.3747 57.752 23.5124 56.1267 23.5124C55.2057 23.5124 54.3389 23.1332 53.8513 22.5372C53.4179 21.9955 53.3096 21.7246 53.0387 20.4244L51.0884 9.69752L47.6753 20.3702C47.1335 21.9955 46.971 22.3747 46.4834 22.754C45.9416 23.2415 45.1832 23.4582 44.3163 23.4582C42.6369 23.4582 41.7159 22.754 41.12 20.9661L37.0567 9.64334L35.1606 20.3702Z"
								fill="#303030" />
							<path
								d="M67.2329 19.991C67.2329 21.237 67.1787 21.5621 66.8536 22.158C66.4202 22.9165 65.3909 23.4583 64.3615 23.4583C63.278 23.4583 62.3029 22.9165 61.8153 22.158C61.4902 21.5621 61.436 21.237 61.436 19.991V4.1174C61.436 2.49212 61.5444 2.11288 62.032 1.46277C62.7363 0.65013 63.6031 0.325073 64.9033 0.325073H65.6076H70.8085C73.6798 0.325073 75.6843 0.92101 77.2554 2.22124C78.9349 3.62981 79.9101 5.79686 79.9101 8.01808C79.9101 9.91424 79.2058 11.8646 77.9597 13.219C76.497 14.8443 74.3841 15.6569 71.567 15.6569H67.1787V19.991H67.2329ZM70.1584 11.1061C72.488 11.1061 74.0049 9.86006 74.0049 8.01808C74.0049 6.12191 72.5963 4.87586 70.4293 4.87586H67.2329V11.1061H70.1584Z"
								fill="#303030" />
							<path
								d="M92.9663 18.4199C94.2123 18.4199 94.5374 18.474 95.1333 18.7449C95.8918 19.07 96.4335 19.9368 96.4335 20.7494C96.4335 21.6163 95.8918 22.4831 95.1333 22.8081C94.5374 23.079 94.2665 23.1332 92.9663 23.1332H86.1401C82.9979 23.2957 81.6435 22.0497 81.806 19.1783V3.46727C81.806 2.22122 81.8602 1.89616 82.1852 1.30023C82.6186 0.541761 83.648 0 84.7315 0C85.7608 0 86.7902 0.541761 87.2236 1.30023C87.5487 1.89616 87.6028 2.16704 87.6028 3.46727V18.4199H92.9663Z"
								fill="#303030" />
							<path
								d="M106.348 19.991C106.348 21.237 106.294 21.5621 105.969 22.158C105.535 22.9165 104.506 23.4582 103.477 23.4582C102.393 23.4582 101.418 22.9165 100.93 22.158C100.605 21.5621 100.551 21.2912 100.551 19.991V12.3521L94.4834 4.82167C93.6708 3.79233 93.3999 3.19639 93.3999 2.54628C93.3999 1.1377 94.7001 0 96.3254 0C97.5173 0 98.1132 0.379233 99.1967 1.84199L103.531 7.36795L107.973 1.78781C109.111 0.325056 109.761 0 110.899 0C112.47 0 113.824 1.19187 113.824 2.54628C113.824 3.30474 113.553 3.79233 112.632 4.93002L106.348 12.4063V19.991Z"
								fill="#303030" />
							<path
								d="M126.23 11.7562C126.23 10.2393 126.718 8.99327 127.639 7.96392C127.91 7.63886 128.235 7.42216 128.614 7.20545C128.831 7.0971 128.993 6.82622 128.993 6.60952V3.41313C128.993 1.6795 127.747 0.162565 126.068 -0.0541394C124.009 -0.32502 122.221 1.30026 122.221 3.30478V20.0452C122.221 21.7788 123.467 23.2957 125.147 23.5125C127.205 23.7833 128.993 22.1581 128.993 20.1535V16.9571C128.993 16.6863 128.831 16.4696 128.614 16.3612C128.289 16.1445 127.964 15.8736 127.639 15.6027C126.664 14.5734 126.23 13.2732 126.23 11.7562Z"
								fill="#0000E9" />
							<path
								d="M150.225 0.0424545C148.643 0.262389 147.47 1.80193 147.47 3.56141V11.4241L139.46 1.19711C139.205 0.867209 138.898 0.592291 138.541 0.42734C138.49 0.372356 138.388 0.372356 138.337 0.317373C138.337 0.317373 138.286 0.317373 138.286 0.262389C138.235 0.262389 138.184 0.207405 138.082 0.207405C138.031 0.207405 137.98 0.152422 137.98 0.152422C137.929 0.152422 137.878 0.0974381 137.827 0.0974381C137.776 0.0974381 137.725 0.0424545 137.674 0.0424545C137.623 0.0424545 137.572 0.0424545 137.521 0.0424545C137.47 0.0424545 137.419 0.0424545 137.368 0.0424545C137.317 0.0424545 137.266 0.0424545 137.215 0.0424545C137.164 0.0424545 137.113 0.0424545 137.113 0.0424545C137.011 0.0424545 136.909 0.0424545 136.807 0.0424545C136.194 0.0974381 135.582 0.372356 135.072 0.812225C134.613 1.25209 134.256 1.80193 134.103 2.40675C134.103 2.51672 134.052 2.5717 134.052 2.68167C134.052 2.73665 134.052 2.73665 134.052 2.79164C134.052 2.84662 134.052 2.95659 134 3.01157C134 3.06655 134 3.06655 134 3.12154C134 3.17652 134 3.28649 134 3.34147C134 3.39645 134 3.39645 134 3.45144V6.80544C134 7.02537 134.103 7.30029 134.307 7.41026C134.664 7.63019 134.97 7.90511 135.276 8.23501C136.143 9.2797 136.603 10.5443 136.603 12.0839C136.603 13.6234 136.143 14.888 135.276 15.9327C134.97 16.2626 134.664 16.5375 134.307 16.7575C134.103 16.8674 134 17.0874 134 17.3623V20.3864C134 22.1459 135.174 23.6854 136.756 23.9053C138.694 24.1803 140.378 22.5308 140.378 20.4964V12.7437L148.235 22.8057C149.307 24.1803 151.245 24.4002 152.623 23.3005C153.439 22.6957 154 21.651 154 20.4964V3.39645C153.796 1.36206 152.164 -0.287447 150.225 0.0424545Z"
								fill="#0000E9" />
							<path
								d="M131.485 14.7901C131.268 14.7901 131.052 14.7901 130.835 14.736C130.239 14.6276 129.697 14.3567 129.318 13.9233C128.776 13.3274 128.505 12.6231 128.505 11.7563C128.505 10.8895 128.776 10.1852 129.318 9.58923C129.86 8.99329 130.564 8.72241 131.485 8.72241C131.593 8.72241 131.702 8.72241 131.81 8.77659C132.569 8.83076 133.165 9.10164 133.652 9.58923C134.194 10.1852 134.465 10.8895 134.465 11.7563C134.465 12.6231 134.194 13.3274 133.652 13.9233C133.381 14.1942 133.056 14.4109 132.677 14.5734C132.352 14.736 131.918 14.7901 131.485 14.7901Z"
								fill="#FFC200" />
						</g>
						<defs>
							<clipPath id="clip0_2966_28163">
								<rect width="154.781" height="24" fill="white" />
							</clipPath>
						</defs>
					</svg>
				</a>
			</p>
		</div>

		<div class="form-group form-pw">
			<?php settings_errors(); ?>
			<form method="POST" action="options.php">
				<div class="form-pw">
					<?php
					echo wp_kses('
					
					<div id="eye-container">
						<img src=' . $dir . '../img/icons/view.png alt="" onclick="showhides()" class="show-pass eye-icon">
						<img id="iconCrosed" src=' . $dir . '../img/icons/hidden.png alt="" style="display: none" onclick="showhides()" class="hide-pass eye-icon" >				
					</div>
					', $allowedposttags);

					settings_fields('settings_simply_apikey');

					do_settings_sections('settings_simply_apikey');
					?>
				</div>
				<?php submit_button($text = "Save changes"); ?>
			</form>
			<div>
				<h2>Help</h2>
				<div>If you have any questions or issues rellated to the plugin, please contact us via email: <a
						href="mailto:support@simply.in">support@simply.in</a></div>
				<div style="margin-top:8px;">For more information about our services, visit <a
						href="https://www.simply.in" target="_blank">Simply.IN website</a></div>
			</div>

		</div>
	</div>
	<script>

		const eyeContainer = document.getElementById('eye-container');
		eyeContainer.remove()
		const inputParent = document.getElementById("simplyin_api_key").parentNode.parentNode
		inputParent.style.position = 'relative'
		inputParent.appendChild(eyeContainer)
	</script>