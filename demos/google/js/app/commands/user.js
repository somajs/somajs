(function(global) {

	'use strict';

	var UserCommand = function(oauth, user) {

		this.execute = function(event) {

			switch(event.type) {
				case 'authenticate':
					if (event.params) {
						user.initialize(oauth.gapi);
					}
					break;
				case 'request-people':
					user.getPeople();
					break;
			}

		}

	};

	// exports
	global.gp = global.gp || {};
	global.gp.UserCommand = UserCommand;

})(this);