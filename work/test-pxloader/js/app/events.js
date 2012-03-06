var SomaAssetsEvent = soma.Event.extend({
	constructor: function(type, tags, loader, data, completed, total) {
		var params = {
			tags:tags,
			loader:loader,
			data:data,
			completed:completed,
			total:total
		};
		return soma.Event.call(this, type, params, true, true);
	}
});
SomaAssetsEvent.CONFIG_LOADED = "SomaAssetsEvent.CONFIG_LOADED";
SomaAssetsEvent.START = "SomaAssetsEvent.START";
SomaAssetsEvent.ITEM_COMPLETE = "SomaAssetsEvent.ITEM_COMPLETE";
SomaAssetsEvent.COMPLETE = "SomaAssetsEvent.COMPLETE";
