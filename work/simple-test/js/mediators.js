;(function(ns, undefined) {

	var Mediator = function() {
		this.dispatcher = null;
		this.target = null;
		this.model = null;
		this.router = null;
	};
	Mediator.prototype.postConstruct = function() {
		this.target.innerHTML = this.model.data[parseInt(this.target.getAttribute('data-id'))]
		console.log(this, 'render li', this.scope, this.model);
		this.target.addEventListener('click', this.clickHandler.bind(this));
	};
	Mediator.prototype.clickHandler = function() {
		console.log('clicked', this.scope);
		this.dispatcher.dispatchEvent(new soma.Event("exec", this.target));
	};

	ns.Mediator = Mediator;

})(this['ns'] = this['ns'] || {});
