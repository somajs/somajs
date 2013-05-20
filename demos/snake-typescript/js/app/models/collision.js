var snake;
(function (snake) {
    var Collision = (function () {
        function Collision(snakeLayer, foodLayer, time, dispatcher) {
            time.addSpeedHandler(function () {
                if(snakeLayer.getPosition().col === foodLayer.getPosition().col && snakeLayer.getPosition().row === foodLayer.getPosition().row) {
                    dispatcher.dispatch('eating');
                    foodLayer.reset();
                }
            }.bind(this));
        }
        return Collision;
    })();
    snake.Collision = Collision;    
})(snake || (snake = {}));
//@ sourceMappingURL=collision.js.map
