ExerciseModel = soma.Model.extend({
	init: function() {
		this.data = '// edit me and run the code\nlog("use the log method to print information");\n\n';
	},
	record: function(value) {
		this.data = value;
	},
	getRecord: function() {
		return this.data;
	}
});

