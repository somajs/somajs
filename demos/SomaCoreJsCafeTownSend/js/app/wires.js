var LoginWire = new Class({
	Extends: soma.core.wire.Wire,
	init: function() {
		// commands
		this.addCommand(LoginEvent.LOGIN, LoginCommand);
		this.addCommand(LoginEvent.LOGOUT, LoginCommand);
		this.addCommand(LoginEvent.MESSAGE, LoginCommand);
		this.addCommand(LoginEvent.ERROR, LoginCommand);
		this.addCommand(LoginEvent.SUCCESS, LoginCommand);
	},
	showMessage: function(message) {
		this.getView(LoginView.NAME).showMessage(message);
	},
	showMessageError: function(message) {
		this.getView(LoginView.NAME).showMessageError(message);
	}
});
LoginWire.NAME = "Wire::LoginWire";

var EmployeeWire = new Class({
	Extends: soma.core.wire.Wire,
	init: function() {
		// models
		this.addModel(EmployeeModel.NAME, new EmployeeModel);
		// commands
		this.addCommand(EmployeeEvent.SELECT, EmployeeCommand);
		this.addCommand(EmployeeEvent.DELETE, EmployeeCommand);
		this.addCommand(EmployeeEvent.CREATE, EmployeeCommand);
		this.addCommand(EmployeeEvent.EDIT, EmployeeCommand);
		// listeners
		this.instance.addEventListener(NavigationEvent.SELECT, this.navigationHandler.bind(this));
	},
	navigationHandler: function(event) {
		if (event.params.navigationID == NavigationConstants.EMPLOYEE_LIST) {
			var data = this.getModel(EmployeeModel.NAME).data;
			this.getView(EmployeeListView.NAME).updateList(data);
		}
	},
	selectEmployee: function(vo) {
		this.getView(EmployeeEditView.NAME).updateFields(vo);
	},
	createEmployee: function(vo) {
		vo.id = new Date().getTime();
		this.getModel(EmployeeModel.NAME).data.push(vo);
	},
	deleteEmployee: function(vo) {
		var data = this.getModel(EmployeeModel.NAME).data;
		for (var i = 0; i < data.length; i++) {
			if (data[i].id == vo.id) {
				this.getModel(EmployeeModel.NAME).data.splice(i, 1);
				break;
			}
		}
	},
	editEmployee: function(vo) {
		var data = this.getModel(EmployeeModel.NAME).data;
		for (var i = 0; i < data.length; i++) {
			if (data[i].id == vo.id) {
				data[i].name = vo.name;
				data[i].age = vo.age;
				break;
			}
		}
	}
});
EmployeeWire.NAME = "Wire::EmployeeWire";

var NavigationWire = new Class({
	Extends: soma.core.wire.Wire,
	viewIds: null,
	init: function() {
		this.viewIds = [
			document.getElementById('screen-login-wrapper'),
			document.getElementById('screen-employee-list-wrapper'),
			document.getElementById('screen-employee-edit-wrapper')
		];
	},
	select: function(id) {
		for (var i = 0; i < this.viewIds.length; i++) {
			this.viewIds[i].style.display = 'none';
		}
		if (this.viewIds[id]) {
			this.viewIds[id].style.display = 'block';
		}
	}
});
NavigationWire.NAME = "Wire::NavigationWire";

