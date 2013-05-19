;(function(clock) {

	'use strict';

	clock.AnalogNeedleMinutesView = function() {

		this.minutes = 0;
		this.seconds = 0;
		this.radius = 0;
		this.center = 0;
		this.size = 0;

	};

	clock.AnalogNeedleMinutesView.prototype.initialize = function(radius) {
		this.radius = radius;
		this.center = this.radius / 2;
		this.size = this.center * 0.65;
	};

	clock.AnalogNeedleMinutesView.prototype.update = function(minutes, seconds) {
		this.minutes = minutes;
		this.seconds = seconds;
	};

	clock.AnalogNeedleMinutesView.prototype.draw = function(context) {
		var theta = (6 * Math.PI / 180);// - (Math.PI / 2);
		var x = this.center + this.size * Math.cos(((this.minutes + this.seconds/60) * theta) - Math.PI/2);
		var y = this.center + this.size * Math.sin(((this.minutes + this.seconds/60) * theta) - Math.PI/2);
		context.save();
		context.lineWidth = 2;
		context.strokeStyle = '#015666';
		context.lineJoin = "round";
		context.lineCap = "round";
		context.beginPath();
		context.moveTo(x,y);
		context.lineTo(this.center, this.center);
		context.closePath();
		context.stroke();
		context.restore();
	};

	clock.AnalogNeedleMinutesView.prototype.dispose = function() {

	};

})(window.clock = window.clock || {});
