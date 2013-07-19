(function(global) {

	var Model1 = function() {

		this.data = {
			text: 'I\'m the module 1'
		}

	};

	// exports require.js
	if (typeof define === 'function' && typeof define.amd !== 'undefined') {
		define(function() {
			return Model1;
		});
	}

	// export browser
	global.widgets = global.widgets || {};
	global.widgets.Model1 = Model1;

})(this);
