var NoteListView = soma.View.extend({
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
