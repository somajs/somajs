(function(clock) {

	'use strict';

	clock.DigitalView = function(target, timer) {

		this.element = target;
		this.timer = timer;
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

		this.timer.add(this.update);
		this.update(timer.time);

	};

	clock.DigitalView.prototype.dispose = function() {
		this.element.innerHTML = '';
		this.timer.remove(this.update);
	};

})(window.clock = window.clock || {});