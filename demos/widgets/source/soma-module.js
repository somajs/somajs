(function(global) {

	// **************************************************************************************
	// ***** MODULE LOADER ******************************************************************
	// **************************************************************************************

	var ModuleLoader = function(config) {

		console.log('module loader created', config);

		this.config = config || {};
		this.config.modules = this.config.modules || [];
		this.config.shim = this.config.shim || {};

		this.assets = {};

		this.update();

	};

	ModuleLoader.prototype.load = function(name, callback) {
		console.log('------  load module', name);

		var module = this.get(name);
		var paths = module.include;

		console.log('paths', paths);

		require(paths, function() {

			console.log('STUFF LOADED', arguments);

			this.assets[name] = Array.apply(null, arguments);

			console.log('ASSETS', name, this.assets[name]);

			if (callback) {
				callback.apply(null, arguments);
			}

		}.bind(this));
	};

	ModuleLoader.prototype.addShim = function(name, exports) {
		var shim = this.config.shim;
		shim[name] = {
			exports: exports
		}

		this.update();

	};

	ModuleLoader.prototype.add = function(name, include, exclude) {

		var modules = this.config.modules;

		var extract;

		if (!isArray(include)) {
			extract = [];
			for (var id in include) {
				this.addShim(include[id], id);
				extract.push(include[id]);
			}
		}

		modules.push({
			name: name,
			include: extract || include || [],
			exclude: exclude || []
		});

		this.update();

		console.log(this.config);
	};

	ModuleLoader.prototype.get = function(name) {
		var modules = this.config.modules;
		for (var i= 0, l=modules.length; i<l; i++) {
			if (modules[i].name === name) {
				return modules[i];
			}
		}
	};

	ModuleLoader.prototype.getAssets = function(name) {
		return this.assets[name];
	};

	ModuleLoader.prototype.update = function() {
		require.config(this.config);
	};

	ModuleLoader.prototype.print = function() {
		return JSON.stringify(this.config);
	};

	// **************************************************************************************
	// ***** MODULE *************************************************************************
	// **************************************************************************************

	// **************************************************************************************
	// ***** MODULE LOADER ******************************************************************
	// **************************************************************************************

	function isArray(value) {
		return Object.prototype.toString.apply(value) === '[object Array]';
	}

	global.soma = global.soma || {};
	global.soma.module = {};
	global.soma.module.Module = ModuleLoader;

})(this);
