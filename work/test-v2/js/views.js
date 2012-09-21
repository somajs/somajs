;(function(ns, undefined) {

	var View = function() {
		this.dom = null;
		this.dispatcher = null;
	};
	View.prototype.render = function() {
		console.log(this, 'render', this.dom);
		this.dispatcher.dispatchEvent(new soma.Event('rendered'));
	};

	ns.View = View;

})(this['ns'] = this['ns'] || {});
