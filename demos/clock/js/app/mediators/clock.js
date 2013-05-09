;(function(clock) {

	'use strict';

	clock.ClockMediator = function(target, dispatcher, mediators) {

		dispatcher.addEventListener('create', function(event) {
			target.innerHTML = "";
			mediators.create(clock[event.params], target);
		});

	};

})(window.clock = window.clock || {});