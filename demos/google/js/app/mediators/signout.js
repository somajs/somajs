(function(global) {

	var SignOutMediator = function(target) {
		console.log('mediator created', target);
	};

	// exports
	global.gp = global.gp || {};
	global.gp.SignOutMediator = SignOutMediator;

})(this);