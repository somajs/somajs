;(function(clock) {

	'use strict';

	clock.TimerModel = function() {

		this.callbacks = [];

		var i, l;

		setInterval(function() {

			i = 0;
			l = this.callbacks.length;

			for (; i < l;  i++) {
				this.callbacks[i]();
			}

		}.bind(this), 1000);

	};

	clock.TimerModel.prototype.tick = function(callback) {
		this.callbacks.push(callback);
	};

})(window.clock = window.clock || {});