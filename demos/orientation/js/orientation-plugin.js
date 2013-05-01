;(function(undefined) {

	'use strict';

	var OrientationPlugin = function(dispatcher) {
		// hold current orientation
		var orientation = detectDeviceOrientation();
		// add listener to detect orientation change
		window.addEventListener('orientationchange', handler);
		// store the new orientation and dispatch an event
		function handler(event) {
			orientation = detectDeviceOrientation();
			dispatcher.dispatch('orientation', orientation);
		}
		// return the orientation, portait or landscape
		function detectDeviceOrientation(){
			switch(window.orientation) {
				case 90:
				case -90:
					return 'landscape';
				case 0:
				case 180:
					break;
				default:
					return 'portrait';
			}
		}
		// return plugin API
		// getOrientation returns either landscape or portait
		// dispose removes the listener
		return {
			getOrientation: function() {
				return orientation;
			},
			dispose: function() {
				window.removeEventListener('orientationchange', handler);
			}
		};
	};

	if (soma && soma.plugins) {
		soma.plugins.Orientation = OrientationPlugin;
	}

})();