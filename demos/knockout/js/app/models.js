var InfoModel = new Class({

	Extends: soma.Model,

	domElement: null,

	firstName: null,
	lastName: null,
	fullName: null,

	isLowerCase: true,

	constructor: function(domElement) {
		this.domElement = domElement;
	},

	init: function() {
		this.firstName = ko.observable("Bert");
		this.lastName = ko.observable("Bertington");
		this.fullName = ko.computed(this.getFullName, this);
		ko.applyBindings(this, this.domElement);
	},

	getFullName: function() {
		return this.firstName() + " " + this.lastName();
	},

	applyChangeCase: function() {
		console.log('MODEL changeCase');
		this.isLowerCase = !this.isLowerCase;
		if (this.isLowerCase) {
			this.lastName(this.lastName().toLowerCase());
		}
		else {
			this.lastName(this.lastName().toUpperCase());
		}
	},

	dispose: function() {
		ko.cleanNode(this.domElement);
	}

});
InfoModel.NAME = "InfoModel";
