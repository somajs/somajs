(function(global) {

	var ProfileMediator = function(target, profile, partial) {

		console.log('create profile', profile);
		var template = null;
		var scope = null;

		partial.load('partials/profile.html', function(data) {
			target.innerHTML = data;
			template = soma.template.create(target);
			scope = template.scope;
			scope.user = profile;
			template.render();
		});

		this.dispose = function() {
			console.log('Profile properly removed');
		};

	};

	// exports
	global.gp = global.gp || {};
	global.gp.ProfileMediator = ProfileMediator;

})(this);