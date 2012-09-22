;(function (ns, undefined) {


	var SomaApplication = soma.Application.extend({

		init:function () {

			// mapping
			this.injector.mapClass('model', ns.Model, true);
			this.injector.mapClass('view', ns.View, true);
			this.injector.mapValue('dom', document.getElementById('div'));
			//create model
			this.injector.getInstance(ns.Model);
			// create mediators
			this.mediators.create("li", ns.Mediator, document.getElementsByTagName("li"));
			// create commands
			this.commands.add("exec", ns.Command);

		},

		start: function() {
			this.dispatchEvent(new soma.Event("start"));
		},

		add: function() {
			// create li
			var existing = document.getElementsByTagName("li");
			var li = document.createElement('li');
			var last = existing[existing.length-1];
			var num = parseInt(last.getAttribute('data-id'));
			li.setAttribute('data-id', num+1);
			last.parentNode.appendChild(li);
			// create mediator
			this.mediators.create("li", ns.Mediator, [li])
		}

	});

	ns.app = new SomaApplication();

})(this['ns'] = this['ns'] || {});
