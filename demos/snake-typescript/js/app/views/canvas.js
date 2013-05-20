var snake;
(function (snake) {
    var Canvas = (function () {
        function Canvas(target, injector, grid, time) {
            this.context = target.getContext('2d');
            this.grid = grid;
            injector.mapValue('canvas', target);
            injector.mapValue('context', this.context);
            time.add(this);
        }
        Canvas.prototype.update = function () {
        };
        Canvas.prototype.draw = function () {
            this.context.clearRect(0, 0, this.grid.width, this.grid.height);
        };
        return Canvas;
    })();
    snake.Canvas = Canvas;    
})(snake || (snake = {}));
//@ sourceMappingURL=canvas.js.map
