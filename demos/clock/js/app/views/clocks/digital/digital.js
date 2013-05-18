;(function(clock) {

	'use strict';

	clock.DigitalView = function(target, timer) {

		this.element = target;
		this.timer = timer;
		this.update = tick.bind(this);

		function format(value) {
			if (value < 10) {
				return '0' + value;
			}
			return value;
		}

		function tick() {
			var now = new Date();
			var hours = format(now.getHours());
			var minutes = format(now.getMinutes());
			var seconds = format(now.getSeconds());
			this.element.innerHTML = hours + ':' + minutes + ':' + seconds;
		}

		this.timer.add(this.update);
		this.update();

	};

	clock.DigitalView.prototype.dispose = function() {
		this.element.innerHTML = '';
		this.timer.remove(this.update);
	};

})(window.clock = window.clock || {});