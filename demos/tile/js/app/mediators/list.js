(function(global) {

	'use strict';

	var ListMediator = function(target, model, dispatcher, mediatorSupport) {

		dispatcher.dispatch('log', 'list mediator created');

		dispatcher.addEventListener('add', function() {
			// append html to the current element
			target.appendChild(model.create());
			mediatorSupport(target); // for IE
		});

		dispatcher.addEventListener('remove', function(event) {
			model.remove(event.params);
			mediatorSupport(target); // for IE
		});

	};

	// export
	global.tile = global.tile || {};
	global.tile.ListMediator = ListMediator;

})(this);
