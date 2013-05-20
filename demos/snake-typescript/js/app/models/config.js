var snake;
(function (snake) {
    var Config = (function () {
        function Config() {
            this.debug = true;
            this.fps = 60;
            this.speed = 0.15;
            this.canvas = {
                width: 800,
                height: 576
            };
            this.grid = {
                width: 32,
                height: 32
            };
            this.debug = {
                drawGrid: true
            };
        }
        return Config;
    })();
    snake.Config = Config;    
})(snake || (snake = {}));
//@ sourceMappingURL=config.js.map
