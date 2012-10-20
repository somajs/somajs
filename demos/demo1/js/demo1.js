;(function(ns, undefined) {

    var App = soma.Application.extend({
	    init: function() {
		    this.injector.mapClass('colorModel', ColorModel, true);
		    this.mediators.create(ContainerMediator, $('.container'));
	    }
    });

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
		}
	};

	var ContainerMediator = function(scope, mediators) {
		for (var i=0; i<20; i++) {
			$(scope).append('<div class="widget" data-id="' + i + '"><button class="all">Change All</button><button class="others">Change Others</button></div>');
		}
		mediators.create(WidgetMediator, $('.widget'));
	};

	var WidgetMediator = function(scope, dispatcher, colorModel) {
		var id = $(scope).attr('data-id');
		dispatcher.addEventListener('all', allHandler);
		dispatcher.addEventListener('others', othersHandler);
		$('.all', scope).click(function(event) {
			dispatcher.dispatch('all');
		});
		$('.others', scope).click(function(event) {
			dispatcher.dispatch('others', id);
		});
		function allHandler(event) {
			$(scope).css('background-color', colorModel.getColor());
		}
		function othersHandler(event) {
			if (id !== event.params) {
				$(scope).css('background-color', colorModel.getColor());
			}
		}
	};

	var app = new App();

})(this['ns'] = this['ns'] || {});
