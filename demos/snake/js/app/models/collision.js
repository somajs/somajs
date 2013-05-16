(function(snake) {

	'use strict';

	snake.Collision = function(snakeLayer, foodLayer, time, dispatcher) {

		time.addSpeedHandler(function() {
			if (snakeLayer.getPosition().col === foodLayer.getPosition().col && snakeLayer.getPosition().row === foodLayer.getPosition().row) {
				dispatcher.dispatch('eating');
				foodLayer.reset();
			}
		}.bind(this));

	};

})(window.snake = window.snake || {});