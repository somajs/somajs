(function(global) {

	'use strict';

	var ItemPtlMediator = function(target, dispatcher, tpl, parentTemplate, parentScope, data, partials) {

		dispatcher.dispatch('log', 'item template mediator created, with data: ' + data);

		console.log('>>>>>>>>>>>>>', data);
		console.log('>>>>>>>>>>>>>', parentScope);
		console.log('>>>>>>>>>>>>>', parentTemplate);


		target.innerHTML = partials['tile-item.tpl.html'];

		var template = tpl(target.firstChild);
		var scope = template.scope;

		scope.item = data;
		template.render();

		console.log('----------------------------------------CREATED');

//		var template = tpl(target);
//		var scope = template.scope;

//		scope.data = data;
//		template.render();
//
//		if (data) {
//			data.remove = function() {
//				console.log('REMOVE ITEM');
//	//			target.parentNode.removeChild(target);
//				dispatcher.dispatch('remove', data.id);
//			};
//		}

		this.dispose = function() {
			dispatcher.dispatch('log', 'item template mediator removed, id: ' + data.id);
//			template.dispose();
//			template = null;
		};

	};

	// export
	global.tile = global.tile || {};
	global.tile.ItemPtlMediator = ItemPtlMediator;

})(this);
