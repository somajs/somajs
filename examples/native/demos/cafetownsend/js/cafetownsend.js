var CommandList = {
	START: "Event::Start"
};

var NavigationConstants = {
	LOGIN: 0,
	EMPLOYEE_LIST: 1,
	EMPLOYEE_DETAILS: 2
};

var SomaApplication = soma.Application.extend({
	registerCommands: function() {
		this.addCommand(CommandList.START, StartCommand);
		this.addCommand(NavigationEvent.SELECT, NavigationCommand);
	},
	registerWires: function() {
		this.addWire(NavigationWire.NAME, new NavigationWire);
		this.addWire(LoginWire.NAME, new LoginWire);
		this.addWire(EmployeeWire.NAME, new EmployeeWire);
	},
	registerViews: function() {
		this.addView(LoginView.NAME, new LoginView);
		this.addView(EmployeeListView.NAME, new EmployeeListView);
		this.addView(EmployeeEditView.NAME, new EmployeeEditView);
	},
	init: function() {
		this.dispatchEvent(new soma.Event(CommandList.START));
	}
});
new SomaApplication();
