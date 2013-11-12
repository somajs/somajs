///<reference path='../vo/time.ts'/>
///<reference path='../interfaces/ITimer.ts'/>
var clock;
(function (clock) {
    var TimerModel = (function () {
        function TimerModel() {
            this.callbacks = null;
            this.time = null;
            this.callbacks = [];
            this.time = new clock.TimeVO();

            var i;
            var l;

            setInterval(function () {
                this.update();
                i = 0;
                l = this.callbacks.length;
                for (; i < l; i++) {
                    this.callbacks[i](this.time);
                }
            }.bind(this), 1000);

            this.update();
        }
        TimerModel.prototype.update = function () {
            this.time.now = new Date();
            this.time.hours = this.time.now.getHours();
            this.time.minutes = this.time.now.getMinutes();
            this.time.seconds = this.time.now.getSeconds();
            this.time.milliseconds = this.time.now.getMilliseconds();
            this.time.day = this.time.now.getDay() + 1;
            this.time.date = this.time.now.getDate();
            this.time.month = this.time.now.getMonth() + 1;
        };

        TimerModel.prototype.add = function (callback) {
            this.callbacks.push(callback);
        };

        TimerModel.prototype.remove = function (callback) {
            this.callbacks.splice(this.callbacks.indexOf(callback), 1);
        };
        return TimerModel;
    })();
    clock.TimerModel = TimerModel;
})(clock || (clock = {}));
//# sourceMappingURL=timer.js.map
