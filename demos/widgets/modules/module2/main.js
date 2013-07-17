(function(global) {

	var Module2 = function(target, modelText) {

		console.log('[module2] created', target, modelText);

	};

	// exports require.js
	if (typeof define === 'function' && typeof define.amd !== 'undefined') {
		define(function() {
			return Module2;
		});
	}

	// export browser
	global.widgets = global.widgets || {};
	global.widgets.Module2 = Module2;

})(this);
