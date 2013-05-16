(function(snake) {

	'use strict';

	snake.EndCommand = function(dispatcher) {

		this.execute = function() {
			// display game over screen or restart game
			dispatcher.dispatch('start');
		};

	};

})(window.snake = window.snake || {});
