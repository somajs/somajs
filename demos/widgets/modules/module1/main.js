(function(global) {

	var Module1 = function(target, modelText) {

		console.log('[module1] created', target, modelText);

	};

	// exports require.js
	if (typeof define === 'function' && typeof define.amd !== 'undefined') {
		define(function() {
			return Module1;
		});
	}

	// export browser
	global.widgets = global.widgets || {};
	global.widgets.Module1 = Module1;

})(this);
