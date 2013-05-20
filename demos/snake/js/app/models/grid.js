(function(snake) {

	'use strict';

	var Grid = function(config) {
		this.width = config.canvas.width;
		this.height = config.canvas.height;
		this.cellWidth = config.grid.width;
		this.cellHeight = config.grid.height;
		this.numCols = Math.ceil(this.width / this.cellWidth);
		this.numRows = Math.ceil(this.height / this.cellHeight);
		this.numIndex = this.numCols * this.numRows;
	};

	Grid.prototype.isInBoundaries = function(col, row) {
		return !(col < 0 || col >= this.numCols || row < 0 || row >= this.numRows);
	};

	Grid.prototype.getIndexFromCoords = function(x, y) {
		var pos = this.getPositionFromCoords(x, y);
		return this.getIndexFromPosition(pos.col, pos.row);
	};

	Grid.prototype.getIndexFromPosition = function(col, row) {
		return row * (this.numRows) + col;
	};

	Grid.prototype.getPositionFromCoords = function(x, y) {
		return {
			col: Math.floor((x / this.width) * this.numCols),
			row: Math.floor((y / this.height) * this.numRows)
		};
	};

	Grid.prototype.getPositionFromIndex = function(index) {
		return {
			row: Math.floor(index / this.numCols),
			col: index % (this.numCols)
		};
	};

	Grid.prototype.getCoordsFromPosition = function(col, row) {
		return {
			x: col * this.cellWidth,
			y: row * this.cellHeight
		};
	};

	Grid.prototype.getCoordsFromIndex = function(index) {
		var pos = this.getPositionFromIndex(index);
		return this.getCoordsFromPosition(pos.col, pos.row);
	};

	// exports
	snake.Grid = Grid;

})(window.snake = window.snake || {});