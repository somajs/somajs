;(function (ns, undefined) {


	var SomaApplication = soma.Application.extend({

		init:function () {

			// router
			var router = Davis(function () {
				this.get('/:name', function (req) {
					console.log(req.params['name']);
				});
				this.state('/:name', function (req) {
					console.log('state', req.params['name']);
					req.redirect('/' + req.params['name']);
				});
			});
			// mapping
			this.injector.mapClass('model', ns.Model, true);
			this.injector.mapClass('view', ns.View, true);
			this.injector.mapValue('dom', document.getElementById('div'));
			this.injector.mapValue("router", router);
			//create model
			this.injector.getValue('model');
			// create mediators
			this.mediators.create(ns.Mediator, document.getElementsByTagName("li"));
			// create commands
			this.commands.add("exec", ns.Command);
			// create plugin
			var Custom = function(){this.customParam="custom"};
			this.injector.mapClass("custom", Custom);
			var plugin = this.createPlugin(PluginTest, "data", 1, true, {d:"d"}, [1, 2, 3]);
			console.log(plugin, "plugin instance");
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
			this.mediators.create(ns.Mediator, [li]);
		}

	});

	ns.app = new SomaApplication();

})(this['ns'] = this['ns'] || {});
