(function(global) {

	'use strict';

	var TileModel = function(partials) {

		var index = 0;
		var data = {};
		var colors = ['#FF9A3E', '#00CF9B', '#CC006A']

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
			wrapper.firstChild.setAttribute('data-mediator', 'item|data:get(' + item.id + ')');
			wrapper.firstChild.setAttribute('data-hover', 'hover|color:getColor(' + item.id + ')');
			return wrapper.firstChild;
		};

		this.remove = function(id) {
			delete data[id];
		};

		this.get = function(id) {
			return data[id];
		};

		this.add = function() {
			add();
		};

		this.getData = function() {
			return data;
		};

		this.getColor = function(count) {
			return colors[count % 3];
		}

	};


	function insertItem() {
		var item = model.add();
	}



	// export
	global.tile = global.tile || {};
	global.tile.TileModel = TileModel;

})(this);
