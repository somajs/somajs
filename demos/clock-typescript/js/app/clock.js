///<reference path='../../../../build/soma.d.ts'/>
///<reference path='models/timer.ts'/>
///<reference path='mediators/clock.ts'/>
///<reference path='views/selector.ts'/>
///<reference path='views/clocks/analog/analog.ts'/>
///<reference path='views/clocks/analog/face.ts'/>
///<reference path='views/clocks/analog/needle-hours.ts'/>
///<reference path='views/clocks/analog/needle-minutes.ts'/>
///<reference path='views/clocks/analog/needle-seconds.ts'/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var clock;
(function (clock) {
    var ClockApplication = (function (_super) {
        __extends(ClockApplication, _super);
        function ClockApplication(element) {
            this.element = element;
            _super.call(this);
        }
        ClockApplication.prototype.init = function () {
            // mapping rules
            this.injector.mapClass('timer', clock.TimerModel, true);
            this.injector.mapClass('face', clock.FaceView);
            this.injector.mapClass('needleSeconds', clock.NeedleSeconds);
            this.injector.mapClass('needleMinutes', clock.NeedleMinutes);
            this.injector.mapClass('needleHours', clock.NeedleHours);

            // clock mediator
            this.mediators.create(clock.ClockMediator, this.element.querySelector('.clock'));

            // clock selector template
            this.createTemplate(clock.SelectorView, this.element.querySelector('.clock-selector'));
        };

        ClockApplication.prototype.start = function () {
            this.dispatcher.dispatch('create', clock.AnalogView);
        };
        return ClockApplication;
    })(soma.Application);
    clock.ClockApplication = ClockApplication;
})(clock || (clock = {}));

new clock.ClockApplication(document.querySelector('.clock-app'));
//# sourceMappingURL=clock.js.map
