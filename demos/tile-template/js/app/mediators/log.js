(function(global) {

	'use strict';

	var LogMediator = function(target, dispatcher) {

		dispatcher.addEventListener('log', function(event) {
			console.log('[LOG] ' + event.params);
			target.innerHTML = event.params + '<br/>' + target.innerHTML;
		});

		dispatcher.dispatch('log', 'log mediator created');

		this.dispose = function() {
			console.log('log mediator removed');
		};

	};

	// export
	global.tile = global.tile || {};
	global.tile.LogMediator = LogMediator;

})(this);
