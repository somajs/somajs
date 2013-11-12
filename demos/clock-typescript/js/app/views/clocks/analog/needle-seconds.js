///<reference path='../../../interfaces/IAnalogNeedle.ts'/>
var clock;
(function (clock) {
    var NeedleSeconds = (function () {
        function NeedleSeconds() {
            this.seconds = 0;
            this.radius = 0;
            this.center = 0;
            this.size = 0;
        }
        NeedleSeconds.prototype.initialize = function (radius) {
            this.radius = radius;
            this.center = this.radius / 2;
            this.size = this.center * 0.8;
        };

        NeedleSeconds.prototype.update = function (time) {
            this.seconds = time.seconds;
        };

        NeedleSeconds.prototype.draw = function (context) {
            var theta = (6 * Math.PI / 180);
            var x = this.center + this.size * Math.cos(this.seconds * theta - Math.PI / 2);
            var y = this.center + this.size * Math.sin(this.seconds * theta - Math.PI / 2);
            context.save();
            context.lineWidth = 2;
            context.strokeStyle = '#015666';
            context.lineJoin = 'round';
            context.lineCap = 'round';
            context.beginPath();
            context.moveTo(x, y);
            context.lineTo(this.center, this.center);
            context.closePath();
            context.stroke();
            context.restore();
        };

        NeedleSeconds.prototype.dispose = function () {
        };
        return NeedleSeconds;
    })();
    clock.NeedleSeconds = NeedleSeconds;
})(clock || (clock = {}));
//# sourceMappingURL=needle-seconds.js.map
