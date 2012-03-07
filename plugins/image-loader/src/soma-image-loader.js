var SomaImageLoader = new Class({
	instance: null,
	initialize: function(instance, config) {
		this.instance = instance;
		var wire = this.instance.addWire(SomaAssetsWire.NAME, new SomaAssetsWire());
		if (config) wire.loadConfig(config);
	},
	addImage: function(id, url, tag, priority) {
		return this.instance.getWire(SomaAssetsWire.NAME).addImage(id, url, tag, priority);
	},
	start: function(tags) {
		this.instance.getWire(SomaAssetsWire.NAME).start(tags);
	},
	loadConfig: function(config) {
		this.instance.getWire(SomaAssetsWire.NAME).loadConfig(config);
	},
	getConfig: function() {
		return this.instance.getWire(SomaAssetsWire.NAME).config;
	},
	isConfigLoaded: function() {
		return this.instance.getWire(SomaAssetsWire.NAME).configLoaded;
	},
	dispose: function() {
		this.instance.removeWire(SomaAssetsWire.NAME);
		instance = null;
	}
});

var SomaAssetsWire = new Class({
	Extends: soma.Wire,
	config: null,
	configLoaded: false,
	initialize: function() {
		this.parent(SomaAssetsWire.NAME);
		// private
		var loader = new PxLoader();
		this.getLoader = function() {return loader};
		// private listeners
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
			this.dispatchEvent(new SomaAssetsEvent(SomaAssetsEvent.QUEUE_COMPLETE, null, this.getLoader(), data));
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
		this.getLoader().start(tags);
	},
	loadConfig: function(config) {
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
				this.config = JSON.parse(xmlhttp.responseText);
				if (!this.config || !this.config.assets || !(this.config.assets instanceof Array)) return;
				var loader = this.getLoader();
				var assets = this.config.assets;
				for (var i = 0; i < assets.length; ++i) {
					this.addImage(assets[i].id, assets[i].url, assets[i].tag, assets[i].priority);
				}
				this.configLoaded = true;
				this.dispatchEvent(new SomaAssetsEvent(SomaAssetsEvent.CONFIG_LOADED));
			}
		}.bind(this);
		xmlhttp.open("POST", config, true);
		xmlhttp.send();
	},
	dispose: function() {
		this.getLoader().dispose();
		config = null;
	}
});
SomaAssetsWire.NAME = "Wire::SomaAssetsWire";

var SomaAssetsEvent = new Class({
	Extends: soma.Event,
	initialize: function(type, tags, loader, data, completed, total) {
		var params = {
			tags:tags,
			loader:loader,
			data:data,
			completed:completed,
			total:total
		};
		return this.parent(type, params, true, true);
	}
});
SomaAssetsEvent.CONFIG_LOADED = "SomaAssetsEvent.CONFIG_LOADED";
SomaAssetsEvent.START = "SomaAssetsEvent.START";
SomaAssetsEvent.ITEM_COMPLETE = "SomaAssetsEvent.ITEM_COMPLETE";
SomaAssetsEvent.QUEUE_COMPLETE = "SomaAssetsEvent.QUEUE_COMPLETE";

var SomaAssetsCommand = new Class({
	Extends: soma.Command,
	execute: function(event) {
		var wire = this.getWire(SomaAssetsWire.NAME);
		switch (event.type) {
			case SomaAssetsEvent.START:
				wire.start(event.params.tags);
				break;
		}
	}
});
