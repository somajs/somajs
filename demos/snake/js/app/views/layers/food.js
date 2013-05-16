(function(snake) {

	'use strict';

	snake.FoodLayer = function(context, grid, time, food) {

		var cell = {
			col: 0,
			row: 0
		};

		food.width = grid.cellWidth;
		food.height = grid.cellHeight;

		this.update = function() {

		};

		this.draw = function() {
			food.draw(context);
		};

		this.getPosition = function() {
			return cell;
		};

		this.setRandomPosition = function() {
			cell.col = Math.floor((Math.random() * grid.numCols));
			cell.row = Math.floor((Math.random() * grid.numRows));
			food.x = cell.col * grid.cellWidth;
			food.y = cell.row * grid.cellHeight;
		};

		this.reset = function() {
			this.setRandomPosition();
		};

		time.add(this);

	};

})(window.snake = window.snake || {});