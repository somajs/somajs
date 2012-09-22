;(function(ns, undefined) {

	var Command = function() {
		this.injector = null;
		this.instance = null;
		this.model = null;
	};
	Command.prototype.execute = function(event) {
		console.log(this, 'execute command');
		event.params.style.color = this.model.getColor();
	};

	ns.Command = Command;

})(this['ns'] = this['ns'] || {});
