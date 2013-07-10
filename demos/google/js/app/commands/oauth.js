(function(global) {

	'use strict';

	var OAuthCommand = function(oauth) {

		this.execute = function(event) {

			switch(event.type) {
				case 'oauth':
					oauth.initialize();
					break;
				case 'signin':
					oauth.signin(event.params);
					break;
			}

		}

	};

	// exports
	global.gp = global.gp || {};
	global.gp.OAuthCommand = OAuthCommand;

})(this);