(function(global) {

	'use strict';

	var ItemMediator = function(target, model) {

		var id = target.getAttribute('data-id');
		var data = model.getById(parseInt(id));

		console.log('item mediator created', data);

		this.dispose = function() {
			console.log('item mediator removed');
		};

	};

	// export
	global.tile = global.tile || {};
	global.tile.ItemMediator = ItemMediator;

})(this);
