(function(global) {

	'use strict';

	var TileModel = function(partials) {

		var index = 0;
		var data = {};

		this.add = function() {

		};

		function add() {
			var item = {
				id: index,
				img: 'images/nature' + index % 5 + '.jpg',
				title: 'Tile ' + index
			};
			data[index] = item;
			index++;
			return item;
		}

		this.create = function() {
			var item = add();
			var wrapper = document.createElement('div');
			wrapper.innerHTML = partials['tile-item.tpl.html'];
			wrapper.firstChild.setAttribute('data-mediator', 'item|get(' + item.id + ')');
			return wrapper.firstChild;
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


	function insertItem() {
		var item = model.add();
	}



	// export
	global.tile = global.tile || {};
	global.tile.TileModel = TileModel;

})(this);
