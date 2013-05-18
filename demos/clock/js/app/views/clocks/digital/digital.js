;(function(clock) {

	'use strict';

	clock.DigitalView = function(target, timer) {

		this.element = target;
		this.timer = timer;
		this.update = tick.bind(this);

		function tick(time) {
			this.element.innerHTML = time.hours + ':' + time.minutes + ':' + time.seconds;
		}

		this.timer.add(this.update);
		this.update(timer.time);

	};

	clock.DigitalView.prototype.dispose = function() {
		this.element.innerHTML = '';
		this.timer.remove(this.update);
	};

})(window.clock = window.clock || {});