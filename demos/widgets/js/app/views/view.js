(function(global) {

	var View = function(element, model, scope, module, mediators, injector) {

		console.log('[main] view created', element, model);

		var moduleContainer = element.querySelector('.modules');

		scope.load = function(event, id) {
			loadModule(id);
		}

		function loadModule(id) {

			var moduleName = 'module' + id;

			module.load(moduleName, function(Module, Model, html, image, externalImage) {

				console.log('module loaded', Module, Model, html, image, externalImage);

				console.log('module assets', module.getAssets(moduleName));

				var wrapper = document.createElement('div');
				wrapper.innerHTML = html;
				var moduleHTML = wrapper.firstChild;
				moduleContainer.appendChild(moduleHTML);

				mediators.create(Module, moduleHTML, function(childInjector) {

					console.log(childInjector);

					childInjector.mapClass('modelText', Model, true);
					childInjector.mapValue('image', image);
					childInjector.mapValue('externalImage', externalImage.src);
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
