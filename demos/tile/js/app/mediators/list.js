(function(global) {

	'use strict';

	var ListMediator = function(target, tpl, model, dispatcher) {

		console.log('list mediator created');

		var template = tpl(target);
		var scope = template.scope;

		dispatcher.addEventListener('render', render);

		scope.remove = function(event, item) {
			model.remove(item);
		};

		function render() {
			scope.items = model.get();
			template.render();
		}

	};

	// export
	global.tile = global.tile || {};
	global.tile.ListMediator = ListMediator;

})(this);
