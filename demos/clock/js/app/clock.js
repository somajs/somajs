/*global soma:false*/
;(function(clock, soma) {

	'use strict';

	var ClockDemo = soma.Application.extend({
		constructor: function(element) {
			this.element = element;
			soma.Application.call(this);
		},
		init: function() {
			// mapping rules
			this.injector.mapClass('timer', clock.TimerModel, true);
			this.injector.mapClass('face', clock.AnalogFaceView);
			this.injector.mapClass('needleSeconds', clock.AnalogNeedleSecondsView);
			this.injector.mapClass('needleMinutes', clock.AnalogNeedleMinutesView);
			this.injector.mapClass('needleHours', clock.AnalogNeedleHoursView);
			// clock mediator
			this.mediators.create(clock.ClockMediator, this.element.querySelector('.clock'));
			// clock selector template
			this.createTemplate(clock.SelectorView, this.element.querySelector('.clock-selector'));
		},
		start: function() {
			this.dispatcher.dispatch('create', 'AnalogView');
		}
	});

	var clock = new ClockDemo(document.querySelector('.clock-app'));


})(window.clock = window.clock || {}, soma);