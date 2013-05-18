;(function(clock) {

	'use strict';

	clock.AnalogFaceView = function() {
		this.radius = 0;
		this.center = 0;
	};

	clock.AnalogFaceView.prototype.initialize = function(radius) {
		this.radius = radius / 2 - 5;
		this.center = radius / 2;
	};

	clock.AnalogFaceView.prototype.draw = function(context) {
		context.save();
		context.clearRect(0,0,this.center*2,this.center*2);
		context.lineWidth = 4.0;
		context.strokeStyle = "#567";
		context.beginPath();
		context.arc(this.center,this.center,this.radius,0,Math.PI * 2,true);
		context.closePath();
		context.stroke();
		context.restore();

//		this.drawDotes();
//		this.drawHourDotes();
	};

	clock.AnalogFaceView.prototype.dispose = function() {

	};

})(window.clock = window.clock || {});
