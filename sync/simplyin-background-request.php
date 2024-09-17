<?php

class SimplyIn_Background_Request extends WP_Async_Request {
    
	/**
	 * @var string
	 */
	protected $action = 'simplyin_background_request';
        protected $simplyin_api;
        
	/**
	 * Handle
	 *
	 * Override this method to perform any actions required
	 * during the async request.
	 */
        
        public function setSimplyInApi($simplyInApi) {
            $this->simplyin_api = $simplyInApi;
        }
    
	protected function handle() {
	}

}

