(function(global) {

	'use strict';

	var HeaderMediator = function(target, tpl, dispatcher, mediators) {

		console.log('tile mediator created');

		var template = tpl(target);
		var scope = template.scope;

		scope.add = function() {
			dispatcher.dispatch('add');
		};

	};

	// export
	global.tile = global.tile || {};
	global.tile.HeaderMediator = HeaderMediator;

})(this);
