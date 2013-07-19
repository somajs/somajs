(function(global) {

	var Model2 = function() {

		this.data = {
			text: 'I\'m the module 2'
		}

	};

	// export browser
	global.widgets = global.widgets || {};
	global.widgets.Model2 = Model2;

})(this);
