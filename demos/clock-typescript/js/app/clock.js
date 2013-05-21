var __extends = this.__extends || function (d, b) {
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
            this.injector.mapClass('timer', clock.TimerModel, true);
            this.injector.mapClass('face', clock.FaceView);
            this.injector.mapClass('needleSeconds', clock.NeedleSeconds);
            this.injector.mapClass('needleMinutes', clock.NeedleMinutes);
            this.injector.mapClass('needleHours', clock.NeedleHours);
            this.mediators.create(clock.ClockMediator, this.element.querySelector('.clock'));
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
//@ sourceMappingURL=clock.js.map
