var LoginVO = function(username, password){
	this.username = username;
	this.password = password;
};
LoginVO.prototype = {
	toString: function() {
		return "[LoginVO] " + " username: " + this.username + ", password: " + this.password;
	}
};

var EmployeeVO = function(id, name, age){
	this.id = id;
	this.name = name;
	this.age = age;
};
EmployeeVO.prototype = {
	toString: function() {
		return "[EmployeeVO] " + " id: " + this.id + ", name: " + this.name + ", age: " + this.age;
	}
};

