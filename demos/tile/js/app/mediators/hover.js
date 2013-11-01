(function(global) {

	'use strict';

	var TileHover = function(target, data, dispatcher) {

		dispatcher.dispatch('log', 'hover mediator created, with data: ' + data);

		target.addEventListener('mouseover', function() {
			target.style.backgroundColor = data;
		});

		target.addEventListener('mouseout', function() {
			target.style.backgroundColor = '#FFF';
		});


		this.dispose = function() {

		}

	};

	// export
	global.tile = global.tile || {};
	global.tile.TileHover = TileHover;

})(this);
