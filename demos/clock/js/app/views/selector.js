;(function(clock) {

	'use strict';

    clock.SelectorView = function(scope, dispatcher) {

		scope.select = function(event, id) {
			dispatcher.dispatch('create', id);
		};

    };

})(window.clock = window.clock || {});