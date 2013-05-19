(function(clock) {

	'use strict';

	clock.ClockMediator = function(target, dispatcher, mediators) {

		var currentClock;

		dispatcher.addEventListener('create', function(event) {
			// destroy previous clock
			if (currentClock) {
				currentClock.dispose();
			}
			// create clock
			currentClock = mediators.create(clock[event.params], target);
		});

	};

})(window.clock = window.clock || {});