;(function(clock) {

	'use strict';

	clock.DigitalView = function(target, timer) {

		timer.tick(function() {

			var now = new Date();

			var hours = formatDigit(now.getHours());
			var minutes = formatDigit(now.getMinutes());
			var seconds = formatDigit(now.getSeconds());

			target.innerHTML = hours + ':' + minutes + ':' + seconds;
		});

		function formatDigit(value) {
			if (value < 10) {
				return '0' + value;
			}
			return value;
		}

	};

	clock.DigitalView.prototype.dispose = function() {

	};

})(window.clock = window.clock || {});