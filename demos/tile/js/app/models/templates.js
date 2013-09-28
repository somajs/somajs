(function(global) {

	'use strict';

	var templates = {};

	templates['tile-item.tpl.html'] = '<div data-id="{{data.id}}">\n' +
		'	{{data.title}}\n' +
		'	<img data-src="{{data.img}}" />\n' +
		'	<button data-click="remove()"></button>\n' +
		'</div>\n' +
		'';

	// export

	global.tile = global.tile || {};
	global.tile.templates = templates;

})(this);