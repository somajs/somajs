;(function (ns, undefined) {

	var Model = function(dispatcher) {

		this.view = null;

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

	ns.Model = Model;

})(this['ns'] = this['ns'] || {});
