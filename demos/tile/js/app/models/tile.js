(function(global) {

	'use strict';

	var TileModel = function(dispatcher) {

		var index=  0;
		var data = {};

		this.add = function() {
			return data[index] = {
				id: index,
				img: 'images/nature' + index % 5 + '.jpg',
				title: 'Tile ' + index++
			};
		};

		this.remove = function(id) {
			delete data[id];
		};

		this.get = function(id) {
			return data[id];
		};

		this.getData = function() {
			return data;
		};

	};

	// export
	global.tile = global.tile || {};
	global.tile.TileModel = TileModel;

})(this);
