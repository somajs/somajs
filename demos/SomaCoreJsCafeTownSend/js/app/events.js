var LoginEvent = soma.Event.extend({
	constructor: function(type, loginVO, info) {
		return soma.Event.call(this, type, {loginVO:loginVO, info:info}, true, true);
	}
});
LoginEvent.LOGIN = "LoginEvent.LOGIN";
LoginEvent.LOGOUT = "LoginEvent.LOGOUT";
LoginEvent.MESSAGE = "LoginEvent.MESSAGE";
LoginEvent.ERROR = "LoginEvent.ERROR";
LoginEvent.SUCCESS = "LoginEvent.SUCCESS";

var EmployeeEvent = soma.Event.extend({
	constructor: function(type, employee) {
		return soma.Event.call(this, type, {employee:employee}, true, true );
	}
});
EmployeeEvent.SELECT = "EmployeeEvent.SELECT";
EmployeeEvent.DELETE = "EmployeeEvent.DELETE";
EmployeeEvent.CREATE = "EmployeeEvent.CREATE";
EmployeeEvent.EDIT = "EmployeeEvent.EDIT";

var NavigationEvent = soma.Event.extend({
	constructor: function(type, navigationID) {
		return soma.Event.call(this, type, {navigationID:navigationID}, true, true );
	}
});
NavigationEvent.SELECT = "NavigationEvent.SELECT";
