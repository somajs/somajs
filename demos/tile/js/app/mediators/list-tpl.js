(function(global) {

	'use strict';

	var ListTplMediator = function(target, tpl, model, dispatcher, mediators) {

		dispatcher.dispatch('log', 'list template mediator created');

		var template = tpl(target);
		var scope = template.scope;

		this.scope = scope;
		this.template = template;

		dispatcher.addEventListener('add', function() {
//			model.add();
			update();
		});

		dispatcher.addEventListener('remove', function(event) {
//			model.remove(event.params);
			update();
		});

		function update() {
			scope.items = model.getData();
			scope.itemsRaw = JSON.stringify(model.getData(), undefined, 2);
			template.render();
		}

		update();

	};

	// export
	global.tile = global.tile || {};
	global.tile.ListTplMediator = ListTplMediator;

})(this);
