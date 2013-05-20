(function(snake) {

	'use strict';

	var Cell = function() {

		this.index = null;
		this.x = null;
		this.y = null;
		this.col = null;
		this.row = null;
		this.direction = null;
	};

	Cell.prototype.toString = function() {
		return '[Position] x: ' + this.x +
				', y: ' + this.y +
				', index: ' + this.index +
				', col: ' + this.col +
				', row: ' + this.row + 
				', direction: ' + this.direction;
	};

	snake.Cell = Cell;

})(window.snake = window.snake || {});
