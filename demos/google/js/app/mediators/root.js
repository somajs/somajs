(function(global) {

	var RootMediator = function(target, dispatcher, rootElement, mediators) {

		var profileElement = null;

		dispatcher.addEventListener('create-profile', function(event) {
			createProfile();
		});

		dispatcher.addEventListener('authenticate', function(event) {
			if (!event.params && profileElement) {
				destroyProfile();
			}
		});

		function createProfile() {
			profileElement = document.createElement('div');
			profileElement.setAttribute('data-mediator', 'profile');
			profileElement.setAttribute('class', 'profile');
			rootElement.appendChild(profileElement);
		}

		function destroyProfile() {
			rootElement.removeChild(profileElement);
		}

	};

	// exports
	global.gp = global.gp || {};
	global.gp.RootMediator = RootMediator;

})(this);