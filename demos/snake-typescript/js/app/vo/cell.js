var snake;
(function (snake) {
    var Cell = (function () {
        function Cell() {
            this.index = null;
            this.x = null;
            this.y = null;
            this.col = null;
            this.row = null;
            this.direction = null;
        }
        return Cell;
    })();
    snake.Cell = Cell;    
})(snake || (snake = {}));
//@ sourceMappingURL=cell.js.map
