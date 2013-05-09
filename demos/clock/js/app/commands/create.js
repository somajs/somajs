;(function(clock) {

	'use strict';

	clock.CreateCommand = function(instance, mediators) {

		this.execute = function(event) {
			console.log('create', event.params);
			var element = instance.element.querySelector('.clock');
			element.innerHTML = "";
			mediators.create()
		};

	};

})(window.clock = window.clock || {});