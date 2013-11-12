///<reference path='../../../../../build/soma.d.ts'/>
///<reference path='../models/timer.ts'/>
///<reference path='../interfaces/ITimer.ts'/>
///<reference path='../interfaces/IClockView.ts'/>
var clock;
(function (clock) {
    var ClockMediator = (function () {
        function ClockMediator(target, dispatcher, mediators, timer) {
            dispatcher.addEventListener('create', function (event) {
                if (this.currentClock) {
                    timer.remove(this.currentClock.update);
                    this.currentClock.dispose();
                }

                // create clock
                this.currentClock = mediators.create(event.params, target);
                this.currentClockUpdateMethod = this.currentClock.update.bind(this.currentClock);

                // register clock with timer model
                timer.add(this.currentClockUpdateMethod);
                this.currentClock.update(timer.time);
            });
        }
        return ClockMediator;
    })();
    clock.ClockMediator = ClockMediator;
})(clock || (clock = {}));
//# sourceMappingURL=clock.js.map
