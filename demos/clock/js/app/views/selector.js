(function(clock) {

	'use strict';

    clock.SelectorView = function(scope, dispatcher) {

		var views = {
			'digital': clock.DigitalView,
			'analog': clock.AnalogView,
			'polar': clock.PolarView
		};

		scope.select = function(event, id) {
			dispatcher.dispatch('create', views[id]);
		};

    };

})(window.clock = window.clock || {});