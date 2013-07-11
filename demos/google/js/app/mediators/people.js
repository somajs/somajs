(function(global) {

	var PeopleMediator = function(target, people, dispatcher) {

		console.log('People created', people);

		var people = people;
		var template = soma.template.create(target);
		var scope = template.scope;

		render();

		dispatcher.addEventListener('update-people', function(event) {
			console.log('People update', event.params);
			people = event.params;
			render();
		});

		function render() {
			scope.people = people;
			scope.itemsLength = people.items.length;
			template.render();
		}

		this.dispose = function() {
			console.log('People removed');
			template.dispose();
			template = null;
		};

	};

	// exports
	global.gp = global.gp || {};
	global.gp.PeopleMediator = PeopleMediator;

})(this);