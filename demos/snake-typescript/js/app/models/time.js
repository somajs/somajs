var snake;
(function (snake) {
    var Time = (function () {
        function Time(config) {
            this.speedHandlers = null;
            this.speedTimeoutId = 0;
            this.speed = 0;
            this.speedLoop = null;
            this.config = null;
            this.speedHandlers = [];
            this.speed = config.speed;
            this.speedLoop = this.speedLoopHandler.bind(this);
        }
        Time.prototype.speedLoopHandler = function () {
            for(var i = 0, l = this.speedHandlers.length; i < l; i++) {
                if(typeof this.speedHandlers[i] === 'function') {
                    this.speedHandlers[i]();
                }
            }
            this.speedTimeoutId = setTimeout(this.speedLoop, this.speed * 1000);
        };
        Time.prototype.add = function (target) {
            if(typeof target.update === 'function' && typeof target.draw === 'function') {
                (function loop() {
                    target.update();
                    target.draw();
                    window.requestAnimationFrame(loop);
                })();
            }
        };
        Time.prototype.addSpeedHandler = function (handler) {
            this.speedHandlers.push(handler);
        };
        Time.prototype.start = function () {
            if(this.speedTimeoutId === 0) {
                this.speedLoop();
            }
        };
        return Time;
    })();
    snake.Time = Time;    
})(snake || (snake = {}));
//@ sourceMappingURL=time.js.map
