(function(global) {

	var Module2 = function(target, modelText) {

		console.log('[module2] created', target, modelText, image, externalImage);

		target.appendChild(image.cloneNode(true));

		var template = soma.template.create(target);
		var scope = template.scope;

		scope.img = externalImage;

		template.render();

	};

	// export browser
	global.widgets = global.widgets || {};
	global.widgets.Module2 = Module2;

})(this);
