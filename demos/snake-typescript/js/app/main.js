var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var snake;
(function (snake) {
    var Game = (function (_super) {
        __extends(Game, _super);
        function Game() {
            _super.apply(this, arguments);

        }
        Game.prototype.init = function () {
            var config = new snake.Config();
            this.injector.mapValue('config', config);
            this.injector.mapValue('debug', config.debug);
            this.commands.add('start', snake.StartCommand);
            this.commands.add('end', snake.EndCommand);
            this.injector.mapClass('time', snake.Time, true);
            this.injector.mapClass('grid', snake.Grid, true);
            this.injector.mapClass('path', snake.Path, true);
            this.injector.mapClass('input', snake.Input, true);
            this.injector.mapClass('collision', snake.Collision, true);
            this.injector.mapClass('gridLayer', snake.GridLayer, true);
            this.injector.mapClass('snakeLayer', snake.SnakeLayer, true);
            this.injector.mapClass('foodLayer', snake.FoodLayer, true);
            this.injector.mapClass('snake', snake.Snake);
            this.injector.mapClass('food', snake.Food);
            this.mediators.create(snake.Canvas, document.querySelector('.canvas'));
        };
        Game.prototype.start = function () {
            this.dispatcher.dispatch('start');
        };
        return Game;
    })(soma.Application);
    snake.Game = Game;    
})(snake || (snake = {}));
new snake.Game();
//@ sourceMappingURL=main.js.map
