;(function(clock) {

	'use strict';

	clock.AnalogView = function(target, timer, face) {

		this.element = target;
		this.timer = timer;
		this.update = tick.bind(this);

		var radius = 250;
		var canvas = document.createElement('canvas');
		var context = canvas.getContext('2d');

		canvas.width = canvas.height = radius;
		target.appendChild(canvas);
		face.initialize(radius);

		function tick() {
			face.draw(context);
		}

		this.timer.add(this.update);
		this.update(timer.time);
	};

	clock.AnalogView.prototype.dispose = function() {
		this.element.innerHTML = '';
		this.timer.remove(this.update);
	};

})(window.clock = window.clock || {});
