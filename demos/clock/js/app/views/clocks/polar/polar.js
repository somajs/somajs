;(function(clock) {

	'use strict';

	clock.PolarView = function(target, dispatcher) {

		target.innerHTML = 'polar';

	};

	clock.AnalogView.prototype.dispose = function() {
		this.element.innerHTML = '';
	};

})(window.clock = window.clock || {});