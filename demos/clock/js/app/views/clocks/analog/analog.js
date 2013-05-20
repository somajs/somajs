(function(clock) {

	'use strict';

	var AnalogView = function(target, face, needleSeconds, needleMinutes, needleHours) {

		this.element = target;
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
			needleSeconds.draw(context);
			needleMinutes.update(time.minutes, time.seconds);
			needleMinutes.draw(context);
			needleHours.update(time.hours, time.minutes, time.seconds);
			needleHours.draw(context);
		}

	};

	AnalogView.prototype.dispose = function() {
		this.element.removeChild(this.element.firstChild);
	};

	clock.AnalogView = AnalogView;

})(window.clock = window.clock || {});
