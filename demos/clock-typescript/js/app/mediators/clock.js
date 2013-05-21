var clock;
(function (clock) {
    var ClockMediator = (function () {
        function ClockMediator(target, dispatcher, mediators, timer) {
            dispatcher.addEventListener('create', function (event) {
                if(this.currentClock) {
                    timer.remove(this.currentClock.update);
                    this.currentClock.dispose();
                }
                this.currentClock = mediators.create(event.params, target);
                this.currentClockUpdateMethod = this.currentClock.update.bind(this.currentClock);
                timer.add(this.currentClockUpdateMethod);
                this.currentClock.update(timer.time);
            });
        }
        return ClockMediator;
    })();
    clock.ClockMediator = ClockMediator;    
})(clock || (clock = {}));
//@ sourceMappingURL=clock.js.map
