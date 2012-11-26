module.exports = function(grunt) {
	grunt.initConfig({
		pkg:'<json:package.json>',
		meta:{
			version:'<%=pkg.version%>',
			banner:'/*! soma.js - v<%= meta.version %> - ' +
				'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
				'* http://www.soundstep.com/\n' +
				'* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
				'Soundstep */'
		},
		concat: {
			core: {
				src: [
					'libs/infuse.js',
					'libs/soma-events.js',
					'src/prefix.js',
					'src/utils.js',
					'src/core.js',
					'src/suffix.js'
				],
				dest: 'build/core/soma.js'
			},
			template: {
				src: [
					'libs/infuse.js',
					'libs/soma-events.js',
					'plugins/soma-template/src/soma-template.js',
					'plugins/soma-template/src/soma-template-plugin.js',
					'src/prefix.js',
					'src/utils.js',
					'src/core.js',
					'src/suffix.js'
				],
				dest: 'build/template/soma.js'
			}
		},
		min:{
			core:{
				src:['<banner:meta.banner>', '<config:concat.core.dest>'],
				dest:'build/core/soma-v<%= meta.version %>.min.js'
			},
			template:{
				src:['<banner:meta.banner>', '<config:concat.template.dest>'],
				dest:'build/template/soma-v<%= meta.version %>.min.js'
			}
		},
		uglify:{
			mangle:{
				except:['instance', 'injector'] // dont' mangle these for the soma-template-plugin
			}
		},
		watch:{
			scripts:{
				files:[
					'libs/*.js',
					'src/*.js',
					'grunt.js'
				],
				tasks:'concat min'
			}
		}
	});

	grunt.registerTask('default', 'concat min');
}