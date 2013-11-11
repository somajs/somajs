(function(global) {

	'use strict';

	var ListMediator = function(target, tpl, model, dispatcher, mediatorSupport) {

		dispatcher.dispatch('log', 'list template mediator created');

		var template = tpl(target);
		var scope = template.scope;

		dispatcher.addEventListener('add', function() {
			model.add();
			render();
			mediatorSupport(target); // IE
		});

		dispatcher.addEventListener('remove', function(event) {
			model.remove(event.params);
			render();
			mediatorSupport(target); // IE
		});

		function render() {
			scope.items = model.getData();
			template.render();
		}

		render();

	};

	// export
	global.tile = global.tile || {};
	global.tile.ListMediator = ListMediator;

})(this);
