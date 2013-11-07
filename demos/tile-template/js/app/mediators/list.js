(function(global) {

	'use strict';

	var ListMediator = function(target, tpl, model, dispatcher, mediators) {

		dispatcher.dispatch('log', 'list template mediator created');

		var template = tpl(target);
		var scope = template.scope;

		dispatcher.addEventListener('add', function() {
			model.add();
			render();
			mediators.support(target); // IE
		});

		dispatcher.addEventListener('remove', function(event) {
			model.remove(event.params);
			render();
			mediators.support(target); // IE
		});

		function render() {
			scope.items = model.getData();
			scope.itemsRaw = JSON.stringify(model.getData(), undefined, 2);
			template.render();
		}

		render();

	};

	// export
	global.tile = global.tile || {};
	global.tile.ListMediator = ListMediator;

})(this);
