;(function(clock) {

	'use strict';

	clock.TimerModel = function() {

		this.callbacks = [];
		this.time = {};

		var i, l;

		setInterval(function() {

			this.update();

			i = 0;
			l = this.callbacks.length;

			for (; i < l;  i++) {
				this.callbacks[i](this.time);
			}

		}.bind(this), 1000);

		this.update();

	};

	clock.TimerModel.prototype.update = function() {
		this.time.now = new Date();
		this.time.hours = this.time.now.getHours();
		this.time.minutes = this.time.now.getMinutes();
		this.time.seconds = this.time.now.getSeconds();
		this.time.hoursFormatted = this.format(this.time.hours);
		this.time.minutesFormatted = this.format(this.time.minutes);
		this.time.secondsFormatted = this.format(this.time.seconds);
	};

	clock.TimerModel.prototype.format = function(value) {
		if (value < 10) {
			return '0' + value;
		}
		return value;
	};

	clock.TimerModel.prototype.add = function(callback) {
		this.callbacks.push(callback);
	};

	clock.TimerModel.prototype.remove = function(callback) {
		this.callbacks.splice(this.callbacks.indexOf(callback), 1);
	};

})(window.clock = window.clock || {});