/**
 * Create symbol synonym
 *
 * @author xiaohwan@gmail.com
 * @version 0.1
 * @url http://code.google.com/p/jsdoc-synonym/
 */

(function() {
	var synonyms = {};
	var getNameWithoutScope = function(name) {
		// TODO ?
		var local = name.match(/.*-(.*)/);
		var realName = local ? local[1] : name;
		return realName;
	};
	var var_dump = function(obj) {
		print(JSON.stringify(obj), '\r\n');
	};
	JSDOC.PluginManager.registerPlugin("JSDOC.synonym", {
		onSetTags: function(symbol) {
			try {
				var synonym = symbol.comment.getTag('synonym');
				if (synonym.length) {
					var ns = JSDOC.Parser.walker.namescope;
					var scopeId = ns[ns.length - 1].id;
					var name = getNameWithoutScope(symbol.name);
					if (!synonyms[scopeId]) {
						synonyms[scopeId] = {};
					}
					synonyms[scopeId][name] = synonym[0].desc
				}
			} catch(ex) {
				print(ex);
			}
		},
		onSymbol: function(symbol) {
			// TODO: ?
			if (JSDOC.Parser.walker) {
				var ns = JSDOC.Parser.walker.namescope;
				var scopeId = ns[ns.length - 1].id;
				if (synonyms[scopeId]) {
					var name = getNameWithoutScope(symbol.name);
					for (var synonym in synonyms[scopeId]) {
						if (name.indexOf(synonym) == 0) {
							symbol.name = name.replace(synonym, synonyms[scopeId][synonym]);
							symbol.alias = symbol.name;
							break;
						}
					}
				}
			}
		}
	});
})();
