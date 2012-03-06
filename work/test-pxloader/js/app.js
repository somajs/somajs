var SomaApplication = soma.Application.extend({

	registerWires: function() {
		this.addWire(SomaAssetsWire.NAME, new SomaAssetsWire());
	},

	start: function() {
		this.addEventListener(SomaAssetsEvent.CONFIG_LOADED, this.configLoadedHandler.bind(this));
		this.addEventListener(SomaAssetsEvent.START, this.startHandler);
		this.addEventListener(SomaAssetsEvent.ITEM_COMPLETE, this.progressHandler);
		this.addEventListener(SomaAssetsEvent.COMPLETE, this.completeHandler);

		this.getWire(SomaAssetsWire.NAME).loadConfig("assets/config.json");
	},

	configLoadedHandler: function(event) {
		console.log('> ready', this.getWire(SomaAssetsWire.NAME).config);
		this.dispatchEvent(new SomaAssetsEvent(SomaAssetsEvent.START, ['menu', 'game']));
	},

	startHandler: function(event) {
		//event.preventDefault();
		console.log('> start');
	},

	progressHandler: function(event) {
		console.log('> item complete', event.params.completed, "/", event.params.total);
		console.log('    id:', event.params.loader.id);
		console.log('    loader:', event.params.loader);
		console.log('    data:', event.params.data);
		var elOutput = document.getElementById("output");
		elOutput.innerHTML = elOutput.innerHTML + 'Image ' + event.params.loader.id + ' Loaded<br/>';
		var elProgress = document.getElementById("progress");
		elProgress.innerHTML = event.params.completed + ' / ' + event.params.total;
	},

	completeHandler: function(event) {
		console.log('> complete');
		var canvas = document.getElementById('sample1-canvas');
	    var ctx = canvas.getContext('2d');
	    ctx.drawImage(event.params.data['img1'], 0, 0);
	    ctx.drawImage(event.params.data['img2'], 100, 0);
	    ctx.drawImage(event.params.data['img3'], 200, 0);
	}

});

var app = new SomaApplication();
