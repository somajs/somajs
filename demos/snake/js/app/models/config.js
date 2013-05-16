(function(snake) {

	'use strict';

	snake.Config = {
		fps: 60,
		speed: 0.15,
		canvas: {
			width: 800,
			height: 576
		},
		grid: {
			width: 32,
			height: 32
		},
		debug: {
			drawGrid: true
		}
	};

})(window.snake = window.snake || {});
