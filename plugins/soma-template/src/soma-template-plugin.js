;(function(soma, undefined) {

	soma.template = soma.template || {};

    var SomaTemplatePlugin = function(instance, injector) {
	    var proto = instance.constructor.prototype;
	    proto.createTemplate = function(cl, domElement) {
		    if (!cl || typeof cl !== "function") {
			    throw new Error("Error creating a template, the first parameter must be a function.");
		    }
		    if (domElement && isElement(domElement)) {
			    var template = soma.template.create(domElement);
			    for (var key in template) {
				    if (typeof template[key] === 'function') {
				        cl.prototype[key] = template[key].bind(template);
				    }
			    }
			    cl.prototype.render = template.render.bind(template);
			    var childInjector = this.injector.createChild();
			    childInjector.mapValue("template", template);
			    childInjector.mapValue("scope", template.scope);
			    childInjector.mapValue("element", template.element);
			    return childInjector.createInstance(cl);
		    }
		    return null;
	    }

		soma.template.bootstrap = function(attrValue, element, func) {
			instance.createTemplate(func, element);
		}

    };

	function isElement(value) {
		return value ? value.nodeType > 0 : false;
	};

	// exports
	soma.template.plugin = SomaTemplatePlugin;

	// register for AMD module
	if (typeof define === 'function' && define.amd) {
		define("soma-template-plugin", soma.template);
	}

	// export for node.js
	if (typeof exports !== 'undefined') {
		if (typeof module !== 'undefined' && module.exports) {
			exports = module.exports = soma.template.plugin;
		}
		exports = soma.template.plugin;
	}


})(this['soma'] = this['soma'] || {});