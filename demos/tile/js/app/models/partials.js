(function(global) {

	'use strict';

	var partials = {};

	partials['tile-item.tpl.html'] = '<div class="item" data-id="{{item.id}}">\n' +
		'    {{item.title}}\n' +
		'    <img data-src="{{item.img}}" />\n' +
		'    <button data-click="remove()"></button>\n' +
		'</div>';

	// export

	global.tile = global.tile || {};
	global.tile.partials = partials;

})(this);