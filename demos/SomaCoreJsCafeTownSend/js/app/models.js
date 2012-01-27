var EmployeeModel = soma.core.model.Model.extend({
	init: function() {
		this.data = [
			{
				'id': '0',
				'name': 'John',
				'age': '32'
			},
			{
				'id': '1',
				'name': 'Dave',
				'age': '21'
			},
			{
				'id': '2',
				'name': 'Sue',
				'age': '46'
			}
		];
	}
});
EmployeeModel.NAME = "Model::EmployeeModel";
