(function(global) {

	'use strict';

	var ItemMediator = function(target, dispatcher, tpl, data) {

		dispatcher.dispatch('log', 'item mediator created, id: ' + data.id);

		var template = tpl(target);
		var scope = template.scope;

		scope.item = data;
		template.render();

        console.log('>>> DATA', data);

		scope.remove = function() {
			target.parentNode.removeChild(target);
			dispatcher.dispatch('remove', data.id);
		};

		this.dispose = function() {
			dispatcher.dispatch('log', 'item mediator removed, id: ' + data.id);
			template.dispose();
			template = null;
		};

	};

	// export
	global.tile = global.tile || {};
	global.tile.ItemMediator = ItemMediator;

})(this);
