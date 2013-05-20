var snake;
(function (snake) {
    var EndCommand = (function () {
        function EndCommand() {
            this.dispatcher = null;
        }
        EndCommand.prototype.execute = function () {
            this.dispatcher.dispatch('start');
        };
        return EndCommand;
    })();
    snake.EndCommand = EndCommand;    
})(snake || (snake = {}));
//@ sourceMappingURL=end.js.map
