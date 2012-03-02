var NoteListView = new Class({

	Extends: soma.View,

	init: function() {

	},

	updateList: function(list) {
		this.domElement.innerHTML = '';
		var ul = document.createElement("ul");
		for (var i=0; i<list.length; i++) {
			var li = document.createElement("li");
			var title = document.createTextNode(list[i].title);
			li.appendChild(title);
			// it is not possible without hacks to dispatch custom event from a DOM element with IE7 and IE8
			// the variable "self" keeps a reference to the view (soma.View) so an event can be dispatched from
			var self = this;
			$(li).addEvent("click", function() {
				self.dispatchEvent(new NoteEvent(NoteEvent.EDIT, null, this.textContent ? this.textContent : this.innerText));
			});
			ul.appendChild(li);
		}
		this.domElement.appendChild(ul);
	},

	clickHandler: function() {

	},

	show: function() {
		this.domElement.style.display = "block";
	},

	hide: function() {
		this.domElement.style.display = "none";
	}

});
NoteListView.NAME = "View::NoteListView";
