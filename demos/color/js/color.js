;(function(undefined) {

	'use strict';

	var ColorModel = function(dispatcher) {

		dispatcher.addEventListener('all', changeColor, 1);
		dispatcher.addEventListener('others', changeColor, 1);

		var color = getRandomColor();

		function getRandomColor() {
			var letters = '0123456789ABCDEF'.split('');
			var color = '#';
			for (var i = 0; i < 6; i++ ) {
				color += letters[Math.round(Math.random() * 15)];
			}
			return color;
		}

		function changeColor(event) {
			color = getRandomColor();
		}

		return {
			getColor: function() {
				return color;
			}
		};
	};

	var ContainerMediator = function(target, mediators) {
		for (var i=0; i<20; i++) {
			$(target).append('<div class="widget" data-id="' + i + '"><button class="all">Change All</button><button class="others">Change Others</button></div>');
		}
		mediators.create(WidgetMediator, $('.widget'));
	};

	var WidgetMediator = function(target, dispatcher, colorModel) {
		var id = $(target).attr('data-id');
		dispatcher.addEventListener('all', allHandler);
		dispatcher.addEventListener('others', othersHandler);
		$('.all', target).click(function(event) {
			dispatcher.dispatch('all');
		});
		$('.others', target).click(function(event) {
			dispatcher.dispatch('others', id);
		});
		function allHandler(event) {
			$(target).css('background-color', colorModel.getColor());
		}
		function othersHandler(event) {
			if (id !== event.params) {
				$(target).css('background-color', colorModel.getColor());
			}
		}
	};

	var App = soma.Application.extend({
		init: function() {
			this.injector.mapClass('colorModel', ColorModel, true);
			this.mediators.create(ContainerMediator, $('.container'));
		}
	});

	var app = new App();

})();
