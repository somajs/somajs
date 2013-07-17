(function(global) {

	var Module = function(config) {
		console.log('module loader created', config);
		this.config = config || {};
		this.config.modules = this.config.modules || [];
		this.require = require.config(config);
	};

	Module.prototype.load = function(name, callback) {
		console.log('------  load module', name);

		var module = this.get(name);
		var paths = module.include;

		console.log('paths', paths);

		require(paths, function() {
			console.log('STUFF LOADED', arguments);
			if (callback) {
				callback.apply(null, arguments);
			}

		});
	};

	Module.prototype.add = function(name, include, exclude) {
		var modules = this.config.modules;
		modules.push({
			name: name,
			include: include || [],
			exclude: exclude || []
		});
		console.log(this.config);
	};

	Module.prototype.get = function(name) {
		var modules = this.config.modules;
		for (var i= 0, l=modules.length; i<l; i++) {
			if (modules[i].name === name) {
				return modules[i];
			}
		}
	};

	global.soma = global.soma || {};
	global.soma.module = {};
	global.soma.module.Module = Module;

})(this);
