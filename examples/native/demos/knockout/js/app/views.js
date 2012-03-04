var InfoView = new soma.View.extend({

	init: function() {
		ko.applyBindings(this, this.domElement);
	},

	changeCase: function() {
		this.dispatchEvent(new CaseEvent(CaseEvent.CHANGE));
	},

	dispose: function() {
		ko.cleanNode(this.domElement);
	}

});
InfoView.NAME = "InfoView";
