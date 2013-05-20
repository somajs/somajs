var snake;
(function (snake) {
    var GridLayer = (function () {
        function GridLayer(context, time, grid, debug) {
            this.context = null;
            this.time = null;
            this.grid = null;
            this.debug = null;
            this.context = context;
            this.time = time;
            this.grid = grid;
            this.debug = debug;
            this.time.add(this);
        }
        GridLayer.prototype.update = function () {
        };
        GridLayer.prototype.draw = function () {
            if(this.debug.drawGrid) {
                this.context.save();
                this.context.strokeStyle = 'rgba(46, 70, 119, 0.7)';
                for(var i = 0, l = this.grid.numCols + 1; i < l; i++) {
                    var x = i * this.grid.cellWidth;
                    this.context.beginPath();
                    this.context.moveTo(x, 0);
                    this.context.lineTo(x, this.grid.height);
                    this.context.stroke();
                }
                for(var a = 0, b = this.grid.numRows + 1; a < b; a++) {
                    var y = a * this.grid.cellHeight;
                    this.context.beginPath();
                    this.context.moveTo(0, y);
                    this.context.lineTo(this.grid.width, y);
                    this.context.stroke();
                }
                this.context.restore();
            }
        };
        return GridLayer;
    })();
    snake.GridLayer = GridLayer;    
})(snake || (snake = {}));
//@ sourceMappingURL=grid.js.map
