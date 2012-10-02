;(function(ns, undefined) {

	var Command = function() {
		this.injector = null;
		this.instance = null;
		this.model = null;
		this.router = null;
	};
	Command.prototype.execute = function(event) {
		console.log(this, 'execute command');
		event.params.style.color = this.model.getColor();
		this.router.trans("/" + event.params.getAttribute('data-id'));
	};

	ns.Command = Command;

})(this['ns'] = this['ns'] || {});
