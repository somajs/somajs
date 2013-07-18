(function(global) {

	'use strict';

	var LogMediator = function(target, dispatcher) {

		dispatcher.addEventListener('log', function(event) {
			target.innerHTML += event.params + '<br/>';
		});

		this.dispose = function() {
			console.log('log mediator removed');
		};

	};

	// export
	global.tile = global.tile || {};
	global.tile.LogMediator = LogMediator;

})(this);
