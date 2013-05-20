(function(clock) {

	'use strict';

	var ClockMediator = function(target, dispatcher, mediators, timer) {

		var currentClock;

		dispatcher.addEventListener('create', function(event) {

			// destroy previous clock
			if (currentClock) {
				timer.remove(currentClock.update);
				currentClock.dispose();
			}

			// create clock
			currentClock = mediators.create(event.params, target);

			// register clock with timer model
			timer.add(currentClock.update);
			currentClock.update(timer.time);

		});

	};

	clock.ClockMediator = ClockMediator;

})(window.clock = window.clock || {});