var snake;
(function (snake) {
    var StartCommand = (function () {
        function StartCommand(input, collision, gridLayer, snakeLayer) {
            this.foodLayer = null;
            this.path = null;
            this.time = null;
        }
        StartCommand.prototype.execute = function () {
            this.foodLayer.reset();
            this.path.reset();
            this.time.start();
        };
        return StartCommand;
    })();
    snake.StartCommand = StartCommand;    
})(snake || (snake = {}));
//@ sourceMappingURL=start.js.map
