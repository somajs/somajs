(function(global) {

	var Model = function() {

		console.log('[main] model created');

	};

	// exports require.js
	if (typeof define === 'function' && typeof define.amd !== 'undefined') {
		define(function() {
			return Model;
		});
	}

	// export browser
	global.widgets = global.widgets || {};
	global.widgets.Model = Model;

})(this);
