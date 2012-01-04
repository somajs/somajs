var loadFramework = true;

yepnope([
	{
		test: loadFramework,
		yep: [
			'../../framework/libs/mootools-core-1.4.2.js',
			'../../framework/src/somacore.js'
		],
		nope: [],
		both: [],
		load: [
			'../SomaCoreJsHelloWorld/js/app/wires.js',
			'../SomaCoreJsHelloWorld/js/app/models.js',
			'../SomaCoreJsHelloWorld/js/app/commands.js',
			'../SomaCoreJsHelloWorld/js/app/events.js',
			'../SomaCoreJsHelloWorld/js/app/views.js'
		],
		callback: function(scriptString, testResult) {
			console.log(scriptString, testResult);
		},
		complete: function() {

			var SomaApplication = new Class({
				Extends: soma.core.Application,
				registerWires: function() {
					this.addWire(MessageWire.NAME, new MessageWire);
				}
			});
			new SomaApplication();
			
		}
	}
]);
