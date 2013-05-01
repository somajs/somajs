;(function(undefined) {

	'use strict';

	var Model = function() {};
	Model.prototype.getData = function() {
		return "Hello soma.js!";
	};

	var Mediator = function(target, dispatcher, model) {
		dispatcher.addEventListener('show-hello-world', function(event) {
			target.innerHTML = model.getData();
		});
	};

	var App = soma.Application.extend({
		init: function() {
			this.injector.mapClass('model', Model, true);
			this.mediators.create(Mediator, document.getElementById('message'));
		},
		start: function() {
			this.dispatcher.dispatch('show-hello-world');
		}
	});

	var app = new App();

})();