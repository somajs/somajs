(function(global) {

	'use strict';

	var tile = global.tile = global.tile || {};

	var TileApp = soma.Application.extend({
		constructor: function(element) {
			this.element = element;
			soma.Application.call(this);
		},
		init: function() {
			// mapping rule (model containing a list of items)
			this.injector.mapClass('model', tile.TileModel, true);
			// mapping rule (templates object containing html)
			this.injector.mapValue('partials', tile.partials);
			// mapping rule (shortcut to abstract and create templates)
			this.injector.mapValue('tpl', soma.template.create);
			// mediator mapping for mediator auto creation and removal (Mutation Observers)
			this.mediators.map('log', tile.LogMediator);
			this.mediators.map('header', tile.HeaderMediator);
			this.mediators.map('list', tile.ListMediator);
			this.mediators.map('item', tile.ItemMediator, {data: 'model'});
			// add custom mediator attributes
			this.mediators.describe('data-hover').map('hover', tile.TileHover, {color:'model'});
			// observe an element (Mutation Observers)
			this.mediators.observe(this.element);
		},
		start: function() {

		}
	});

	var app = new TileApp(document.getElementById('app'));

	global.app = app;

})(this);
