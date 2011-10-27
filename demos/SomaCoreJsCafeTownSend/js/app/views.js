var LoginView = new Class({
	message: null,
	username: null,
	password: null,
	login: null,
	initialize: function() {
		console.log('init LoginView');
		this.message = document.getElementById('message');
		this.username = document.getElementById('username');
		this.password = document.getElementById('password');
		this.login = document.getElementById('login');
		this.login.addEventListener('click', this.clickHandler.bind(this));
	},
	clickHandler: function(event){
		event.preventDefault();
		var vo = new LoginVO(this.username.value, this.password.value);
		this.login.dispatchEvent(new LoginEvent(LoginEvent.LOGIN, vo, "Please wait..."));
	},
	showMessage: function(message) {
		this.message.innerHTML = message;
	}
});
LoginView.NAME = "View::LoginView";

var EmployeeListView = new Class({
	logout: null,
	tableList: null,
	tableListContainer: null,
	create: null,
	initialize: function() {
		console.log('init EmployeeListView');
		this.tableListContainer = document.getElementById('list-table-container');
		this.logout = document.getElementById('buttonLogoutList');
		this.logout.addEventListener('click', this.logoutClickHandler.bind(this));
		this.create = document.getElementById('buttonCreate');
		this.create.addEventListener('click', this.createClickHandler.bind(this));
	},
	logoutClickHandler: function(event){
		event.preventDefault();
		this.logout.dispatchEvent(new LoginEvent(LoginEvent.LOGOUT));
	},
	createClickHandler: function(event){
		event.preventDefault();
		this.create.dispatchEvent(new NavigationEvent(NavigationEvent.SELECT, NavigationConstants.EMPLOYEE_DETAILS));
	},
	updateList: function(data) {
		console.log("Update view with data:", data);
		this.tableListContainer.innerHTML = '<table cellpadding="0" cellspacing="0" border="0" width="100%" id="employee-list-table"><tr class="header"><th width="50%">Name</th><th>Age</th></tr></table>';
		this.tableList = document.getElementById('employee-list-table');
		for (var i = 0; i < data.length; i++) {
			var row = document.createElement("tr");
			var cellName = document.createElement("td");
			var cellAge = document.createElement("td");
			var textName = document.createTextNode(data[i].name);
			var textAge = document.createTextNode(data[i].age);
			cellName.appendChild(textName);
			cellAge.appendChild(textAge);
			row.appendChild(cellName);
			row.appendChild(cellAge);
			this.tableList.appendChild(row);
		}
	}
});
EmployeeListView.NAME = "View::EmployeeListView";

var EmployeeEditView = new Class({
	logout: null,
	cancel: null,
	submit: null,
	initialize: function() {
		console.log('init EmployeeEditView');
		this.logout = document.getElementById('buttonLogoutEdit');
		this.logout.addEventListener('click', this.logoutClickHandler.bind(this));
		this.cancel = document.getElementById('button-edit-cancel');
		this.cancel.addEventListener('click', this.cancelClickHandler.bind(this));
		this.submit = document.getElementById('button-edit-submit');
		this.submit.addEventListener('click', this.submitClickHandler.bind(this));
	},
	logoutClickHandler: function(event){
		event.preventDefault();
		this.logout.dispatchEvent(new LoginEvent(LoginEvent.LOGOUT));
	},
	cancelClickHandler: function(event) {
		event.preventDefault();
		this.cancel.dispatchEvent(new NavigationEvent(NavigationEvent.SELECT, NavigationConstants.EMPLOYEE_LIST));
	},
	submitClickHandler: function(event) {
		event.preventDefault();
		var vo = new EmployeeVO(new Date().getTime(), "qwe", "122")
		this.submit.dispatchEvent(new EmployeeEvent(EmployeeEvent.CREATE, vo));
		this.submit.dispatchEvent(new NavigationEvent(NavigationEvent.SELECT, NavigationConstants.EMPLOYEE_LIST));
	}
});
EmployeeEditView.NAME = "View::EmployeeEditView";

