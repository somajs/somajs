var MyView = new Class({
	
});

var MyMediator = new Class({
	Extends: soma.core.mediator.Mediator
});

var m = new MyMediator(document.body);
console.log(m.viewElement);
m.dispose()
console.log(m.viewElement);

//var mediators = new soma.core.mediator.SomaMediators;
//mediators.mapView(MyView, MyMediator);


/*
soma.core.mediator.SomaMediators = new Class({

	classes: null,
	mediators: null,

	initialize: function(domElement, mediatorClass) {
		this.classes = [];
		this.mediators = [];
	},

	mapView: function(viewClass, mediatorClass) {
		if (!viewClass || !mediatorClass) return;
		if (this.isMapped(viewClass)) {
			throw new Error("Error in SomaMediators, the View Class is already mapped.");
		}
		//var viewClassName = getClassName(viewClass);
	},

	removeMapping: function(viewClass) {

	},

	isMapped: function(viewClass) {

	}

});
*/