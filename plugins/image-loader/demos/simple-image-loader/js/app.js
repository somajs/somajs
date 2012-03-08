var SomaApplication = new Class({
	Extends: soma.Application,
	init: function() {
		// create the plugin
		this.plugin = this.createPlugin(SomaImageLoader, "assets/config.json");
	},
	registerWires: function() {
		// create a wire
		this.addWire(AssetsWire.NAME, new AssetsWire());
	}
});

var AssetsWire = new Class({
	Extends: soma.Wire,
	init: function() {
		// listen the plugin events
		this.addEventListener(SomaImageLoaderEvent.CONFIG_LOADED, this.configLoadedHandler.bind(this));
		this.addEventListener(SomaImageLoaderEvent.START, this.startHandler.bind(this));
		this.addEventListener(SomaImageLoaderEvent.ITEM_COMPLETE, this.itemCompleteHandler.bind(this));
		this.addEventListener(SomaImageLoaderEvent.QUEUE_COMPLETE, this.completeHandler.bind(this));
	},
	configLoadedHandler: function(event) {
		this.log('> ready');
		var elOutput = document.getElementById("output");
		elOutput.innerHTML = "Config loaded.<br/>";
		// config is loaded
		// dispatch the plugin command START to start the loading (plugin.start() could be used)
		this.dispatchEvent(new SomaImageLoaderEvent(SomaImageLoaderEvent.START));
	},
	startHandler: function(event) {
		// event.preventDefault() can be used to stop the execution of the command at this point
		this.log('> start');
		var elOutput = document.getElementById("output");
		elOutput.innerHTML = elOutput.innerHTML + "Start loading images...<br/>";
	},
	itemCompleteHandler: function(event) {
		// notification received when an item is loaded
		this.log('> item complete', event.params.completed, "/", event.params.total);
		this.log('    id:', event.params.loader.id);
		this.log('    loader:', event.params.loader);
		this.log('    data:', event.params.data);
		var elOutput = document.getElementById("output");
		elOutput.innerHTML = elOutput.innerHTML + 'Image ' + event.params.loader.id + ' Loaded<br/>';
		var elProgress = document.getElementById("progress");
		elProgress.innerHTML = event.params.completed + ' / ' + event.params.total;
	},
	completeHandler: function(event) {
		// notification received when all items are loaded
		this.log('> complete');
		var canvas = document.getElementById('sample1-canvas');
		var ctx = canvas.getContext('2d');
		ctx.drawImage(event.params.data['img1'], 0, 0);
		ctx.drawImage(event.params.data['img2'], 100, 50);
		ctx.drawImage(event.params.data['img3'], 200, 100);
		ctx.drawImage(event.params.data['img4'], 300, 150);
		ctx.drawImage(event.params.data['img5'], 400, 200);
	},
	log: function() {
		 if (console && console.log) console.log.apply(console, arguments);
	}
});
AssetsWire.NAME = "AssetsWire";

var app = new SomaApplication();
