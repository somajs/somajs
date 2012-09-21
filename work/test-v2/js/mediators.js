;(function(ns, undefined) {

	var Mediator = function() {
		this.li = null;
	};
	Mediator.prototype.postConstruct = function() {
		console.log(this, 'render li', this.li);
	};

	ns.Mediator = Mediator;

})(this['ns'] = this['ns'] || {});
