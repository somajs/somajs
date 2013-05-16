(function(snake) {

	'use strict';

	snake.SnakeLayer = function(context, grid, time, snake, path) {

		snake.width = grid.cellWidth;
		snake.height = grid.cellHeight;

		this.update = function() {
			snake.path = path.get();
		};

		this.draw = function() {
			snake.draw(context);
		};

		this.getPosition = function() {
			return snake.path.length === 0 ? null : snake.path[0];
		};

		time.add(this);

	};

})(window.snake = window.snake || {});