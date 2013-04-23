var loadFramework = true;

yepnope([
	{
		test: loadFramework,
		yep: [
			'../../framework/src/soma.js'
		],
		nope: [],
		both: [],
		load: [
			'../helloworld/js/app/wires.js',
			'../helloworld/js/app/models.js',
			'../helloworld/js/app/commands.js',
			'../helloworld/js/app/events.js',
			'../helloworld/js/app/views.js'
		],
		callback: function(scriptString, testResult) {
			console.log(scriptString, testResult);
		},
		complete: function() {

			var SomaApplication = soma.Application.extend({
				registerWires: function() {
					this.addWire(MessageWire.NAME, new MessageWire);
				}
			});
			new SomaApplication();
			
		}
	}
]);
