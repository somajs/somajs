;(function(clock) {

	'use strict';

	clock.AnalogView = function(target, timer, face, needleSeconds, needleMinutes, needleHours) {

		this.element = target;
		this.timer = timer;
		this.update = tick.bind(this);

		var radius = 250;
		var canvas = document.createElement('canvas');
		var context = canvas.getContext('2d');

		canvas.width = canvas.height = radius;
		target.appendChild(canvas);

		face.initialize(radius);
		needleSeconds.initialize(radius);
		needleMinutes.initialize(radius);
		needleHours.initialize(radius);

		function tick(time) {
			face.draw(context);
			needleSeconds.update(time.seconds);
			needleSeconds.draw(context)
			needleMinutes.update(time.minutes, time.seconds);
			needleMinutes.draw(context)
			needleHours.update(time.hours, time.minutes, time.seconds);
			needleHours.draw(context)
		}

		this.timer.add(this.update);
		this.update(timer.time);
	};

	clock.AnalogView.prototype.dispose = function() {
		this.element.innerHTML = '';
		this.timer.remove(this.update);
	};

})(window.clock = window.clock || {});
