(function(global) {

	var Module1 = function(target, modelText, image, externalImage) {

		console.log('[module1] created', target, modelText, image, externalImage);

		target.appendChild(image.cloneNode(true));

		var template = soma.template.create(target);
		var scope = template.scope;

		scope.img = externalImage;

		console.log('PROCESS IMAGE', externalImage);

		template.render();

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
