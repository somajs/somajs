(function(global) {

	var SignOutMediator = function(target, dispatcher) {

		var template = soma.template.create(target);
		var scope = template.scope;

		dispatcher.addEventListener('authenticate', function(event) {
			target.style.display = event.params ? 'block' : 'none';
		});

		scope.disconnect = function() {
			dispatcher.dispatch('signout');
		};

	};

	// exports
	global.gp = global.gp || {};
	global.gp.SignOutMediator = SignOutMediator;

})(this);