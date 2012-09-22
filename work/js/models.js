;(function (ns, undefined) {

	var Model = function(dispatcher) {

		this.view = null;
		this.data = [];
		for(var i=0; i<100; i++) {this.data.push("["+i+"] click me")};

		dispatcher.addEventListener("start", this.start.bind(this));
		dispatcher.addEventListener("rendered", this.rendered.bind(this));

	};

	Model.prototype.start = function(event) {
		console.log(this, "START event received", event);
		this.view.render();
	}

	Model.prototype.rendered = function(event) {
		console.log(this, "RENDERED event received", event);
	}

	Model.prototype.getColor = function() {
		return "red";
	}

	ns.Model = Model;

})(this['ns'] = this['ns'] || {});
