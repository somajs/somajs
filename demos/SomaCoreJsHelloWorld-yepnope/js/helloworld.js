var loadFramework = true;

yepnope([
	{
		test: loadFramework,
		yep: [
			'../../framework/libs/mootools-core-1.4.1-full-nocompat-yc.js',
			'../../framework/src/somacore.js'
		],
		nope: [],
		both: [],
		load: [
			'js/app/wires.js',
			'js/app/models.js',
			'js/app/commands.js',
			'js/app/events.js',
			'js/app/views.js'
		],
		callback: function(scriptString, testResult) {
			console.log(scriptString, testResult);
		},
		complete: function() {

			var SomaApplication = new Class({
				Extends: soma.core.Core,
				registerWires: function() {
					this.addWire(MessageWire.NAME, new MessageWire);
				}
			});
			new SomaApplication();
			
		}
	}
]);
