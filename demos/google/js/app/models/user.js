(function(global) {

	'use strict';

	var UserModel = function() {
		this.dispatcher = null;
		this.injector = null;
		this.gapi = null;
	};

	UserModel.prototype.initialize = function(gapi) {
		this.gapi = gapi;
		this.updateProfile();
	};

	UserModel.prototype.updateProfile = function() {

		var request = this.gapi.client.plus.people.get( {'userId' : 'me'} );

		request.execute(function(profile) {

			this.injector
				.removeMapping('profile')
				.mapValue('profile', profile);

			this.dispatcher.dispatch('create-module', 'profile');

		}.bind(this));

	};

	UserModel.prototype.getPeople = function(peopleStack) {

		var options = {
			'userId': 'me',
			'collection': 'visible',
			'pageToken' : peopleStack ? peopleStack.nextPageToken : undefined
		};

		var request = this.gapi.client.plus.people.list(options);

		request.execute(function(people) {

			if (peopleStack) {
				people.items = peopleStack.items.concat(people.items);
				this.dispatcher.dispatch('update-people', people);
			}
			else {
				this.injector.removeMapping('people').mapValue('people', people);
				this.dispatcher.dispatch('create-module', 'people');
			}
			if (people.items.length < people.totalItems) {
				this.getPeople(people);
			}
		}.bind(this));
	};

	// exports
	global.gp = global.gp || {};
	global.gp.UserModel = UserModel;

})(this);