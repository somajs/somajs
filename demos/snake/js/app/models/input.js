(function(snake) {

	'use strict';

	snake.Input = function(dispatcher) {

		document.addEventListener('keydown', function(event) {
			var key;
			switch (event.keyCode) {
			case 37:
				key = 'left';
				break;
			case 38:
				key = 'up';
				break;
			case 39:
				key = 'right';
				break;
			case 40:
				key = 'down';
				break;
			}
			dispatcher.dispatch('keydown', key);
		}.bind(this));

	};

})(window.snake = window.snake || {});