;(function(ns, undefined) {

	var Mediator = function() {
		this.dispatcher = null;
		this.scope = null;
		this.model = null;
		this.router = null;
	};
	Mediator.prototype.postConstruct = function() {
		this.scope.innerHTML = this.model.data[parseInt(this.scope.getAttribute('data-id'))]
		console.log(this, 'render li', this.scope, this.model);
		this.scope.addEventListener('click', this.clickHandler.bind(this));
	};
	Mediator.prototype.clickHandler = function() {
		console.log('clicked', this.scope);
		this.dispatcher.dispatchEvent(new soma.Event("exec", this.scope));
	};

	ns.Mediator = Mediator;

})(this['ns'] = this['ns'] || {});
