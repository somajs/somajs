(function(global) {

	'use strict';

	var UserModel = function() {
		this.dispatcher = null;
		this.injector = null;
		this.api = null;
	};

	UserModel.prototype.initialize = function(api) {
		this.api = api;
		this.updateProfile();
	};

	UserModel.prototype.updateProfile = function() {

		var request = this.api.client.plus.people.get( {'userId' : 'me'} );

		request.execute( function(profile) {

			this.injector.removeMapping('profile');
			this.injector.mapValue('profile', profile);

			this.dispatcher.dispatch('create-profile', profile);

		}.bind(this));

	};

	// exports
	global.gp = global.gp || {};
	global.gp.UserModel = UserModel;

})(this);