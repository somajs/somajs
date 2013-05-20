var snake;
(function (snake) {
    var FoodLayer = (function () {
        function FoodLayer(context, grid, time, food) {
            this.cell = null;
            this.context = null;
            this.grid = null;
            this.foodView = null;
            this.cell = {
                col: 0,
                row: 0
            };
            this.context = context;
            this.grid = grid;
            this.foodView = food;
            this.foodView.width = this.grid.cellWidth;
            this.foodView.height = this.grid.cellHeight;
            time.add(this);
        }
        FoodLayer.prototype.setRandomPosition = function () {
            this.cell.col = Math.floor((Math.random() * this.grid.numCols));
            this.cell.row = Math.floor((Math.random() * this.grid.numRows));
            this.foodView.x = this.cell.col * this.grid.cellWidth;
            this.foodView.y = this.cell.row * this.grid.cellHeight;
        };
        FoodLayer.prototype.update = function () {
        };
        FoodLayer.prototype.draw = function () {
            this.foodView.draw(this.context);
        };
        FoodLayer.prototype.getPosition = function () {
            return this.cell;
        };
        FoodLayer.prototype.reset = function () {
            this.setRandomPosition();
        };
        return FoodLayer;
    })();
    snake.FoodLayer = FoodLayer;    
})(snake || (snake = {}));
//@ sourceMappingURL=food.js.map
