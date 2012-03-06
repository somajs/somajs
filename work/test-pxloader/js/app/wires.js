var SomaAssetsWire = soma.Wire.extend({

	config: null,
	configLoaded: false,

	constructor: function() {
		soma.Wire.call(this, SomaAssetsWire.NAME);

		// private
		var loader = new PxLoader();
		this.getLoader = function() {return loader};

		var itemCompleteHandler = function(event) {
			var data = event.resource.img;
			this.dispatchEvent(new SomaAssetsEvent(SomaAssetsEvent.ITEM_COMPLETE, null, event.resource, data, event.completedCount, event.totalCount));
		}.bind(this);

		var completeHandler = function(event) {
			var data = [];
			var entries = loader.getEntries();
			for (var i = 0; i < entries.length; ++i) {
				data[entries[i].resource.id] = entries[i].resource.img;
			}
			this.dispatchEvent(new SomaAssetsEvent(SomaAssetsEvent.COMPLETE, null, this.getLoader(), data));
		}.bind(this);

		loader.addProgressListener(itemCompleteHandler);
		loader.addCompletionListener(completeHandler);

	},

	init: function() {
		this.addCommand(SomaAssetsEvent.START, SomaAssetsCommand);
	},

	addImage: function(id, url, tag, priority) {
		var imageLoader = new PxLoaderImage(url, tag, priority);
		imageLoader.id = id;
		this.getLoader().add(imageLoader);
		return imageLoader;
	},

	start: function(tags) {
		console.log("will start", tags)
		this.getLoader().start(tags);
	},

	loadConfig: function(config) {
		this.config = config;
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
				var items = JSON.parse(xmlhttp.responseText);
				if (!items || !items.assets || !(items.assets instanceof Array)) return;
				var loader = this.getLoader();
				var assets = items.assets;
				for (var i = 0; i < assets.length; ++i) {
					this.addImage(assets[i].id, assets[i].url, assets[i].tag, assets[i].priority);
				}
				this.configLoaded = true;
				this.dispatchEvent(new SomaAssetsEvent(SomaAssetsEvent.CONFIG_LOADED));
			}
		}.bind(this);
		xmlhttp.open("POST", config, true);
		xmlhttp.send();
	}

});

SomaAssetsWire.NAME = "Wire::SomaAssetsWire";
