var LoginVO = new Class({

	username: null,
	password: null,

	initialize: function(username, password) {
		this.username = username;
		this.password = password;
	},

	toString: function() {
		return "[LoginVO] " + " username: " + this.username + ", password: " + this.password;
	}

});

var EmployeeVO = new Class({

	id: null,
	name: null,
	age: null,

	initialize: function(id, name, age) {
		this.id = id;
		this.name = name;
		this.age = age;
	},

	toString: function() {
		return "[EmployeeVO] " + " id: " + this.id + ", name: " + this.name + ", age: " + this.age;
	}

});

