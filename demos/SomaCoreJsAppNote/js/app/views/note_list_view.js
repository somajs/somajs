var NoteListView = new Class({

	Extends: soma.View,

	init: function() {
		console.log("create list view");
		console.log(this.domElement);
	},

	updateList: function(list) {
		this.domElement.innerHTML = '';
		var ul = document.createElement("ul");
		for (var i=0; i<list.length; i++) {
			var li = document.createElement("li");
			var title = document.createTextNode(list[i].title);
			li.appendChild(title);
			li.addEventListener("click", this.clickHandler, false);
			ul.appendChild(li);
		}
		this.domElement.appendChild(ul);
	},

	clickHandler: function() {
		console.log(this);
		console.log(this.textContent);
		this.dispatchEvent(new NoteEvent(NoteEvent.EDIT, null, this.textContent));
	},

	show: function() {
		this.domElement.style.display = "block";
	},

	hide: function() {
		this.domElement.style.display = "none";
	}

});
NoteListView.NAME = "View::NoteListView";
