(function(clock) {

	'use strict';

	var DigitalView = function(target) {

		this.element = target;
		this.update = tick.bind(this);

		function tick(time) {
			target.innerHTML = format(time.hours) + ':' + format(time.minutes) + ':' + format(time.seconds);
		}

		function format(value) {
			if (value < 10) {
				return '0' + value;
			}
			return value;
		}

	};

	DigitalView.prototype.dispose = function() {
		this.element.innerHTML = '';
	};

	clock.DigitalView = DigitalView;

})(window.clock = window.clock || {});