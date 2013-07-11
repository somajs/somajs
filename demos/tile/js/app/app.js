(function(global) {

	'use strict';

	var tile = global.tile = global.tile || {};

	var TileApp = soma.Application.extend({
		constructor: function(element) {
			this.element = element;
			soma.Application.call(this);
		},
		init: function() {
			console.log('init');

			this.injector.mapClass('model', tile.TileModel, true);
			this.injector.mapValue('tpl', soma.template.create);

			this.mediators.map('header', tile.HeaderMediator);
			this.mediators.map('list', tile.ListMediator);
			this.mediators.map('item', tile.ItemMediator, 'model');
			this.mediators.observe(this.element);

		},
		start: function() {
			this.dispatcher.dispatch('render');
		}
	});

	var app = new TileApp(document.getElementById('app'));

	global.app = app;

})(this);
