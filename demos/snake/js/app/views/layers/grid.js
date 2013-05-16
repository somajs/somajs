(function(snake) {

	'use strict';

	snake.GridLayer = function(context, time, grid, debug) {

		this.update = function() {

		};

		this.draw = function() {
			if (debug.drawGrid) {
				context.save();
				context.strokeStyle = 'rgba(46, 70, 119, 0.7)';
				// draw X
				for (var i = 0, l = grid.numCols+1; i<l; i++) {
					var x = i * grid.cellWidth;
					context.beginPath();
					context.moveTo(x, 0);
					context.lineTo(x, grid.height);
					context.stroke();
				}
				// draw Y
				for (var a = 0, b = grid.numRows+1; a<b; a++) {
					var y = a * grid.cellHeight;
					context.beginPath();
					context.moveTo(0, y);
					context.lineTo(grid.width, y);
					context.stroke();
				}
				context.restore();
			}
		};

		time.add(this);

	};

})(window.snake = window.snake || {});