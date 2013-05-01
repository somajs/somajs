;(function(undefined) {

	'use strict';

	var View = function(target, dispatcher, orientation) {
		// display the orientation when the view is created
		updateOrientation(orientation.getOrientation());
		// listen to the event dispatched by the plugin
		dispatcher.addEventListener('orientation', function(event) {
			// display the orientation when a change happened
			updateOrientation(event.params);
		});
		// display the orientation in the DOM Element
		function updateOrientation(value) {
			target.innerHTML = 'Current orientation: ' + value;
		}
	};

	var Application = soma.Application.extend({
		init: function() {
			// create the plugin
			var plugin = this.createPlugin(soma.plugins.Orientation);
			// create a mapping rule
			this.injector.mapValue('orientation', plugin);
		},
		start: function() {
			// create a view
			this.mediators.create(View, document.querySelector('.report'));
		}
	});

	var app = new Application();

})();