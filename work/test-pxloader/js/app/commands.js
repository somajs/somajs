var SomaAssetsCommand = soma.Command.extend({
	execute: function(event) {
		var wire = this.getWire(SomaAssetsWire.NAME);
		switch (event.type) {
			case SomaAssetsEvent.START:
				wire.start(event.params.tags);
				break;
		}
	}
});