;(function(clock) {

	'use strict';

	clock.AnalogNeedleHoursView = function() {

		this.seconds = 0;
		this.minutes = 0;
		this.hours = 0;
		this.radius = 0;
		this.center = 0;
		this.size = 0;

	};

	clock.AnalogNeedleHoursView.prototype.initialize = function(radius) {
		this.radius = radius;
		this.center = this.radius / 2;
		this.size = this.center * 0.4;
	};

	clock.AnalogNeedleHoursView.prototype.update = function(hours, minutes, seconds) {
		this.hours = hours;
		this.minutes = minutes;
		this.seconds = seconds;
	};

	clock.AnalogNeedleHoursView.prototype.draw = function(context) {
		var theta = (30 * Math.PI / 180);
		var x = this.center + this.size * Math.cos(((this.hours + this.minutes/60 + this.seconds/3600) * theta) - Math.PI/2);
		var y = this.center + this.size * Math.sin(((this.hours + this.minutes/60 + this.seconds/3600) * theta) - Math.PI/2);
		context.save();
		context.lineWidth = 5;
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

	clock.AnalogNeedleHoursView.prototype.dispose = function() {

	};

})(window.clock = window.clock || {});
