var LoginEvent = new Class({

	Extends: soma.Event,

	initialize: function(type, loginVO, info) {
		return this.parent(type, {loginVO:loginVO, info:info}, true, true );
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
		return this.parent(type, {employee:employee}, true, true );
	}
	
});
EmployeeEvent.SELECT = "EmployeeEvent.SELECT";
EmployeeEvent.DELETE = "EmployeeEvent.DELETE";
EmployeeEvent.CREATE = "EmployeeEvent.CREATE";
EmployeeEvent.EDIT = "EmployeeEvent.EDIT";

var NavigationEvent = new Class({

	Extends: soma.Event,

	initialize: function(type, navigationID) {
		return this.parent(type, {navigationID:navigationID}, true, true );
	}
	
});
NavigationEvent.SELECT = "NavigationEvent.SELECT";
