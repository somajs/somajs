(function(global) {

	'use strict';

	var TileHover = function(dispatcher) {

		this.color = null;
		this.target = null;

		dispatcher.dispatch('log', 'hover mediator created');

		var self = this;

		function mouseOver() {
			self.target.style.backgroundColor = self.color;
		}

		function mouseOut() {
			self.target.style.backgroundColor = '#FFF';
		}


		this.postConstruct = function() {
			this.target.addEventListener('mouseover', mouseOver);
			this.target.addEventListener('mouseout', mouseOut);
			dispatcher.dispatch('log', 'hover mediator updated with data: ' + this.color);
		};

		this.dispose = function() {
			this.target.removeEventListener('mouseover', mouseOver);
			this.target.removeEventListener('mouseout', mouseOut);
		}

	};

	// export
	global.tile = global.tile || {};
	global.tile.TileHover = TileHover;

})(this);
