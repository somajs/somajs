(function(clock) {

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
			needleSeconds.draw(context);
			needleMinutes.update(time.minutes, time.seconds);
			needleMinutes.draw(context);
			needleHours.update(time.hours, time.minutes, time.seconds);
			needleHours.draw(context);

//			var rad = radius / 2 - 5;
//			var center = radius / 2;
//			var theta = 0;
//			var size = 0;
//			var distance = rad * 0.9;
//			var x, y, i, l;
//
//			context.save();
//
//			// draw face
//			context.clearRect(0,0,center*2,center*2);
//			context.lineWidth = 4.0;
//			context.strokeStyle = '#015666';
//			context.beginPath();
//			context.arc(center,center,rad,0,Math.PI * 2,true);
//			context.closePath();
//			context.stroke();
//
//			// draw dots
//			context.lineWidth = 0.5;
//			context.strokeStyle = '#04859D';
//			for (i=0; i<60; i++) {
//				theta = theta + (6 * Math.PI / 180);
//				x = center + distance * Math.cos(theta);
//				y = center + distance * Math.sin(theta);
//				context.beginPath();
//				context.arc(x,y,1,0,Math.PI * 2,true);
//				context.closePath();
//				context.stroke();
//			}
//
//			// draw hours dots
//			context.lineWidth = 5.0;
//			context.strokeStyle = '#137';
//			for (i=0; i<12; i++) {
//				theta = theta + (30 * Math.PI / 180);
//				x = center + distance * Math.cos(theta);
//				y = center + distance * Math.sin(theta);
//				context.beginPath();
//				context.arc(x,y,1,0,Math.PI * 2,true);
//				context.closePath();
//				context.stroke();
//			}
//
//			// draw center
//			context.fillStyle = '#015666';
//			context.beginPath();
//			context.arc(center,center,5,0,Math.PI * 2,false);
//			context.closePath();
//			context.fill();
//
//			// needle seconds
//			size = center * 0.8;
//			theta = (6 * Math.PI / 180);// - (Math.PI / 2);
//			x = center + size * Math.cos(time.seconds * theta - Math.PI/2);
//			y = center + size * Math.sin(time.seconds * theta - Math.PI/2);
//			context.lineWidth = 2;
//			context.strokeStyle = '#015666';
//			context.lineJoin = 'round';
//			context.lineCap = 'round';
//			context.beginPath();
//			context.moveTo(x,y);
//			context.lineTo(center, center);
//			context.closePath();
//			context.stroke();
//
//			// draw minutes
//			size = center * 0.65;
//			theta = (6 * Math.PI / 180);// - (Math.PI / 2);
//			x = center + size * Math.cos(((time.minutes + time.seconds/60) * theta) - Math.PI/2);
//			y = center + size * Math.sin(((time.minutes + time.seconds/60) * theta) - Math.PI/2);
//			context.lineWidth = 3;
//			context.strokeStyle = '#015666';
//			context.lineJoin = 'round';
//			context.lineCap = 'round';
//			context.beginPath();
//			context.moveTo(x,y);
//			context.lineTo(center, center);
//			context.closePath();
//			context.stroke();
//
//			// draw hours
//			size = center * 0.4;
//			theta = (30 * Math.PI / 180);
//			x = center + size * Math.cos(((time.hours + time.minutes/60 + time.seconds/3600) * theta) - Math.PI/2);
//			y = center + size * Math.sin(((time.hours + time.minutes/60 + time.seconds/3600) * theta) - Math.PI/2);
//			context.save();
//			context.lineWidth = 5;
//			context.strokeStyle = '#015666';
//			context.lineJoin = 'round';
//			context.lineCap = 'round';
//			context.beginPath();
//			context.moveTo(x,y);
//			context.lineTo(center, center);
//			context.closePath();
//			context.stroke();
//
//			context.restore();
		}

		this.timer.add(this.update);
		this.update(timer.time);
	};

	clock.AnalogView.prototype.dispose = function() {
		this.element.removeChild(this.element.firstChild);
		this.timer.remove(this.update);
	};

})(window.clock = window.clock || {});
