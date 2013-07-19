(function(global) {

	var View = function(element, model, scope, loader, mediators, injector) {

		console.log('[main] view created', element, model);

		var moduleContainer = document.getElementById('modules');

		scope.load = function(event, id) {
			loadModule(id);
		}

		function loadModule(id) {

			var moduleName = 'module' + id;

			loader.load(moduleName, function(Module, Model, html, image, externalImage) {

				console.log('module loaded', Module, Model, html, image, externalImage);
				console.log('module assets', loader.getAssets(moduleName));

				var wrapper = document.createElement('div');
				wrapper.innerHTML = html;
				var moduleHTML = wrapper.firstChild;
				moduleContainer.appendChild(moduleHTML);

				console.log('HTML', moduleHTML);

				mediators.create(Module, moduleHTML, function(childInjector) {
					childInjector.mapClass('modelText', Model, true);
					if (image) {
						childInjector.mapValue('image', image);
					}
					if (externalImage) {
						childInjector.mapValue('externalImage', externalImage.src);
					}
				});

			});

		}

	};

	// exports require.js
	if (typeof define === 'function' && typeof define.amd !== 'undefined') {
		define(function() {
			return View;
		});
	}

	// export browser
	global.widgets = global.widgets || {};
	global.widgets.View = View;

})(this);
