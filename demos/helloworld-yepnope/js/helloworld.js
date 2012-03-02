var loadFramework = true;

yepnope([
	{
		test: loadFramework,
		yep: [
			'../../framework/libs/mootools-core-1.4.5.js',
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

			var SomaApplication = new Class({
				Extends: soma.Application,
				registerWires: function() {
					this.addWire(MessageWire.NAME, new MessageWire);
				}
			});
			new SomaApplication();
			
		}
	}
]);
