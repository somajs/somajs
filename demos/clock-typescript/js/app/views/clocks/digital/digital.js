///<reference path='../../../vo/time.ts'/>
///<reference path='../../../interfaces/IClockView.ts'/>
var clock;
(function (clock) {
    var DigitalView = (function () {
        function DigitalView(target) {
            this.element = null;
            this.element = target;
        }
        DigitalView.prototype.update = function (time) {
            this.element.innerHTML = this.format(time.hours) + ':' + this.format(time.minutes) + ':' + this.format(time.seconds);
        };

        DigitalView.prototype.format = function (value) {
            if (value < 10) {
                return '0' + value.toString();
            }
            return value.toString();
        };

        DigitalView.prototype.dispose = function () {
            this.element.innerHTML = '';
        };
        return DigitalView;
    })();
    clock.DigitalView = DigitalView;
})(clock || (clock = {}));
