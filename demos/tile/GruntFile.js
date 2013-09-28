module.exports = function(grunt) {

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-html2js');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		meta:{
			version:'<%= pkg.version %>',
		},
		watch:{
			scripts:{
				templates:[
					'partials/*.html'
				],
				tasks:['html2js']
			}
		},
		html2js: {
			options: {
				base: 'partials',
				quoteChar: '\''
			},
			main: {
				src: ['partials/*.tpl.html'],
				dest: 'js/app/models/templates-temp.js'
			}
		}
	});

	grunt.registerTask('default', ['html2js']);

}