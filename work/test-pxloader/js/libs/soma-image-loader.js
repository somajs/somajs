//var SomaImageLoader = function(instance, config) {
//	var wire = instance.addWire(SomaAssetsWire.NAME, new SomaAssetsWire());
//	wire.loadConfig(config);
//};
var SomaImageLoader = soma.extend({
	constructor: function(instance, config) {
		var wire = instance.addWire(SomaAssetsWire.NAME, new SomaAssetsWire());
		wire.loadConfig(config);
	}
});
