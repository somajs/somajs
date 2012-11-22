;(function (ns, undefined) {

	var App = soma.Application.extend({
		init:function () {
			this.createPlugin(soma.template.plugin);
			this.createTemplate(Template, document.getElementById('content'));
		}
	});

	var Template = function (scope) {
		scope.name = "John";
		this.render();
	};

	var app = new App();

})(this['ns'] = this['ns'] || {});
