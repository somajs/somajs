var SomaApplication = soma.core.Application.extend({
	init: function() {

	},
	registerWires: function() {
		this.addWire(SearchWire.NAME, new SearchWire());
		this.addWire(TwitterService.NAME, new TwitterService());
	},
	registerCommands: function() {
		this.addCommand(TwitterEvent.SEARCH, TwitterCommand);
	}
});
new SomaApplication();

//
//console.log("----------------------");
//
//var SuperClass = Object.extend({
//	constructor: function(name) {
//		this.name = name;
//	},
//	say: function() {
//		console.log("[SUPER] my name is:", this.name);
//	}
//});
//
//// ******** USAGE ******************************************************
//
//var SubClass = SuperClass.extend({
////	constructor: function(name) {
////		soma.Wire.apply(this, arguments);
////		console.log("constructor");
////	}
//	say: function() {
//		//console.log("parent", this.parent);
//		console.log("[SUB] my name is:", this.name);
//	}
//});
//
//var sup = new SuperClass("master");
//sup.say();
//
//var sub = new SubClass("john");
//sub.say();
//
