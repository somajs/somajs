var snake;
(function (snake) {
    var SnakeLayer = (function () {
        function SnakeLayer(context, grid, time, snake, path) {
            this.cell = null;
            this.context = null;
            this.grid = null;
            this.snakeView = null;
            this.path = null;
            this.cell = {
                col: 0,
                row: 0
            };
            this.context = context;
            this.grid = grid;
            this.snakeView = snake;
            this.path = path;
            this.snakeView.width = this.grid.cellWidth;
            this.snakeView.height = this.grid.cellHeight;
            time.add(this);
        }
        SnakeLayer.prototype.update = function () {
            this.snakeView.currentPath = this.path.get();
        };
        SnakeLayer.prototype.draw = function () {
            this.snakeView.draw(this.context);
        };
        SnakeLayer.prototype.getPosition = function () {
            return this.snakeView.currentPath.length === 0 ? null : this.snakeView.currentPath[0];
        };
        return SnakeLayer;
    })();
    snake.SnakeLayer = SnakeLayer;    
})(snake || (snake = {}));
//@ sourceMappingURL=snake.js.map
