(function(snake) {

	'use strict';

	snake.Canvas = function(target, injector, time, grid) {

		var context = target.getContext('2d');

		injector.mapValue('canvas', target);
		injector.mapValue('context', context);

		this.update = function() {

		};

		this.draw = function() {
			context.clearRect(0, 0, grid.width, grid.height);
		};

		time.add(this);

	};

})(window.snake = window.snake || {});