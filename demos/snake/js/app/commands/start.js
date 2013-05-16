(function(snake) {

	'use strict';

	snake.StartCommand = function(input, collision, gridLayer, snakeLayer, foodLayer, time, path) {

		this.execute = function() {
			foodLayer.reset();
			path.reset();
			time.start();
		};

	};

})(window.snake = window.snake || {});
