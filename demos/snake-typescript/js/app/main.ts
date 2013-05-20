///<reference path='../soma.d.ts'/>
///<reference path='commands/start.ts'/>
///<reference path='commands/end.ts'/>
///<reference path='models/config.ts'/>
///<reference path='models/time.ts'/>
///<reference path='models/grid.ts'/>
///<reference path='models/path.ts'/>
///<reference path='models/input.ts'/>
///<reference path='models/collision.ts'/>
///<reference path='views/canvas.ts'/>
///<reference path='views/layers/food.ts'/>
///<reference path='views/layers/snake.ts'/>
///<reference path='views/layers/grid.ts'/>
///<reference path='views/entities/food.ts'/>
///<reference path='views/entities/snake.ts'/>

module snake {
	export class Game extends soma.Application {
		init() {
			// config
			var config = new Config();
			this.injector.mapValue('config', config);
			this.injector.mapValue('debug', config.debug);
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
		}
		start() {
			this.dispatcher.dispatch('start');
		}
	}
}

new snake.Game();
