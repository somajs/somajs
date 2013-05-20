(function(snake, window) {

	'use strict';

	(function() {
		var lastTime = 0,
			vendors = ['ms', 'moz', 'webkit', 'o'],
			x,
			length,
			currTime,
			timeToCall;

		for(x = 0, length = vendors.length; x < length && !window.requestAnimationFrame; ++x) {
			window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
			window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
		}

		if (!window.requestAnimationFrame) {
			window.requestAnimationFrame = function(callback) {
				currTime = new Date().getTime();
				timeToCall = Math.max(0, 16 - (currTime - lastTime));
				lastTime = currTime + timeToCall;
				return window.setTimeout(function() {
						callback(currTime + timeToCall);
					}, timeToCall);
			};
		}

		if (!window.cancelAnimationFrame) {
			window.cancelAnimationFrame = function(id) {
				clearTimeout(id);
			};
		}

	}());

	snake.Time = function(config) {

		var speedHandlers = [];
		var speedTimeoutId;
		var speed = config.speed;

		function speedLoop() {

			for (var i = 0, l = speedHandlers.length; i<l; i++) {
				if (typeof speedHandlers[i] === 'function') {
					speedHandlers[i]();
				}
			}

			speedTimeoutId = setTimeout(speedLoop, speed * 1000);
		}

		this.add = function(target) {
			if (typeof target.update === 'function' && typeof target.draw === 'function') {
				(function loop() {
					target.update();
					target.draw();
					window.requestAnimationFrame(loop);
				})();
			}
		};

		this.addSpeedHandler = function(handler) {
			speedHandlers.push(handler);
		};

		this.start = function() {
			if (speedTimeoutId === undefined) {
				speedLoop();
			}
		};

	};

})(window.snake = window.snake || {}, window);