var PageTemplate = function(template, scope, element, model) {

	scope.name = model.getPath();
	scope.links = model.getLinks();
	template.render();

};

module.exports = PageTemplate;