;(function(ns, undefined) {

	var Mediator = function() {
		this.dispatcher = null;
		this.li = null;
		this.model = null;
	};
	Mediator.prototype.postConstruct = function() {
		this.li.innerHTML = this.model.data[parseInt(this.li.getAttribute('data-id'))]
		console.log(this, 'render li', this.li, this.model);
		this.li.addEventListener('click', this.clickHandler.bind(this));
	};
	Mediator.prototype.clickHandler = function() {
		console.log('clicked', this.li);
		this.dispatcher.dispatchEvent(new soma.Event("exec", this.li));
	};

	ns.Mediator = Mediator;

})(this['ns'] = this['ns'] || {});
