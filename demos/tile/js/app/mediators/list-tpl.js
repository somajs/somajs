(function(global) {

	'use strict';

	var ListTplMediator = function(target, tpl, model, dispatcher, mediators) {

		dispatcher.dispatch('log', 'list template mediator created');

		var templateCache = target.innerHTML;
		var template = tpl(target);
		var scope = template.scope;

		this.scope = scope;
		this.template = template;

		dispatcher.addEventListener('add', function() {
//			model.add();
			// append html to the current element
//			target.appendChild(model.create());
//			mediators.support(target); // for IE
			//dispatcher.dispatch('render');
			update();
		});

		dispatcher.addEventListener('remove', function(event) {
//			model.remove(event.params);
//			mediators.support(target); // for IE
			update();
		});

		function update() {
			console.log('UPDATE', model.getData(), target.innerHTML);
			scope.items = model.getData();
			scope.itemsRaw = JSON.stringify(model.getData(), undefined, 2);
			template.render();
			console.log('----------------------------------------UPDATE');
		}

		update();

	};

	// export
	global.tile = global.tile || {};
	global.tile.ListTplMediator = ListTplMediator;

})(this);
