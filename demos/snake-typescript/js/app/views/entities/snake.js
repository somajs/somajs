var snake;
(function (snake) {
    var Snake = (function () {
        function Snake() {
            this.currentPath = null;
            this.width = 0;
            this.height = 0;
            this.rgba = null;
            this.currentPath = [];
            this.rgba = 'rgba(46, 119, 58, 0.8)';
        }
        Snake.prototype.draw = function (context) {
            context.save();
            for(var i = 0, l = this.currentPath.length; i < l; i++) {
                context.fillStyle = this.rgba;
                context.fillRect(this.currentPath[i].x, this.currentPath[i].y, this.width, this.height);
            }
            context.restore();
        };
        return Snake;
    })();
    snake.Snake = Snake;    
})(snake || (snake = {}));
//@ sourceMappingURL=snake.js.map
