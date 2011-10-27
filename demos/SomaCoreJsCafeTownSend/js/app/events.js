var LoginEvent = new Class({
	Extends: soma.Event,
	initialize: function(type, loginVO, info) {
		console.log('LoginEvent >', type);
		this.addProp('loginVO', loginVO);
		if (loginVO) console.log('loginVO: ', loginVO);
		this.addProp('info', info);
		if (info) console.log('info: ', info);
		return this.parent(type, true, true);
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
		console.log('EmployeeEvent >', type);
		this.addProp('employee', employee);
		if (employee) console.log('employee: ', employee);
		return this.parent(type, true, true);
	}
});
EmployeeEvent.GET_ALL = "EmployeeEvent.GET_ALL";
EmployeeEvent.SELECT = "EmployeeEvent.SELECT";
EmployeeEvent.DELETE = "EmployeeEvent.DELETE";
EmployeeEvent.CREATE = "EmployeeEvent.CREATE";
EmployeeEvent.EDIT = "EmployeeEvent.EDIT";

var NavigationEvent = new Class({
	Extends: soma.Event,
	initialize: function(type, navigationID) {
		console.log('NavigationEvent >', type);
		this.addProp('navigationID', navigationID);
		if (navigationID) console.log('navigationID: ', navigationID);
		return this.parent(type, true, true);
	}
});
NavigationEvent.SELECT = "NavigationEvent.SELECT";
