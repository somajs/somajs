;(function (ns, undefined) {

	var App = soma.Application.extend({
		init:function () {
			this.createPlugin(soma.template.plugin);
			// create template manually (the other template is created from the dom)
			this.createTemplate(MyTemplate, document.getElementById('content'));
		}
	});

	var MyTemplate = function (scope, dispatcher) {
		scope.name = "John";
		this.render();
	};

	var app = new App();

	ns.MyTemplate = MyTemplate;

})(this['ns'] = this['ns'] || {});
