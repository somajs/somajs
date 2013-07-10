(function(global) {

	var SignInMediator = function(target, dispatcher) {

		dispatcher.addEventListener('authenticate', function(event) {
			target.style.display = event.params ? 'none' : 'block';
		});

	};

	// exports
	global.gp = global.gp || {};
	global.gp.SignInMediator = SignInMediator;

})(this);