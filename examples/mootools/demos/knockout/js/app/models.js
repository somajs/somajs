var InfoModel = new Class({

	Extends: soma.Model,

	domElement: null,

	firstName: null,
	lastName: null,
	fullName: null,

	isLowerCase: true,

	initialize: function(domElement) {
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

	changeCase: function() {
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
