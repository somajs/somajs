(function(snake) {

	'use strict';

	var Food = function() {
		this.x = 0;
		this.y = 0;
		this.width = 0;
		this.height = 0;
		this.rgba = 'rgba(129, 45, 37, 0.8)';
	};

	Food.prototype.draw = function(context) {
		context.save();
		context.fillStyle = this.rgba;
		context.fillRect(this.x, this.y, this.width, this.height);
		context.restore();
	};

	snake.Food = Food;

})(window.snake = window.snake || {});