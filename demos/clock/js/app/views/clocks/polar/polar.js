(function (clock) {

	'use strict';

	var PolarView = function (target) {

		this.element = target;
		this.update = tick.bind(this);

		var width = 300;
		var height = 300;
		var canvas = document.createElement('canvas');
		var context = canvas.getContext('2d');

		canvas.width = width;
		canvas.height = height;
		target.appendChild(canvas);

		function tick(time) {
			context.save();
			context.clearRect(0, 0, width, height);
			context.translate(width * 0.5, width * 0.5);
			context.rotate(-Math.PI / 2);
			context.lineWidth = 18;
			var milliSec = time.milliseconds;
			var sec = milliSec / 1000 + time.seconds;
			var min = sec / 60 + time.minutes;
			var hr = min / 60 + time.hours;
			var dow = time.day;
			var day = time.date;
			var month = time.month;
			var secPer = sec / 60;
			var minPer = min / 60;
			var hrPer = hr / 24;
			var dowPer = dow / 7;
			var monthPer = month / 12;
			var dayPer = 0;
			if (month === 2) {
				dayPer = day / 29;
			}
			else if (month === 1 || month === 3 || month === 5 || month === 7 || month === 8 || month === 10 || month === 12) {
				dayPer = day / 31;
			}
			else {
				dayPer = day / 30;
			}
			writeTime(context, 40, monthPer);
			writeTime(context, 60, dayPer);
			writeTime(context, 80, dowPer);
			writeTime(context, 100, hrPer);
			writeTime(context, 120, minPer);
			writeTime(context, 140, secPer);
			context.restore();
		}

		function writeTime(context, radius, per) {
			context.save();
			context.strokeStyle = calculateColor(per);
			context.beginPath();
			context.arc(0, 0, radius, 0, per * (Math.PI * 2), false);
			context.stroke();
			context.restore();
		}

		function calculateColor(per) {
			var brightness = 255;
			var red = 0,
				blue = per * brightness,
				green = brightness - blue;
			return 'rgba(' + Math.round(red) + ',' + Math.round(green) + ',' + Math.round(blue) + ',1)';
		}

	};

	PolarView.prototype.dispose = function () {
		this.element.removeChild(this.element.firstChild);
	};

	clock.PolarView = PolarView;

})(window.clock = window.clock || {});