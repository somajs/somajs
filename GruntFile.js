module.exports = function(grunt) {

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		meta:{
			version:'<%= pkg.version %>',
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
				dest: 'build/soma.js'
			}
		},
		uglify: {
			options: {
				banner: '/* <%= pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %> - http://somajs.github.io/somajs - http://www.soundstep.com */',
				mangle: false
			},
			my_target: {
				files: {
					'build/soma-v<%= meta.version %>.min.js': ['<%= concat.core.dest %>']
				}
			}
		},
		watch:{
			scripts:{
				files:[
					'libs/*.js',
					'src/*.js',
					'plugins/**/*.js',
					'grunt.js'
				],
				tasks:['concat', 'uglify']
			}
		}
	});

	grunt.registerTask('default', ['concat', 'uglify']);

}