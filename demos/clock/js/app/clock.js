/*global soma:false*/
;(function(clock, soma) {

	'use strict';

	var ClockDemo = soma.Application.extend({
		constructor: function(element) {
			this.element = element;
			soma.Application.call(this);
		},
		init: function() {
			this.injector.mapClass('timer', clock.TimerModel, true);
			this.mediators.create(clock.ClockMediator, this.element.querySelector('.clock'));
			this.createTemplate(clock.SelectorView, this.element.querySelector('.clock-selector'));
		},
		start: function() {
			this.dispatcher.dispatch('create', 'DigitalView');
		}
	});

	var clockInstance = new ClockDemo(document.querySelector('.clock-app'));


})(window.clock = window.clock || {}, soma);