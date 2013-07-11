(function(global) {

	var ProfileMediator = function(target, profile, dispatcher) {

		console.log('Profile created', profile);

		var template = soma.template.create(target);
		scope = template.scope;
		scope.user = profile;

		template.render();

		scope.getPeople = function() {
			dispatcher.dispatch('request-people');
		};

		this.dispose = function() {
			console.log('Profile removed');
			template.dispose();
			template = null;
		};

	};

	// exports
	global.gp = global.gp || {};
	global.gp.ProfileMediator = ProfileMediator;

})(this);