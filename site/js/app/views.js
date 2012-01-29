NavigationView = soma.View.extend({

	id: null,
	currentSection: null,

	init: function() {
		
	},

	setup: function(id) {
		this.id = id;
		this.createLinks();
		this.select(NavigationConstants.ABOUT);
	},

	createLinks: function() {
		$(this.id + " li").click(this.clickHandler);
		$(this.id + " li a").removeAttr("href").css("cursor","pointer");;
	},

	clickHandler: function() {
		var navigationId = $(this).attr('id').split("-")[1];
		this.dispatchEvent(new NavigationEvent(NavigationEvent.SELECT, navigationId))
		return false;
	},

	getListElement: function() {
		return $(this.id + ' li[id*="' + this.currentSection + '"]');
	},

	clear: function() {
		$(this.id + " li").css("font-weight", "normal");
	},

	highlight: function() {
		this.clear();
		this.getListElement().css("font-weight", "bold");
	},

	select: function(navigationId) {
		this.currentSection = navigationId;
		this.highlight();
	},

	dispose: function() {
		
	}

});
NavigationView.NAME = "View::NavigationView";
