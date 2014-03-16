(function(global) {

	'use strict';

	var TileModel = function(partials) {

		var index = 0;
		var items = {};
		var colors = ['#FF9A3E', '#00CF9B', '#CC006A'];

		this.add = function() {

		};

		function add() {
			var item = {
				id: index,
				img: 'images/nature' + index % 5 + '.jpg',
				title: 'Tile ' + index
			};
			items[index] = item;
			index++;
			return item;
		}

		this.create = function() {
			var item = add();
			var wrapper = document.createElement('div');
			wrapper.innerHTML = partials['tile-item.tpl.html'];
			wrapper.firstChild.setAttribute('data-mediator', 'item|data:data.get(' + item.id + ')');
//			wrapper.firstChild.setAttribute('data-hover', 'hover|color:getColor(' + item.id + ')');
			return wrapper.firstChild;
		};

		this.remove = function(id) {
			delete items[id];
		};

		this.get = function(id) {
			return items[id];
		};

		this.add = function() {
			add();
		};

		this.getData = function() {
			return items;
		};

		this.getColor = function(count) {
			return colors[count % 3];
		}

	};

	// export
	global.tile = global.tile || {};
	global.tile.TileModel = TileModel;

})(this);
