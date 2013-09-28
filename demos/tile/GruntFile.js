module.exports = function(grunt) {

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-html-convert');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		meta:{
			version:'<%= pkg.version %>',
		},
		watch:{
			templates:{
				files:[
					'partials/*.html'
				],
				tasks:['htmlConvert']
			}
		},
		htmlConvert: {
			options: {
				base: 'partials',
				quoteChar: '\'',
				indentString: '	',
				indentGlobal: '	',
				prefix: '(function(global) {\n\n	\'use strict\';\n\n',
				suffix: '\n	// export\n\n	global.tile = global.tile || {};\n	global.tile.templates = templates;\n\n})(this);'
			},
			templates: {
				src: ['partials/*.tpl.html'],
				dest: 'js/app/models/templates.js'
			}
		}
	});

	grunt.registerTask('default', ['htmlConvert']);

}