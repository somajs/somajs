(function(global) {

	'use strict';

	var TileModel = function(dispatcher) {

		var index=  0;
		var data = [];

		dispatcher.addEventListener('add', function() {
			data.push(getNewTile());
			dispatcher.dispatch('render');
		});

		function getNewTile() {
			index++;
			return {
				id: index,
				title: 'Tile ' + index
			};
		}

		this.remove = function(item) {
			data.splice(data.indexOf(item), 1);
			dispatcher.dispatch('render');
		};

		this.getById = function(id) {
			for (var i = 0, l=data.length; i<l; i++) {
				if (data[i].id === id) {
					return data[i];
				}
			}
			return undefined;
		};

		this.get = function() {
			return data;
		};

	};

	// export
	global.tile = global.tile || {};
	global.tile.TileModel = TileModel;

})(this);
