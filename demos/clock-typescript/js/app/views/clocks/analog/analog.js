///<reference path='face.ts'/>
///<reference path='../../../vo/time.ts'/>
///<reference path='../../../interfaces/IClockView.ts'/>
///<reference path='../../../interfaces/IAnalogNeedle.ts'/>
var clock;
(function (clock) {
    var AnalogView = (function () {
        function AnalogView(target, face, needleSeconds, needleMinutes, needleHours) {
            this.element = null;
            this.radius = 0;
            this.canvas = null;
            this.context = null;
            this.element = target;
            this.faceView = face;
            this.needleHoursView = needleHours;
            this.needleMinutesView = needleMinutes;
            this.needleSecondsView = needleSeconds;

            this.radius = 250;
            this.canvas = document.createElement('canvas');
            this.context = this.canvas.getContext('2d');

            this.canvas.width = this.radius;
            this.canvas.height = this.radius;
            this.element.appendChild(this.canvas);

            this.faceView.initialize(this.radius);
            this.needleSecondsView.initialize(this.radius);
            this.needleMinutesView.initialize(this.radius);
            this.needleHoursView.initialize(this.radius);
        }
        AnalogView.prototype.update = function (time) {
            this.faceView.draw(this.context);
            this.needleSecondsView.update(time);
            this.needleSecondsView.draw(this.context);
            this.needleMinutesView.update(time);
            this.needleMinutesView.draw(this.context);
            this.needleHoursView.update(time);
            this.needleHoursView.draw(this.context);
        };

        AnalogView.prototype.dispose = function () {
            this.element.removeChild(this.element.firstChild);
        };
        return AnalogView;
    })();
    clock.AnalogView = AnalogView;
})(clock || (clock = {}));
//# sourceMappingURL=analog.js.map
