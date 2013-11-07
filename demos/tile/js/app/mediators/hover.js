(function(global) {

	'use strict';

	var TileHover = function(target, dispatcher, color) {

		dispatcher.dispatch('log', 'hover mediator created with ' + color);

		target.addEventListener('mouseover', mouseOver);
		target.addEventListener('mouseout', mouseOut);

		function mouseOver() {
			target.style.backgroundColor = color;
		}

		function mouseOut() {
			target.style.backgroundColor = '#FFF';
		}


		this.dispose = function() {
			target.removeEventListener('mouseover', mouseOver);
			target.removeEventListener('mouseout', mouseOut);
		}

	};

	// export
	global.tile = global.tile || {};
	global.tile.TileHover = TileHover;

})(this);
