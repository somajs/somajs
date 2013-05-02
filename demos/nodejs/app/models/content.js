var ContentModel = function() {
	this.data = {
		links: [
			{ name: 'Click here', url: '/click-here' },
			{ name: 'Try another', url: '/try-another' },
			{ name: 'And the last link', url: '/and-the-last-link' },
			{ name: 'Send me home', url: '/' }
		]
	};
};
ContentModel.prototype.getLinks = function() {
	return this.data.links;
};
ContentModel.prototype.setPath = function(value) {
	this.data.path = value;
};
ContentModel.prototype.getPath = function(value) {
	return this.data.path;
};

module.exports = ContentModel;