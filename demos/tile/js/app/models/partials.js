(function(global) {

	'use strict';

	var partials = {};

	partials['tile-item.tpl.html'] = '<div data-id="{{data.id}}">\n' +
		'	{{data.title}}\n' +
		'	<img data-src="{{data.img}}" />\n' +
		'	<button data-click="remove()"></button>\n' +
		'</div>\n' +
		'';

	// export

	global.tile = global.tile || {};
	global.tile.partials = partials;

})(this);