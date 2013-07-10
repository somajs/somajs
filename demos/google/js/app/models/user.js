(function(global) {

	'use strict';

	var UserModel = function() {

		this.authenticate = function() {
			console.log('oauth');
		}

	};

	// exports
	global.gp = global.gp || {};
	global.gp.UserModel = UserModel;

})(this);