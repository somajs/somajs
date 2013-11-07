(function(global) {

	'use strict';

	var TileHover = function(target, dispatcher, color) {

		dispatcher.dispatch('log', 'hover mediator created with ' + color);

		if (!target.addEventListener) {
			target.attachEvent("onmouseover", mouseOver);
			target.attachEvent("onmouseout", mouseOut);
		}
		else {
			target.addEventListener('mouseover', mouseOver);
			target.addEventListener('mouseout', mouseOut);
		}

		function mouseOver() {
			target.style.backgroundColor = color;
		}

		function mouseOut() {
			target.style.backgroundColor = '#FFF';
		}


		this.dispose = function() {
			if (!target.removeEventListener) {
				target.detachEvent("onmouseover", mouseOver);
				target.detachEvent("onmouseout", mouseOut);
			}
			else {
				target.removeEventListener('mouseover', mouseOver);
				target.removeEventListener('mouseout', mouseOut);
			}
		}

	};

	// export
	global.tile = global.tile || {};
	global.tile.TileHover = TileHover;

})(this);
