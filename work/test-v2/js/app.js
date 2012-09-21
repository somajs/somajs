;(function (ns, undefined) {


	var SomaApplication = soma.Application.extend({

		init:function () {

			this.injector.mapClass('model', ns.Model, true);
			this.injector.mapClass('view', ns.View, true);

			this.injector.mapValue('dom', document.getElementById('div'));

			this.injector.getInstance(ns.Model);

		},

		start: function() {
			this.dispatchEvent(new soma.Event("start"));
		}

	});

	var app = new SomaApplication();

})(this['ns'] = this['ns'] || {});
