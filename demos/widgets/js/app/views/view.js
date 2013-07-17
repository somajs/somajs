(function(global) {

	var View = function(element, model, scope, module, mediators, injector) {

		console.log('[main] view created', element, model);

		var moduleContainer = element.querySelector('.modules');

		scope.load = function(event, id) {
			loadModule(id);
		}

		function loadModule(id) {

			module.load('module' + id, function(Module, Model, html) {

				console.log('module1 loaded', Module, Model, html);

				var wrapper = document.createElement('div');
				wrapper.innerHTML = html;
				var moduleHTML = wrapper.firstChild;
				moduleContainer.appendChild(moduleHTML);

				injector.mapClass('modelText', Model);
				mediators.create(Module, moduleHTML, Model);
				injector.removeMapping('modelText');

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
