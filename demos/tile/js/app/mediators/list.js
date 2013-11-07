(function(global) {

	'use strict';

	var ListMediator = function(target, model, dispatcher, mediators) {

		dispatcher.dispatch('log', 'list mediator created');

		dispatcher.addEventListener('add', function() {
			// append html to the current element
			target.appendChild(model.create());
			mediators.support(target); // for IE
		});

		dispatcher.addEventListener('remove', function(event) {
			model.remove(event.params);
			mediators.support(target); // for IE
		});

	};

	// export
	global.tile = global.tile || {};
	global.tile.ListMediator = ListMediator;

})(this);
