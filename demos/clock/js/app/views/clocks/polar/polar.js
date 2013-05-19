;(function(clock) {

	'use strict';

	clock.PolarView = function(target) {

		this.element = target;
		this.element.innerHTML = 'polar';

	};

	clock.PolarView.prototype.dispose = function() {
		this.element.innerHTML = '';
	};

})(window.clock = window.clock || {});