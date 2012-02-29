var LoginView = new Class({

	Extends: soma.View,

	message: null,
	username: null,
	password: null,
	login: null,
	
	init: function() {
		this.message = document.getElementById('message');
		this.username = document.getElementById('username');
		this.password = document.getElementById('password');
		this.login = document.getElementById('login');
		$(this.login).addEvent("click", this.clickHandler.bind(this));
	},

	clickHandler: function(event){
		if (event.preventDefault) event.preventDefault();
		var vo = new LoginVO(this.username.value, this.password.value);
		this.dispatchEvent(new LoginEvent(LoginEvent.LOGIN, vo, "Please wait..."));
		return false;
	},
	
	showMessage: function(message) {
		this.message.style.color = "#000000";
		this.message.innerHTML = message;
	},
	
	showMessageError: function(message) {
		console.log("---------", message);
		this.message.style.color = "#FF0000";
		this.message.innerHTML = message;
	}
	
});
LoginView.NAME = "View::LoginView";

var EmployeeListView = new Class({
	
	Extends: soma.View,

	logout: null,
	tableList: null,
	tableListContainer: null,
	create: null,
	
	init: function() {
		this.tableListContainer = document.getElementById('list-table-container');
		this.logout = document.getElementById('buttonLogoutList');
		$(this.logout).addEvent("click", this.logoutClickHandler.bind(this));
		this.create = document.getElementById('buttonCreate');
		$(this.create).addEvent("click", this.createClickHandler.bind(this));
	},

	logoutClickHandler: function(event){
		event.preventDefault();
		this.dispatchEvent(new LoginEvent(LoginEvent.LOGOUT));
	},

	createClickHandler: function(event){
		event.preventDefault();
		this.dispatchEvent(new NavigationEvent(NavigationEvent.SELECT, NavigationConstants.EMPLOYEE_DETAILS));
	},
	
	updateList: function(data) {
		this.tableListContainer.innerHTML = '<table cellpadding="0" cellspacing="0" border="0" width="100%" id="employee-list-table"><tr class="header"><th width="50%">Name</th><th>Age</th></tr></table>';
		this.tableList = document.getElementById('employee-list-table');
		// it is not possible without hacks to dispatch custom event from a DOM element with IE7 and IE8
		// the variable "self" keeps a reference to the view (soma.View) so an event can be dispatched from
		var self = this;
		for (var i = 0; i < data.length; i++) {
			var row = document.createElement("tr");
			var cellId = document.createElement("td");
			var cellName = document.createElement("td");
			var cellAge = document.createElement("td");
			var textId = document.createTextNode(data[i].id);
			var textName = document.createTextNode(data[i].name);
			var textAge = document.createTextNode(data[i].age);
			cellId.appendChild(textId);
			cellName.appendChild(textName);
			cellAge.appendChild(textAge);
			row.appendChild(cellId);
			row.appendChild(cellName);
			row.appendChild(cellAge);
			cellId.style.display = "none"; // hide id cell
			this.tableList.appendChild(row);
			$(row).addEvent("click", function() {
				var vo = new EmployeeVO();
				vo.id = self.getNodeContent(this.childNodes[0]);
				vo.name = self.getNodeContent(this.childNodes[1]);
				vo.age = self.getNodeContent(this.childNodes[2]);
				self.dispatchEvent(new EmployeeEvent(EmployeeEvent.SELECT, vo));
				self.dispatchEvent(new NavigationEvent(NavigationEvent.SELECT, NavigationConstants.EMPLOYEE_DETAILS));
			});
		}
	},
	getNodeContent: function(node) {
		return node.textContent ? node.textContent : node.innerText;
	}
});
EmployeeListView.NAME = "View::EmployeeListView";

var EmployeeEditView = new Class({

	Extends: soma.View,

	employee:null,
	logout: null,
	cancel: null,
	submit: null,
	deleteEmployee: null,
	inputName: null,
	inputAge: null,

	init: function() {
		this.logout = document.getElementById('buttonLogoutEdit');
		$(this.logout).addEvent('click', this.logoutClickHandler.bind(this));
		this.cancel = document.getElementById('button-edit-cancel');
		$(this.cancel).addEvent('click', this.cancelClickHandler.bind(this));
		this.submit = document.getElementById('button-edit-submit');
		$(this.submit).addEvent('click', this.submitClickHandler.bind(this));
		this.deleteEmployee = document.getElementById('buttonDelete');
		$(this.deleteEmployee).addEvent('click', this.deleteClickHandler.bind(this));
		this.inputName = document.getElementById('employeeName');
		this.inputAge = document.getElementById('employeeAge');
	},

	logoutClickHandler: function(event){
		event.preventDefault();
		this.leaveForm();
		this.dispatchEvent(new LoginEvent(LoginEvent.LOGOUT));
	},

	deleteClickHandler: function(event) {
		event.preventDefault();
		this.dispatchEvent(new EmployeeEvent(EmployeeEvent.DELETE, this.employee));
		this.leaveForm();
	},

	cancelClickHandler: function(event) {
		event.preventDefault();
		this.dispatchEvent(new NavigationEvent(NavigationEvent.SELECT, NavigationConstants.EMPLOYEE_LIST));
		this.leaveForm();
	},

	submitClickHandler: function(event) {
		event.preventDefault();
		if (this.employee == null) this.employee = new EmployeeVO();
		this.employee.name = this.inputName.value;
		this.employee.age = this.inputAge.value;
		if (this.employee.name == null || this.employee.name == "" || this.employee.age == null || this.employee.age == "") return;
		if (this.employee.id == null) {
			this.dispatchEvent(new EmployeeEvent(EmployeeEvent.CREATE, this.employee));
		}
		else {
			this.dispatchEvent(new EmployeeEvent(EmployeeEvent.EDIT, this.employee));
		}
		this.leaveForm();
	},

	leaveForm:function() {
		this.dispatchEvent(new NavigationEvent(NavigationEvent.SELECT, NavigationConstants.EMPLOYEE_LIST));
		this.inputName.value = "";
		this.inputAge.value = "";
		this.employee = null;
	},

	updateFields: function(vo) {
		this.employee = vo;
		this.inputName.value = this.employee.name;
		this.inputAge.value = this.employee.age;
	}

});
EmployeeEditView.NAME = "View::EmployeeEditView";

