var StartCommand = soma.core.controller.Command.extend({
	execute: function(event) {
		switch(event.type) {
			case CommandList.START:
				// anything if you want to start your app from here
		}
	}
});

var LoginCommand = soma.core.controller.Command.extend({
	execute: function(event) {
		var wire = this.getWire(LoginWire.NAME);
		switch(event.type) {
			case LoginEvent.LOGIN:
				// login attempt
				if (!event.params.loginVO) return;
				var service = new LoginService();
				service.login(this, event.params.loginVO);
				this.dispatchEvent(new LoginEvent(LoginEvent.MESSAGE, null, event.params.info));
				break;
			case LoginEvent.LOGOUT:
				this.dispatchEvent(new LoginEvent(LoginEvent.MESSAGE, null, ""));
				this.dispatchEvent(new NavigationEvent(NavigationEvent.SELECT, NavigationConstants.LOGIN));
				break;
			case LoginEvent.SUCCESS:
				this.dispatchEvent(new LoginEvent(LoginEvent.MESSAGE, null, ""));
				this.dispatchEvent(new NavigationEvent(NavigationEvent.SELECT, NavigationConstants.EMPLOYEE_LIST));
				break;
			case LoginEvent.MESSAGE:
				wire.showMessage(event.params.info);
				break;
			case LoginEvent.ERROR:
				wire.showMessageError(event.params.info);
				break;
		}
	},
	fault: function(info){
		this.dispatchEvent(new LoginEvent(LoginEvent.ERROR, null, "Login Error, try again."));
	},
	result: function(data) {
		this.dispatchEvent(new LoginEvent(LoginEvent.SUCCESS, null, "Success"));
	}
});

var EmployeeCommand = soma.core.controller.Command.extend({
	execute: function(event) {
		var wire = this.getWire(EmployeeWire.NAME);
		var vo = event.params.employee;
		switch(event.type) {
			case EmployeeEvent.SELECT:
				wire.selectEmployee(vo);
				break;
			case EmployeeEvent.DELETE:
				wire.deleteEmployee(vo);
				break;
			case EmployeeEvent.CREATE:
				wire.createEmployee(vo);
				break;
			case EmployeeEvent.EDIT:
				wire.editEmployee(vo);
				break;
		}
	}
});

var NavigationCommand = soma.core.controller.Command.extend({
	execute: function(event) {
		this.getWire(NavigationWire.NAME).select(event.params.navigationID);
	}
});

