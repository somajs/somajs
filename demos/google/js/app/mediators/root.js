(function(global) {

	var RootMediator = function(target, dispatcher, partial, rootElement, mediators) {

		var wrapper = document.createElement('div');
		var modules = {};

		dispatcher.addEventListener('create-module', function(event) {
			createModule(event.params);
		});

		dispatcher.addEventListener('authenticate', function(event) {
			if (!event.params) {
				for (var m in modules) {
					removeModule(m);
				}
			}
		});

		function createModule(id) {
			if (!modules[id]) {
				partial.load('partials/' + id + '.html', function(html) {
					wrapper.innerHTML = html;
					modules[id] = wrapper.firstChild;
					target.appendChild(wrapper.firstChild);
				});
			}
		}

		function removeModule(id) {
			if (modules[id]) {
				target.removeChild(modules[id]);
			}
		}

	};

	// exports
	global.gp = global.gp || {};
	global.gp.RootMediator = RootMediator;

})(this);