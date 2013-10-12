(function(global) {

	'use strict';

	var TileHover = function(target) {

		console.log('tile hover created', target);

	};

	// export
	global.tile = global.tile || {};
	global.tile.TileHover = TileHover;

})(this);
