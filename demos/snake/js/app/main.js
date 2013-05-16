/*globals soma:false*/
(function(snake) {

	'use strict';

	var SnakeGame = new soma.Application.extend({
		init: function() {
			// config
			this.injector.mapValue('config', snake.Config);
			this.injector.mapValue('debug', snake.Config.debug);
			// commands
			this.commands.add('start', snake.StartCommand);
			this.commands.add('end', snake.EndCommand);
			// models
			this.injector.mapClass('time', snake.Time, true);
			this.injector.mapClass('grid', snake.Grid, true);
			this.injector.mapClass('path', snake.Path, true);
			this.injector.mapClass('input', snake.Input, true);
			this.injector.mapClass('collision', snake.Collision, true);
			// layers
			this.injector.mapClass('gridLayer', snake.GridLayer, true);
			this.injector.mapClass('snakeLayer', snake.SnakeLayer, true);
			this.injector.mapClass('foodLayer', snake.FoodLayer, true);
			// entities
			this.injector.mapClass('snake', snake.Snake);
			this.injector.mapClass('food', snake.Food);
			// mediators
			this.mediators.create(snake.Canvas, document.querySelector('.canvas'));
		},
		start: function() {
			this.dispatcher.dispatch('start');
		}
	});

	var game = new SnakeGame();

})(window.snake = window.snake || {});
