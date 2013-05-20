(function(snake) {

	'use strict';

	var Snake = function() {
		this.width = 0;
		this.height = 0;
		this.rgba = 'rgba(46, 119, 58, 0.8)';
		this.path = [];
	};

	Snake.prototype.draw = function(context) {
		context.save();
		for (var i = 0, l = this.path.length; i<l; i++) {
			context.fillStyle = this.rgba;
			context.fillRect(this.path[i].x, this.path[i].y, this.width, this.height);
		}
		context.restore();
	};

	snake.Snake = Snake;

})(window.snake = window.snake || {});