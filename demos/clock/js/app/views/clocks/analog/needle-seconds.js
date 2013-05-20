(function(clock) {

	'use strict';

	var NeedleSeconds = function() {

		this.seconds = 0;
		this.radius = 0;
		this.center = 0;
		this.size = 0;

	};

	NeedleSeconds.prototype.initialize = function(radius) {
		this.radius = radius;
		this.center = this.radius / 2;
		this.size = this.center * 0.8;
	};

	NeedleSeconds.prototype.update = function(seconds) {
		this.seconds = seconds;
	};

	NeedleSeconds.prototype.draw = function(context) {
		var theta = (6 * Math.PI / 180);// - (Math.PI / 2);
		var x = this.center + this.size * Math.cos(this.seconds * theta - Math.PI/2);
		var y = this.center + this.size * Math.sin(this.seconds * theta - Math.PI/2);
		context.save();
		context.lineWidth = 2;
		context.strokeStyle = '#015666';
		context.lineJoin = 'round';
		context.lineCap = 'round';
		context.beginPath();
		context.moveTo(x,y);
		context.lineTo(this.center, this.center);
		context.closePath();
		context.stroke();
		context.restore();
	};

	NeedleSeconds.prototype.dispose = function() {

	};

	clock.NeedleSeconds = NeedleSeconds;

})(window.clock = window.clock || {});
