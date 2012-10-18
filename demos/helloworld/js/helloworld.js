;(function(ns, undefined) {

    var App = soma.Application.extend({
	    init: function() {
		    this.injector.mapClass('model', Model, true);
		    this.mediators.create(Mediator, $('.message'));
	    }
    });

	var Model = function() {};
	Model.prototype.getData = function() {
		return "hello soma.js";
	};

	var Mediator = function(scope, model) {
		$('button', scope).click(function() {
			$('.messageContainer', scope).html(model.getData());
		});
	};

	var app = new App();

})(this['ns'] = this['ns'] || {});
