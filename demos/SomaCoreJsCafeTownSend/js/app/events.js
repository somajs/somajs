var LoginEvent = new Class({

	Extends: soma.Event,

	initialize: function(type, loginVO, info) {
		return this.parent(type, true, true, {loginVO:loginVO, info:info});
	}

});
LoginEvent.LOGIN = "LoginEvent.LOGIN";
LoginEvent.LOGOUT = "LoginEvent.LOGOUT";
LoginEvent.MESSAGE = "LoginEvent.MESSAGE";
LoginEvent.ERROR = "LoginEvent.ERROR";
LoginEvent.SUCCESS = "LoginEvent.SUCCESS";

var EmployeeEvent = new Class({

	Extends: soma.Event,

	initialize: function(type, employee) {
		return this.parent(type, true, true, {employee:employee});
	}
	
});
EmployeeEvent.SELECT = "EmployeeEvent.SELECT";
EmployeeEvent.DELETE = "EmployeeEvent.DELETE";
EmployeeEvent.CREATE = "EmployeeEvent.CREATE";
EmployeeEvent.EDIT = "EmployeeEvent.EDIT";

var NavigationEvent = new Class({

	Extends: soma.Event,

	initialize: function(type, navigationID) {
		return this.parent(type, true, true, {navigationID:navigationID});
	}
	
});
NavigationEvent.SELECT = "NavigationEvent.SELECT";
